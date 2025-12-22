#!/usr/bin/env node

/**
 * MCP Server for Salesforce Agentforce API
 * 
 * This server enables AI agents (like ChatGPT) to interact with Salesforce
 * Agentforce agents, allowing them to have conversations with AI-powered
 * agents within Salesforce.
 * 
 * Supports both stdio (local) and HTTP/SSE (hosted) transports.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import dotenv from 'dotenv';
import { AgentforceClient } from './agentforce-client.js';
import * as agentforceTypes from './agentforce-types.js';
import { AGENTFORCE_TOOLS } from './agentforce-tool-definitions.js';

// Load environment variables
dotenv.config();

// Get BASE_URL from environment variable
const BASE_URL = process.env.BASE_URL || process.env.HEROKU_APP_URL || 'http://localhost:3000';
const DOMAIN = BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

/**
 * Session storage for managing sessions server-side
 */
const sessions = new Map<string, { sessionId: string; createdAt: number }>();

/**
 * Track recently sent messages to prevent duplicates
 * Key: sessionId:messageText, Value: timestamp
 */
const recentMessages = new Map<string, number>();

/**
 * Generate a simple session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * MCP Server Implementation
 */
class AgentforceMCPServer {
  private server: Server;
  private client: AgentforceClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'agentforce-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Initialize the Agentforce client with configuration
   */
  private initializeClient() {
    if (!this.client) {
      const serverUrl = process.env.AGENTFORCE_SERVER_URL;
      const agentId = process.env.AGENTFORCE_AGENT_ID;
      const clientId = process.env.AGENTFORCE_CLIENT_ID;
      const clientSecret = process.env.AGENTFORCE_CLIENT_SECRET;
      const orgId = process.env.AGENTFORCE_ORG_ID;

      if (!serverUrl || !agentId || !clientId || !clientSecret) {
        throw new Error(
          'Missing required environment variables: AGENTFORCE_SERVER_URL, AGENTFORCE_AGENT_ID, AGENTFORCE_CLIENT_ID, AGENTFORCE_CLIENT_SECRET'
        );
      }

      this.client = new AgentforceClient({
        serverUrl,
        agentId,
        clientId,
        clientSecret,
        orgId
      });
    }
    return this.client;
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools()
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const client = this.initializeClient();
        const result = await this.handleToolCall(client, name, args);

        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ],
          _meta: result._meta
        };
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error(`Error in tool ${name}:`, errorMessage);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`
            }
          ],
          isError: true
        };
      }
    });
  }

  /**
   * Define all available MCP tools
   */
  private getTools(): Tool[] {
    return AGENTFORCE_TOOLS;
  }

  /**
   * Handle tool calls
   */
  private async handleToolCall(
    client: AgentforceClient,
    toolName: string,
    args: any
  ): Promise<any> {
    let result: any;

    switch (toolName) {
      case 'create_agentforce_session':
        try {
          const sessionResponse = await client.createSession(args.context);
          
          // Store session server-side
          const mcpSessionId = generateSessionId();
          sessions.set(mcpSessionId, {
            sessionId: sessionResponse.sessionId,
            createdAt: Date.now()
          });

          result = {
            sessionId: mcpSessionId,
            agentforceSessionId: sessionResponse.sessionId,
            status: sessionResponse.status,
            message: 'Session created successfully. Use this sessionId for all subsequent calls.'
          };
        } catch (error: any) {
          throw new Error(`Failed to create session: ${error.message}`);
        }
        break;

      case 'send_agentforce_message':
        // Get the actual Agentforce session ID from our stored session
        const mcpSession = sessions.get(args.sessionId);
        if (!mcpSession) {
          throw new Error('Invalid sessionId. Please create a new session first.');
        }

        // Prevent duplicate messages
        const msgKey = `${args.sessionId}:${args.message}`;
        const now = Date.now();
        const lastSentTime = recentMessages.get(msgKey);
        if (lastSentTime && (now - lastSentTime) < 10000) {
          console.error(`Duplicate message blocked (sent ${now - lastSentTime}ms ago)`);
          result = {
            success: true,
            message: 'Message already sent',
            _duplicate: true
          };
          break;
        }
        recentMessages.set(msgKey, now);

        // Clean up old entries
        for (const [key, time] of recentMessages.entries()) {
          if (now - time > 30000) {
            recentMessages.delete(key);
          }
        }

        try {
          const messageResponse = await client.sendMessage(mcpSession.sessionId, {
            message: args.message,
            messageType: args.messageType || 'text'
          });

          result = {
            messageId: messageResponse.messageId,
            timestamp: messageResponse.timestamp,
            success: true,
            _nextAction: 'MANDATORY: Wait 3-5 seconds, then call get_agentforce_messages to get the agent\'s reply. After displaying it, continue polling if needed.'
          };
        } catch (error: any) {
          throw new Error(`Failed to send message: ${error.message}`);
        }
        break;

      case 'get_agentforce_messages':
        // Get the actual Agentforce session ID
        const getSession = sessions.get(args.sessionId);
        if (!getSession) {
          throw new Error('Invalid sessionId. Please create a new session first.');
        }

        try {
          const messagesResponse = await client.getMessages(
            getSession.sessionId,
            args.continuationToken
          );

          // Extract the most recent assistant/agent message
          const agentMessages = messagesResponse.messages
            .filter((msg: any) => msg.role === 'assistant' || msg.role === 'agent')
            .sort((a: any, b: any) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

          const mostRecentAgentMessage = agentMessages[0];

          result = {
            messages: messagesResponse.messages,
            mostRecentAgentMessage: mostRecentAgentMessage ? {
              message: mostRecentAgentMessage.message,
              role: mostRecentAgentMessage.role,
              timestamp: mostRecentAgentMessage.timestamp
            } : null,
            _instruction: mostRecentAgentMessage 
              ? `CRITICAL: Reply with ONLY the message text: "${mostRecentAgentMessage.message}". Do NOT add prefixes like "The agent said:" or "Here is the message:". Just output the text directly.`
              : 'No agent messages yet. Continue polling.'
          };
        } catch (error: any) {
          throw new Error(`Failed to get messages: ${error.message}`);
        }
        break;

      case 'get_agentforce_session_status':
        const statusSession = sessions.get(args.sessionId);
        if (!statusSession) {
          throw new Error('Invalid sessionId. Please create a new session first.');
        }

        try {
          const statusResponse = await client.getSessionStatus(statusSession.sessionId);
          result = {
            status: statusResponse.status,
            messageCount: statusResponse.messageCount,
            lastActivityAt: statusResponse.lastActivityAt
          };
        } catch (error: any) {
          throw new Error(`Failed to get session status: ${error.message}`);
        }
        break;

      case 'end_agentforce_session':
        const endSession = sessions.get(args.sessionId);
        if (!endSession) {
          throw new Error('Invalid sessionId. Please create a new session first.');
        }

        try {
          await client.endSession(endSession.sessionId);
          sessions.delete(args.sessionId);
          result = {
            success: true,
            message: 'Session ended successfully'
          };
        } catch (error: any) {
          throw new Error(`Failed to end session: ${error.message}`);
        }
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    return result;
  }

  /**
   * Start the server
   */
  async start() {
    const transport = process.env.MCP_TRANSPORT || 'stdio';

    if (transport === 'http' || transport === 'sse') {
      // HTTP/SSE mode for hosted deployment
      const port = parseInt(process.env.PORT || '3000', 10);
      const app = express();

      app.use(express.json());

      // Health check endpoint
      app.get('/', (req, res) => {
        res.json({
          status: 'ok',
          server: 'agentforce-mcp-server',
          version: '1.0.0'
        });
      });

      // MCP endpoint
      if (transport === 'sse') {
        // SSE mode
        app.post('/mcp', async (req, res) => {
          const transport = new SSEServerTransport('/mcp', res);
          await this.server.connect(transport);
        });
      } else {
        // HTTP mode (simple JSON-RPC)
        app.post('/mcp', async (req, res) => {
          try {
            const { method, params, id } = req.body;

            if (method === 'tools/list') {
              const tools = this.getTools();
              res.json({ jsonrpc: '2.0', id, result: { tools } });
            } else if (method === 'tools/call') {
              const client = this.initializeClient();
              const result = await this.handleToolCall(client, params.name, params.arguments || {});
              res.json({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                    }
                  ]
                }
              });
            } else {
              res.status(400).json({
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: 'Method not found' }
              });
            }
          } catch (error: any) {
            res.status(500).json({
              jsonrpc: '2.0',
              id: req.body.id,
              error: {
                code: -32000,
                message: error.message || String(error)
              }
            });
          }
        });
      }

      app.listen(port, () => {
        console.error(`Agentforce MCP Server running on port ${port} (${transport} mode)`);
        console.error(`Health check: http://localhost:${port}/`);
        console.error(`MCP endpoint: http://localhost:${port}/mcp`);
      });
    } else {
      // Stdio mode for local development
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('Agentforce MCP Server running in stdio mode');
    }
  }
}

// Start the server
const server = new AgentforceMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});


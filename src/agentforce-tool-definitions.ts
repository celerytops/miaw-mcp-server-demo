/**
 * Agentforce MCP Tool Definitions
 * Tools for interacting with Salesforce Agentforce agents
 */

export const AGENTFORCE_TOOLS: any[] = [
  {
    name: 'create_agentforce_session',
    title: 'Create Agentforce Session',
    description: 'Create a new session with the Agentforce agent. Returns a sessionId that must be used in all subsequent calls.',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'object',
          description: 'Optional context data to pass to the agent'
        }
      },
      required: [],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session identifier - SAVE THIS and pass to all other tools'
        },
        status: {
          type: 'string',
          description: 'Session status'
        }
      },
      required: ['sessionId']
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Connecting to Agentforce agent',
      'openai/toolInvocation/invoked': 'Connected to agent'
    }
  },
  {
    name: 'send_agentforce_message',
    title: 'Send Message to Agent',
    description: 'Send a text message to the Agentforce agent in an active session. After sending, call get_agentforce_messages to get the agent\'s reply.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID from create_agentforce_session (REQUIRED)'
        },
        message: {
          type: 'string',
          description: 'The message text to send to the agent'
        },
        messageType: {
          type: 'string',
          description: 'Optional message type (default: "text")'
        }
      },
      required: ['sessionId', 'message'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string',
          description: 'The sent message ID'
        },
        timestamp: {
          type: 'string',
          description: 'Message timestamp'
        },
        success: {
          type: 'boolean',
          description: 'Whether the message was sent successfully'
        }
      }
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Sending message to agent',
      'openai/toolInvocation/invoked': 'Message sent'
    }
  },
  {
    name: 'get_agentforce_messages',
    title: 'Get Agent Messages',
    description: 'Get messages from the Agentforce agent session. Returns all messages including the agent\'s responses. Reply VERBATIM with only the message text from the most recent agent response.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID from create_agentforce_session (REQUIRED)'
        },
        continuationToken: {
          type: 'string',
          description: 'Optional pagination token'
        }
      },
      required: ['sessionId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              messageId: { type: 'string' },
              message: { type: 'string' },
              role: { type: 'string', enum: ['user', 'assistant', 'system'] },
              timestamp: { type: 'string' }
            }
          },
          description: 'CRITICAL: Reply with ONLY the message text from the most recent assistant/agent entry. WRONG: "Here is the message: Hello" WRONG: "The agent said: Hello" RIGHT: "Hello" - Just output the message field value, nothing else.'
        }
      },
      required: ['messages']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Getting agent response',
      'openai/toolInvocation/invoked': 'Received agent response'
    }
  },
  {
    name: 'get_agentforce_session_status',
    title: 'Get Session Status',
    description: 'Check the status of an Agentforce session (active, ended, error).',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID from create_agentforce_session (REQUIRED)'
        }
      },
      required: ['sessionId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Current session status (active, ended, error)'
        },
        messageCount: {
          type: 'number',
          description: 'Number of messages in the session'
        },
        lastActivityAt: {
          type: 'string',
          description: 'Timestamp of last activity'
        }
      },
      required: ['status']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Checking session status',
      'openai/toolInvocation/invoked': 'Status retrieved'
    }
  },
  {
    name: 'end_agentforce_session',
    title: 'End Session',
    description: 'End an active Agentforce session. This closes the conversation with the agent.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID from create_agentforce_session (REQUIRED)'
        }
      },
      required: ['sessionId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Whether the session was ended successfully'
        }
      },
      required: ['success']
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Ending session',
      'openai/toolInvocation/invoked': 'Session ended'
    }
  }
];


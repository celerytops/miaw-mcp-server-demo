/**
 * Type definitions for Salesforce Agentforce API
 */

export interface AgentforceConfig {
  serverUrl: string; // e.g., https://shopperagent-production.sfdc-8tgtt5-ecom1.exp-delivery.com
  agentId: string; // Agentforce agent ID
  clientId: string; // OAuth2 Client ID from Connected App
  clientSecret: string; // OAuth2 Client Secret from Connected App
  orgId?: string; // Optional: Salesforce Org ID
}

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  instance_url?: string;
}

export interface CreateSessionRequest {
  sessionId?: string; // Optional: custom session ID
  context?: {
    [key: string]: any; // Additional context data
  };
}

export interface CreateSessionResponse {
  sessionId: string;
  status: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface SendMessageRequest {
  message: string;
  messageType?: string; // e.g., "text", "user_message"
  metadata?: {
    [key: string]: any;
  };
}

export interface MessageResponse {
  messageId: string;
  sessionId: string;
  message: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface SessionStatus {
  sessionId: string;
  status: 'active' | 'ended' | 'error';
  createdAt: string;
  lastActivityAt?: string;
  messageCount?: number;
}

export interface ListMessagesResponse {
  messages: MessageResponse[];
  hasMore?: boolean;
  continuationToken?: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}


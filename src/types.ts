/**
 * Type definitions for Salesforce Enhanced Chat (MIAW) API
 */

export interface MIAWConfig {
  scrtUrl: string;
  orgId: string;
  esDeveloperName: string;
  capabilitiesVersion?: string;
  platform?: string;
}

export interface AccessTokenRequest {
  orgId: string;
  esDeveloperName: string;
  capabilitiesVersion: string;
  platform: string;
  deviceId: string;
  context?: {
    appName?: string;
    clientVersion?: string;
  };
  captchaToken?: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  conversationContextId?: string;
  context?: {
    configuration?: any;
    conversationId?: string;
  };
}

export interface AuthenticatedTokenRequest extends AccessTokenRequest {
  jwt: string;
  subject: string;
}

export interface ContinuationTokenResponse {
  continuationToken: string;
  expiresIn: number;
}

export interface CreateConversationRequest {
  routableType?: string;
  routingAttributes?: Record<string, any>;
  capabilities?: string[];
  conversationContextId?: string;
  prechatDetails?: PrechatDetail[];
}

export interface PrechatDetail {
  label: string;
  name: string;
  value: string;
  displayToAgent: boolean;
}

export interface CreateConversationResponse {
  conversationId: string;
  conversationIdentifier: string;
  routingResult?: {
    routingType: string;
    status: string;
  };
}

export interface SendMessageRequest {
  message: {
    text?: string;
    staticContentId?: string;
    messageType?: string;
    format?: string;
  };
  clientTimestamp?: number;
  clientDuration?: number;
}

export interface SendMessageResponse {
  id: string;
  conversationId: string;
  entryType: string;
  timestamp: number;
  message: {
    text: string;
    messageType: string;
  };
}

export interface TypingIndicatorRequest {
  isTyping: boolean;
}

export interface SendFileRequest {
  file: {
    data: string; // Base64 encoded
    fileName: string;
    mimeType: string;
  };
  clientTimestamp?: number;
}

export interface ConversationRoutingStatus {
  conversationId: string;
  routingResult: {
    routingType: string;
    status: string;
    estimatedWaitTime?: number;
  };
}

export interface ConversationEntry {
  id: string;
  entryType: string;
  timestamp: number;
  sender?: {
    subject: string;
    role: string;
    displayName?: string;
  };
  message?: {
    text: string;
    messageType: string;
    abstractMessage?: any;
  };
  entryPayload?: any;
}

export interface ListConversationsResponse {
  conversations: Array<{
    conversationId: string;
    conversationIdentifier: string;
    status: string;
    createdDate: number;
    lastModifiedDate: number;
  }>;
}

export interface ListConversationEntriesResponse {
  entries: ConversationEntry[];
  continuationToken?: string;
}

export interface ConversationTranscript {
  conversationId: string;
  entries: ConversationEntry[];
  metadata?: any;
}

export interface DeliveryAcknowledgement {
  entryId: string;
  deliveryStatus: 'Delivered' | 'Read';
  clientTimestamp?: number;
}

export interface SendDeliveryAcknowledgementRequest {
  acknowledgements: DeliveryAcknowledgement[];
}

export interface RegisterDeviceRequest {
  deviceToken: string;
  deviceType: 'iOS' | 'Android';
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}


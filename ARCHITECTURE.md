# Architecture Documentation

This document describes the architecture and design decisions of the MIAW MCP Server.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [API Mapping](#api-mapping)
- [Error Handling](#error-handling)
- [Security Model](#security-model)

## Overview

The MIAW MCP Server is a bridge between Model Context Protocol (MCP) clients (like AI agents) and the Salesforce Enhanced Chat (MIAW) API. It translates MCP tool calls into REST API requests and manages authentication, session state, and error handling.

### Key Design Principles

1. **Simplicity**: Easy to configure and deploy
2. **Stateless Operation**: No persistent state required (tokens managed in-memory per session)
3. **Complete API Coverage**: All MIAW endpoints exposed as MCP tools
4. **Error Resilience**: Graceful error handling with detailed error messages
5. **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           MCP Client Layer                          │
│  (ChatGPT, Claude, or any MCP-compatible AI agent)                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ MCP Protocol (stdio)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      MIAW MCP Server                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              MCP Server (index.ts)                          │  │
│  │  • Request routing                                          │  │
│  │  • Tool registration                                        │  │
│  │  • Error handling                                           │  │
│  │  • Response formatting                                      │  │
│  └──────────────────────────┬──────────────────────────────────┘  │
│                             │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │              MIAWClient (index.ts)                          │  │
│  │  • Authentication management                                │  │
│  │  • Session state                                            │  │
│  │  • HTTP request handling                                    │  │
│  │  • Token auto-renewal                                       │  │
│  └──────────────────────────┬──────────────────────────────────┘  │
│                             │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │            Type Definitions (types.ts)                      │  │
│  │  • Request/Response types                                   │  │
│  │  • Configuration types                                      │  │
│  │  • Error types                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS REST API
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                 Salesforce Enhanced Chat API                        │
│                  (MIAW / Messaging in App & Web)                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. MCP Server Layer (`MIAWMCPServer` class)

**Responsibilities:**
- Initialize and manage the MCP server instance
- Register available tools with their schemas
- Route tool calls to appropriate handlers
- Format responses for MCP clients
- Handle MCP-specific errors

**Key Methods:**
- `setupHandlers()`: Registers MCP request handlers
- `getTools()`: Returns array of available MCP tools with schemas
- `handleToolCall()`: Routes tool calls to MIAWClient methods
- `start()`: Starts the server on stdio transport

### 2. MIAW Client Layer (`MIAWClient` class)

**Responsibilities:**
- Manage HTTP communication with Salesforce API
- Handle authentication token lifecycle
- Maintain session state
- Make REST API calls
- Parse and return responses

**Key Methods:**

**Authentication:**
- `generateGuestAccessToken()`: Unauthenticated user token
- `generateAuthenticatedAccessToken()`: JWT-based auth
- `generateContinuationToken()`: Session continuity
- `revokeToken()`: Token revocation
- `setAccessToken()`: Internal token management

**Conversation Management:**
- `createConversation()`: Start new chat
- `listConversations()`: Get all conversations
- `closeConversation()`: End a chat
- `getConversationRoutingStatus()`: Check status
- `endMessagingSession()`: End entire session

**Messaging:**
- `sendMessage()`: Send text message
- `listConversationEntries()`: Read messages
- `getConversationTranscript()`: Full history
- `sendTypingIndicator()`: Typing status
- `sendFile()`: File attachments
- `sendDeliveryAcknowledgements()`: Read receipts

**Push Notifications:**
- `registerDeviceForPushNotifications()`
- `unregisterDeviceFromPushNotifications()`

### 3. Type System (`types.ts`)

Comprehensive TypeScript interfaces for:
- Configuration (`MIAWConfig`)
- All request types (e.g., `AccessTokenRequest`, `SendMessageRequest`)
- All response types (e.g., `AccessTokenResponse`, `ConversationEntry`)
- Error responses (`ErrorResponse`)

## Data Flow

### Typical Request Flow

```
1. MCP Client sends tool call
   ↓
2. MCP Server receives via stdio
   ↓
3. MCP Server validates tool name and arguments
   ↓
4. MCP Server initializes MIAWClient (if needed)
   ↓
5. MCP Server calls corresponding MIAWClient method
   ↓
6. MIAWClient constructs HTTP request
   ↓
7. MIAWClient adds authentication header (if token exists)
   ↓
8. MIAWClient sends HTTPS request to Salesforce
   ↓
9. Salesforce processes request
   ↓
10. Salesforce returns JSON response
    ↓
11. MIAWClient parses response
    ↓
12. MIAWClient returns typed response object
    ↓
13. MCP Server formats response for MCP protocol
    ↓
14. MCP Server sends response via stdio
    ↓
15. MCP Client receives response
```

### Authentication Flow

```
First Request:
  Client → generate_guest_access_token()
    → MIAWClient POST /authorization/unauthenticated/access-token
    → Salesforce returns { accessToken, expiresIn, ... }
    → MIAWClient.setAccessToken() saves token
    → MIAWClient adds "Authorization: Bearer <token>" to all future requests

Subsequent Requests:
  Client → create_conversation() / send_message() / etc.
    → MIAWClient includes saved token in Authorization header
    → Requests succeed with authentication

Token Expiration:
  → Future request returns 401 Unauthorized
  → Client must call generate_guest_access_token() again
```

## API Mapping

### MCP Tool → Salesforce Endpoint

| MCP Tool | HTTP Method | Salesforce Endpoint |
|----------|-------------|---------------------|
| `generate_guest_access_token` | POST | `/authorization/unauthenticated/access-token` |
| `generate_authenticated_access_token` | POST | `/authorization/authenticated/access-token` |
| `generate_continuation_token` | GET | `/authorization/continuation-token` |
| `revoke_token` | DELETE | `/authorization/token` |
| `create_conversation` | POST | `/conversations` |
| `send_message` | POST | `/conversations/{id}/messages` |
| `send_typing_indicator` | POST | `/conversations/{id}/typing` |
| `list_conversation_entries` | GET | `/conversations/{id}/entries` |
| `get_conversation_transcript` | GET | `/conversations/{id}/transcript` |
| `get_conversation_routing_status` | GET | `/conversations/{id}/routing-status` |
| `send_delivery_acknowledgements` | POST | `/conversations/{id}/acknowledgements` |
| `send_file` | POST | `/conversations/{id}/files` |
| `close_conversation` | DELETE | `/conversations/{id}` |
| `list_conversations` | GET | `/conversations` |
| `end_messaging_session` | DELETE | `/messaging-session` |

## Error Handling

### Error Handling Strategy

1. **Network Errors**: Axios errors are caught and formatted
2. **API Errors**: Salesforce error responses are parsed and returned
3. **Validation Errors**: Missing parameters throw descriptive errors
4. **Authentication Errors**: 401/403 errors indicate token issues

### Error Response Format

```typescript
{
  error: true,
  message: "Human-readable error message",
  code: "ERROR_CODE",
  details: { /* Additional error context */ }
}
```

### Common Error Scenarios

| Error Type | Code | Handling |
|------------|------|----------|
| Missing Environment Variables | N/A | Thrown at initialization |
| Invalid Token | 401 | Client must regenerate token |
| Conversation Not Found | 404 | Verify conversationId |
| Rate Limit | 429 | Client should implement backoff |
| Service Unavailable | 503 | Retry with exponential backoff |

### Error Propagation

```
Salesforce API Error
  ↓
AxiosError thrown
  ↓
Caught in handleToolCall()
  ↓
Formatted as MCP error response
  ↓
Returned to MCP client with error details
```

## Security Model

### Authentication

**Guest Users (Unauthenticated):**
- No persistent identity
- Identified by deviceId
- Access token grants temporary permissions
- Suitable for public-facing chat

**Authenticated Users (JWT):**
- User identity verified via signed JWT
- JWT must be generated externally (per Salesforce docs)
- Provides user-specific context and permissions
- Required for accessing user-specific data

### Token Management

**Token Storage:**
- Tokens stored in-memory only
- Never persisted to disk
- Lost when server restarts (by design)

**Token Lifecycle:**
1. Client requests token with credentials
2. Server stores token in MIAWClient instance
3. Token automatically included in subsequent requests
4. Token expires after `expiresIn` seconds
5. Client must request new token after expiration

**Security Best Practices:**
- Never log tokens
- Never commit tokens to version control
- Use environment variables for sensitive config
- Rotate device IDs appropriately
- Use JWT auth for identified users

### Configuration Security

**Environment Variables:**
- All sensitive config via environment variables
- `.env` file excluded from version control
- Example file (`env.example`) provided without secrets

**Salesforce Configuration:**
- SCRT URL specific to your Salesforce instance
- Org ID identifies your Salesforce organization
- ES Developer Name identifies the deployment
- Deployment must be published and active

## Performance Considerations

### Request Optimization

**Connection Reuse:**
- Single Axios instance per MIAWClient
- HTTP keep-alive enabled by default
- Reduces connection overhead

**Token Caching:**
- Access token cached until expiration
- Eliminates unnecessary auth requests
- Improves latency for subsequent calls

### Scalability

**Stateless Design:**
- Each MCP server instance is independent
- No shared state between instances
- Easily horizontally scalable

**Resource Management:**
- Minimal memory footprint
- No persistent connections (polling is client responsibility)
- Automatic cleanup on server shutdown

## Extension Points

### Adding New Endpoints

To add a new MIAW API endpoint:

1. Add TypeScript types to `types.ts`
2. Add method to `MIAWClient` class
3. Add tool definition to `getTools()`
4. Add handler case to `handleToolCall()`

### Custom Middleware

To add request/response middleware:

```typescript
// In MIAWClient constructor
this.axiosInstance.interceptors.request.use(
  (config) => {
    // Modify request
    return config;
  }
);

this.axiosInstance.interceptors.response.use(
  (response) => {
    // Process response
    return response;
  }
);
```

### Logging and Monitoring

Add interceptors for:
- Request/response logging
- Performance timing
- Error tracking
- Metrics collection

## Testing Strategy

### Unit Tests
- Test MIAWClient methods independently
- Mock Axios for API calls
- Verify request formatting

### Integration Tests
- Test against Salesforce sandbox
- Verify end-to-end flows
- Test error scenarios

### MCP Protocol Tests
- Verify tool registration
- Test tool call handling
- Validate response formatting

## Deployment Considerations

### Environment Setup
- Node.js 18+ required
- TypeScript compilation step
- Environment variables must be configured

### Production Recommendations
- Use process manager (PM2, systemd)
- Implement request logging
- Add health check endpoint (if needed)
- Monitor error rates
- Set up alerts for failures

### High Availability
- Run multiple instances
- Use load balancer if exposing HTTP wrapper
- Implement circuit breakers for Salesforce API
- Add retry logic with exponential backoff

---

For implementation details, see the source code in `src/index.ts` and `src/types.ts`.

For usage information, see [README.md](README.md) and [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md).


# MIAW MCP Server - Usage Examples

This document provides detailed examples of how an AI agent (like ChatGPT) would use the MIAW MCP Server to interact with Salesforce Enhanced Chat.

## Table of Contents

- [Basic Guest User Flow](#basic-guest-user-flow)
- [Authenticated User Flow](#authenticated-user-flow)
- [Advanced Conversation Scenarios](#advanced-conversation-scenarios)
- [Error Handling](#error-handling)

## Basic Guest User Flow

This is the most common scenario where an AI agent escalates a conversation to a Salesforce agent without user authentication.

### Step 1: Generate Access Token

```json
Tool: generate_guest_access_token
Arguments:
{
  "deviceId": "b8c06d01-b410-4097-bd8a-03cc71862d24",
  "appName": "ChatGPT Assistant",
  "clientVersion": "1.0.0"
}

Response:
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "context": {
    "configuration": { ... },
    "conversationContextId": "context-123"
  }
}
```

**Notes:**
- The `deviceId` should be a unique identifier (UUID format recommended)
- The access token is automatically saved for subsequent requests
- Token expires after the time specified in `expiresIn` (seconds)

### Step 2: Create a Conversation

```json
Tool: create_conversation
Arguments:
{
  "capabilities": ["MessageRead", "MessageDelivered"],
  "prechatDetails": [
    {
      "label": "Name",
      "name": "ContactName",
      "value": "John Doe",
      "displayToAgent": true
    },
    {
      "label": "Email",
      "name": "ContactEmail",
      "value": "john.doe@example.com",
      "displayToAgent": true
    },
    {
      "label": "Issue",
      "name": "Issue",
      "value": "Need help with account access",
      "displayToAgent": true
    }
  ]
}

Response:
{
  "conversationId": "conv-abc123",
  "conversationIdentifier": "CONV-00001",
  "routingResult": {
    "routingType": "Queue",
    "status": "Queued"
  }
}
```

**Notes:**
- Save the `conversationId` for all future operations on this conversation
- `prechatDetails` provide context to the Salesforce agent
- Initial status is usually "Queued" until an agent is assigned

### Step 3: Check Routing Status

```json
Tool: get_conversation_routing_status
Arguments:
{
  "conversationId": "conv-abc123"
}

Response:
{
  "conversationId": "conv-abc123",
  "routingResult": {
    "routingType": "Agent",
    "status": "Connected",
    "estimatedWaitTime": 0
  }
}
```

**Status Values:**
- `Queued`: Waiting for an agent
- `Connected`: Connected to an agent
- `Transferred`: Being transferred to another agent
- `Closed`: Conversation has ended

### Step 4: Send a Message

```json
Tool: send_message
Arguments:
{
  "conversationId": "conv-abc123",
  "text": "Hi! I'm an AI assistant. The user needs help with their account access. They've been locked out for 3 days."
}

Response:
{
  "id": "msg-001",
  "conversationId": "conv-abc123",
  "entryType": "Message",
  "timestamp": 1699564800000,
  "message": {
    "text": "Hi! I'm an AI assistant...",
    "messageType": "StaticContentMessage"
  }
}
```

### Step 5: List Messages (Read Agent Response)

```json
Tool: list_conversation_entries
Arguments:
{
  "conversationId": "conv-abc123"
}

Response:
{
  "entries": [
    {
      "id": "msg-001",
      "entryType": "Message",
      "timestamp": 1699564800000,
      "sender": {
        "subject": "guest-user",
        "role": "EndUser"
      },
      "message": {
        "text": "Hi! I'm an AI assistant...",
        "messageType": "StaticContentMessage"
      }
    },
    {
      "id": "msg-002",
      "entryType": "Message",
      "timestamp": 1699564850000,
      "sender": {
        "subject": "agent-123",
        "role": "Agent",
        "displayName": "Sarah Johnson"
      },
      "message": {
        "text": "Hello! I'd be happy to help with the account access issue. Can you provide the account email?",
        "messageType": "StaticContentMessage"
      }
    }
  ]
}
```

**Entry Types:**
- `Message`: A text message
- `TypingStartedIndicator`: Agent started typing
- `TypingStoppedIndicator`: Agent stopped typing
- `ParticipantChanged`: Agent joined/left
- `RoutingResult`: Routing status changed

### Step 6: Send Typing Indicator

```json
Tool: send_typing_indicator
Arguments:
{
  "conversationId": "conv-abc123",
  "isTyping": true
}

Response:
{
  "success": true,
  "message": "Typing indicator sent"
}
```

**Note:** Set `isTyping: false` when you stop typing.

### Step 7: Continue Conversation

```json
Tool: send_message
Arguments:
{
  "conversationId": "conv-abc123",
  "text": "The account email is john.doe@example.com"
}
```

### Step 8: Send Read Receipts

```json
Tool: send_delivery_acknowledgements
Arguments:
{
  "conversationId": "conv-abc123",
  "acknowledgements": [
    {
      "entryId": "msg-002",
      "deliveryStatus": "Read",
      "clientTimestamp": 1699564860000
    }
  ]
}

Response:
{
  "success": true,
  "message": "Acknowledgements sent"
}
```

### Step 9: Close Conversation

```json
Tool: close_conversation
Arguments:
{
  "conversationId": "conv-abc123"
}

Response:
{
  "success": true,
  "message": "Conversation closed"
}
```

## Authenticated User Flow

For scenarios where you have authenticated users with JWTs:

### Step 1: Generate Authenticated Access Token

```json
Tool: generate_authenticated_access_token
Arguments:
{
  "jwt": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0...",
  "subject": "user-123",
  "deviceId": "b8c06d01-b410-4097-bd8a-03cc71862d24",
  "appName": "ChatGPT Assistant",
  "clientVersion": "1.0.0"
}

Response:
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Note:** The JWT must be properly signed according to Salesforce requirements. See [Authorization Guide](https://developer.salesforce.com/docs/service/messaging-api/guide/authorization.html).

The rest of the flow is identical to the guest user flow.

## Advanced Conversation Scenarios

### Sending Files

```json
Tool: send_file
Arguments:
{
  "conversationId": "conv-abc123",
  "fileData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "fileName": "screenshot.png",
  "mimeType": "image/png"
}

Response:
{
  "id": "msg-003",
  "conversationId": "conv-abc123",
  "entryType": "Message",
  "timestamp": 1699564900000,
  "message": {
    "text": "[File: screenshot.png]",
    "messageType": "StaticContentMessage"
  }
}
```

**Notes:**
- `fileData` must be base64 encoded
- Supported file types depend on your Salesforce configuration
- Common MIME types: `image/png`, `image/jpeg`, `application/pdf`, `text/plain`

### Maintaining Long Sessions

Use continuation tokens to prevent session timeout:

```json
Tool: generate_continuation_token
Arguments: {}

Response:
{
  "continuationToken": "token-xyz789",
  "expiresIn": 3600
}
```

**Note:** Call this periodically (e.g., every 30 minutes) during long conversations.

### Handling Multiple Conversations

List all active conversations:

```json
Tool: list_conversations
Arguments: {}

Response:
{
  "conversations": [
    {
      "conversationId": "conv-abc123",
      "conversationIdentifier": "CONV-00001",
      "status": "Active",
      "createdDate": 1699564800000,
      "lastModifiedDate": 1699564900000
    },
    {
      "conversationId": "conv-def456",
      "conversationIdentifier": "CONV-00002",
      "status": "Active",
      "createdDate": 1699565000000,
      "lastModifiedDate": 1699565100000
    }
  ]
}
```

### Getting Full Transcript

Retrieve the complete conversation history:

```json
Tool: get_conversation_transcript
Arguments:
{
  "conversationId": "conv-abc123"
}

Response:
{
  "conversationId": "conv-abc123",
  "entries": [
    { ... all messages and events ... }
  ],
  "metadata": {
    "participants": [...],
    "startTime": 1699564800000,
    "endTime": 1699565000000
  }
}
```

### Routing with Attributes

Create a conversation with specific routing:

```json
Tool: create_conversation
Arguments:
{
  "routableType": "Queue",
  "routingAttributes": {
    "priority": "High",
    "department": "Technical Support",
    "language": "en_US",
    "skillLevel": "Expert"
  },
  "capabilities": ["MessageRead", "MessageDelivered"]
}
```

## Error Handling

### Common Errors and Solutions

#### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token is invalid or expired",
    "details": {}
  }
}
```

**Solution:** Generate a new access token using `generate_guest_access_token` or `generate_authenticated_access_token`.

#### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Conversation not found",
    "details": {
      "conversationId": "conv-abc123"
    }
  }
}
```

**Solution:** Verify the conversationId is correct and the conversation hasn't been closed.

#### 429 Rate Limit

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

**Solution:** Wait for the specified time (in seconds) before retrying.

#### 503 Service Unavailable

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service is temporarily unavailable",
    "details": {}
  }
}
```

**Solution:** Implement exponential backoff and retry the request.

## Best Practices for AI Agents

1. **Always check routing status** before sending messages to ensure an agent is connected
2. **Send typing indicators** when composing longer messages for better UX
3. **Send read receipts** to acknowledge agent messages
4. **Handle timeouts gracefully** by using continuation tokens
5. **Provide context** in prechat details to help agents assist faster
6. **Close conversations** when done to free up agent resources
7. **Monitor for agent responses** by periodically calling `list_conversation_entries`
8. **Implement retry logic** for network errors and rate limits
9. **Log conversation IDs** for troubleshooting and analytics
10. **Respect rate limits** by batching operations when possible

## Polling Pattern Example

For real-time-like behavior, implement a polling pattern:

```
1. Create conversation
2. Send initial message
3. Start polling loop:
   a. Wait 2-5 seconds
   b. Call list_conversation_entries
   c. Check for new messages from agent
   d. Process new messages
   e. Send response if needed
   f. Repeat until conversation is closed
```

**Note:** In production, consider using webhooks or event streams if available for more efficient real-time updates.

---

For more information, see the main [README.md](README.md) and [Salesforce API Documentation](https://developer.salesforce.com/docs/service/messaging-api/overview).


/**
 * Complete tool definitions with ChatGPT-required fields
 */

export const MIAW_TOOLS: any[] = [
  {
    name: 'generate_guest_access_token',
    title: 'Generate Guest Session',
    description: 'Create a new guest session for messaging. Returns a sessionId that must be used in all subsequent calls. The session manages authentication internally.',
    inputSchema: {
      type: 'object',
      properties: {
        appName: { type: 'string', description: 'Name of the application (optional)' },
        clientVersion: { type: 'string', description: 'Version of the client (optional)' },
        captchaToken: { type: 'string', description: 'CAPTCHA token if required by deployment (optional)' }
      },
      required: [],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Session identifier - SAVE THIS and pass to all other tools' },
        expiresIn: { type: 'number', description: 'Session expiration in seconds' },
        message: { type: 'string', description: 'Status message' }
      },
      required: ['sessionId']
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Talking to Salesforce',
      'openai/toolInvocation/invoked': 'Salesforce responded'
    }
  },
  {
    name: 'create_conversation',
    title: 'Create Conversation',
    description: 'Create a new conversation with a Salesforce agent. After creating, call list_conversation_entries to get the agent\'s greeting and display it verbatim as your own words.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Session ID from generate_guest_access_token (REQUIRED)' },
        routableType: { type: 'string', description: 'Type of routing (e.g., "Queue", "Agent")' },
        routingAttributes: { type: 'object', description: 'Routing attributes' },
        capabilities: { type: 'array', items: { type: 'string' }, description: 'Client capabilities' },
        prechatDetails: { type: 'array', items: { type: 'object' }, description: 'Pre-chat form data' }
      },
      required: ['sessionId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'The conversation ID. SAVE THIS for future calls.' },
        status: { type: 'string', description: 'Current conversation status' }
      },
      required: ['conversationId']
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Talking to Salesforce',
      'openai/toolInvocation/invoked': 'Salesforce responded'
    }
  },
  {
    name: 'send_message',
    title: 'Send Message',
    description: 'Send a text message in an active conversation. After sending, call list_conversation_entries to get the agent\'s reply.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Session ID from generate_guest_access_token (REQUIRED)' },
        conversationId: { type: 'string', description: 'The ID of the conversation' },
        text: { type: 'string', description: 'The message text to send' },
        messageType: { type: 'string', description: 'Message type (default: "StaticContentMessage")' }
      },
      required: ['sessionId', 'conversationId', 'text'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        messageId: { type: 'string', description: 'The sent message ID' },
        timestamp: { type: 'number', description: 'Message timestamp' },
        success: { type: 'boolean', description: 'Whether the message was sent successfully' }
      }
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Talking to Salesforce',
      'openai/toolInvocation/invoked': 'Salesforce responded'
    }
  },
  {
    name: 'list_conversation_entries',
    title: 'List Conversation Messages',
    description: 'Get messages. Check _roleInfo: if isLiveAgent=false, reply VERBATIM with the Chatbot message. if isLiveAgent=true (role=Agent), call show_salesforce_chat. NEVER call show_salesforce_chat unless isLiveAgent=true.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Session ID from generate_guest_access_token (REQUIRED)' },
        conversationId: { type: 'string', description: 'The ID of the conversation' },
        continuationToken: { type: 'string', description: 'Optional pagination token' }
      },
      required: ['sessionId', 'conversationId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        entries: { type: 'array', items: { type: 'object' }, description: 'CRITICAL: Reply with ONLY the message text from the most recent entry. WRONG: "Here is the message: Hello" WRONG: "The agent said: Hello" RIGHT: "Hello" - Just output the text field value, nothing else.' }
      },
      required: ['entries']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Talking to Salesforce',
      'openai/toolInvocation/invoked': 'Salesforce responded'
    }
  },
  {
    name: 'get_conversation_routing_status',
    title: 'Get Conversation Status',
    description: 'Check if conversation is queued, connected to agent, or waiting. Use this after creating a conversation to verify an agent has been assigned before sending your first message.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Session ID from generate_guest_access_token (REQUIRED)' },
        conversationId: { type: 'string', description: 'The ID of the conversation' }
      },
      required: ['sessionId', 'conversationId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Current routing status' },
        estimatedWaitTime: { type: 'number', description: 'Estimated wait time in seconds' }
      },
      required: ['status']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Talking to Salesforce',
      'openai/toolInvocation/invoked': 'Salesforce responded'
    }
  },
  {
    name: 'close_conversation',
    title: 'Close Conversation',
    description: 'Close an active conversation. This ends the chat session.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Session ID from generate_guest_access_token (REQUIRED)' },
        conversationId: { type: 'string', description: 'The ID of the conversation to close' }
      },
      required: ['sessionId', 'conversationId'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether the conversation was closed successfully' }
      },
      required: ['success']
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    _meta: {
      'openai/toolInvocation/invoking': 'Talking to Salesforce',
      'openai/toolInvocation/invoked': 'Salesforce responded'
    }
  },
  {
    name: 'show_salesforce_chat',
    title: 'Transfer to Live Agent Chat',
    description: 'ONLY call when _roleInfo.isLiveAgent=true AND _roleInfo.mostRecentSenderRole="Agent". NEVER call if role is Chatbot/System/EndUser. This is for HUMAN agents only, not AI chatbots.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'REQUIRED: _roleInfo.sessionIdToUse' },
        conversationId: { type: 'string', description: 'REQUIRED: _roleInfo.conversationIdToUse' },
        agentName: { type: 'string', description: 'REQUIRED: _roleInfo.mostRecentSenderName (the human agent name)' }
      },
      required: ['sessionId', 'conversationId', 'agentName'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether the chat widget was displayed successfully' },
        message: { type: 'string', description: 'Status message' }
      }
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: {
      'openai/outputTemplate': 'ui://widget/salesforce-chat.html',
      'openai/toolInvocation/invoking': 'Connecting to live agent',
      'openai/toolInvocation/invoked': 'Connected to agent',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true
    }
  }
];


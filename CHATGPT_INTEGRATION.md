# ChatGPT Integration Guide

This guide explains how to integrate the MIAW MCP Server with ChatGPT or other AI agents to enable intelligent escalation to Salesforce agents.

## Overview

The typical use case is:
1. User interacts with ChatGPT (or another AI agent)
2. The AI determines it needs help from a human expert or specialized Salesforce AI agent
3. The AI uses the MIAW MCP Server to initiate a Salesforce chat session
4. The AI relays messages between the user and the Salesforce agent
5. Once resolved, the AI closes the conversation

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌────────────────┐
│    User     │────▶│   ChatGPT/AI     │────▶│  MIAW MCP       │────▶│   Salesforce   │
│             │◀────│     Agent        │◀────│    Server       │◀────│  Service Cloud │
└─────────────┘     └──────────────────┘     └─────────────────┘     └────────────────┘
```

## Setup with ChatGPT

### For Claude Desktop (Primary Method)

1. **Install Claude Desktop** (which has MCP support built-in)

2. **Configure the MCP Server**

   Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

   ```json
   {
     "mcpServers": {
       "miaw": {
         "command": "node",
         "args": ["/absolute/path/to/MIAW MCP Server/dist/index.js"],
         "env": {
           "MIAW_SCRT_URL": "mycompany.salesforce-scrt.com",
           "MIAW_ORG_ID": "00Dxx0000000xxx",
           "MIAW_ES_DEVELOPER_NAME": "MyDeploymentName"
         }
       }
     }
   }
   ```

   On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. **Restart Claude Desktop**

4. **Verify the Integration**

   In Claude, ask: *"What MCP tools do you have access to?"*
   
   You should see the MIAW tools listed.

### For OpenAI ChatGPT (Custom GPT with Actions)

If you want to use this with OpenAI's ChatGPT, you'll need to create a wrapper HTTP API that calls the MCP server, or use a platform that supports MCP integration.

**Option 1: Use MCP-to-HTTP Bridge**
- Deploy an MCP-to-HTTP adapter service
- Configure as a Custom GPT Action
- Point the action endpoints to your adapter

**Option 2: Direct Integration** (Advanced)
- Build a custom application that embeds both ChatGPT API and MCP client
- Handle the orchestration in your application code

## Example Conversation Flow

### Scenario: User Needs Technical Support

**User:** "I can't log into my account. I've tried resetting my password twice but still can't get in."

**AI Agent (Internal reasoning):** *This is a technical issue that requires account access. I should escalate to a Salesforce agent.*

**AI Agent (Actions):**

1. **Generate Access Token**
   ```
   Tool: generate_guest_access_token
   Args: { deviceId: "unique-session-id-123" }
   ```

2. **Create Conversation**
   ```
   Tool: create_conversation
   Args: {
     capabilities: ["MessageRead", "MessageDelivered"],
     prechatDetails: [
       {
         label: "Issue Type",
         name: "IssueType",
         value: "Account Access",
         displayToAgent: true
       },
       {
         label: "Attempted Solutions",
         name: "AttemptedSolutions",
         value: "Password reset attempted twice",
         displayToAgent: true
       }
     ]
   }
   Result: { conversationId: "conv-123" }
   ```

3. **Check Routing Status**
   ```
   Tool: get_conversation_routing_status
   Args: { conversationId: "conv-123" }
   Result: { status: "Queued", estimatedWaitTime: 120 }
   ```

**AI Agent → User:** "I'm connecting you with a technical support specialist. Estimated wait time is about 2 minutes."

4. **Poll for Agent Connection**
   ```
   (Every 5 seconds)
   Tool: get_conversation_routing_status
   Args: { conversationId: "conv-123" }
   Result: { status: "Connected" }
   ```

**AI Agent → User:** "You're now connected with a support agent. I'll relay your messages."

5. **Send Initial Message to Agent**
   ```
   Tool: send_message
   Args: {
     conversationId: "conv-123",
     text: "User reports: Cannot log into account. Password reset attempted twice with no success. User needs immediate assistance."
   }
   ```

6. **Monitor for Agent Response**
   ```
   (Every 2-3 seconds)
   Tool: list_conversation_entries
   Args: { conversationId: "conv-123" }
   Result: {
     entries: [
       { ... user message ... },
       {
         sender: { role: "Agent", displayName: "Sarah" },
         message: { text: "Hi! I'm Sarah. I can help you with that. Can you tell me the email address associated with your account?" }
       }
     ]
   }
   ```

**AI Agent → User:** "Sarah (Support Agent): Hi! I can help you with that. Can you tell me the email address associated with your account?"

**User:** "It's john.doe@example.com"

7. **Relay User Response**
   ```
   Tool: send_typing_indicator
   Args: { conversationId: "conv-123", isTyping: true }
   
   Tool: send_message
   Args: {
     conversationId: "conv-123",
     text: "john.doe@example.com"
   }
   
   Tool: send_typing_indicator
   Args: { conversationId: "conv-123", isTyping: false }
   ```

8. **Continue Message Relay Loop**

   *(Continue polling for agent messages and relaying user responses)*

**Agent:** "I've found your account. I can see there was a security lock placed on it. I'm removing that now. Please try logging in again in about 2 minutes."

**User:** "Great, thank you! I'll try that."

**User:** "It worked! I'm back in. Thanks so much!"

9. **Send Final Message and Close**
   ```
   Tool: send_message
   Args: {
     conversationId: "conv-123",
     text: "It worked! I'm back in. Thanks so much!"
   }
   
   (Wait for agent confirmation)
   
   Tool: close_conversation
   Args: { conversationId: "conv-123" }
   ```

**AI Agent → User:** "Perfect! I'm glad Sarah was able to resolve your account access issue. The conversation has been closed. Is there anything else I can help you with?"

## AI Agent Decision Logic

### When to Escalate to Salesforce

The AI agent should escalate when:

✅ **Account-specific issues** that require access to customer data
✅ **Billing or payment problems** requiring account modification
✅ **Technical issues** beyond the AI's troubleshooting capability
✅ **Policy exceptions** or special requests requiring human judgment
✅ **Emotional situations** where empathy and human touch are important
✅ **Complex multi-step processes** requiring personalized guidance
✅ **Security concerns** like unauthorized access or fraud
✅ **User explicitly requests** to speak with a human

### When NOT to Escalate

❌ **General questions** that the AI can answer accurately
❌ **Simple how-to inquiries** with clear documentation
❌ **Status checks** that can be automated
❌ **FAQs** and common issues with known solutions
❌ **Navigation help** within an application
❌ **Password resets** that can be self-service (unless repeated failures)

### Escalation Decision Flowchart

```
User Query
    │
    ├─ Can I answer this accurately? ──YES──▶ Provide Answer
    │                                          │
    │                                          ├─ Did it help? ──YES──▶ Done
    │                                          │
    │                                          └─ NO ──▶ Continue ──▶ Escalate
    │
    └─ NO ──▶ Does it require account access? ──YES──▶ Escalate
              │
              └─ NO ──▶ Is it a sensitive/emotional issue? ──YES──▶ Escalate
                        │
                        └─ NO ──▶ Did user request human? ──YES──▶ Escalate
                                  │
                                  └─ NO ──▶ Provide Answer
```

## Code Example: AI Agent Logic

Here's pseudocode for how an AI agent might implement this:

```typescript
class AIAgentWithEscalation {
  private activeConversation: string | null = null;
  private deviceId: string = generateUUID();

  async handleUserMessage(userMessage: string) {
    // If already in escalation mode, relay message
    if (this.activeConversation) {
      return await this.relayMessageToAgent(userMessage);
    }

    // Analyze if escalation is needed
    const needsEscalation = await this.analyzeForEscalation(userMessage);

    if (needsEscalation) {
      return await this.escalateToSalesforce(userMessage);
    } else {
      return await this.respondDirectly(userMessage);
    }
  }

  async analyzeForEscalation(message: string): Promise<boolean> {
    // Use AI to determine if escalation is needed
    const analysis = await this.analyzeIntent(message);
    
    return (
      analysis.requiresAccountAccess ||
      analysis.isTechnicalIssue ||
      analysis.isComplaint ||
      analysis.explicitHumanRequest ||
      analysis.sentimentScore < -0.5 // Negative sentiment
    );
  }

  async escalateToSalesforce(initialMessage: string) {
    // 1. Generate access token
    const { accessToken } = await mcpClient.call('generate_guest_access_token', {
      deviceId: this.deviceId
    });

    // 2. Create conversation with context
    const { conversationId } = await mcpClient.call('create_conversation', {
      prechatDetails: this.extractPrechatDetails(initialMessage)
    });

    this.activeConversation = conversationId;

    // 3. Wait for agent
    await this.waitForAgent(conversationId);

    // 4. Send initial message
    await mcpClient.call('send_message', {
      conversationId,
      text: `User message: ${initialMessage}`
    });

    // 5. Start message relay loop
    this.startMessageRelayLoop(conversationId);

    return "Connecting you with a specialist...";
  }

  async relayMessageToAgent(message: string) {
    if (!this.activeConversation) return;

    // Send typing indicator
    await mcpClient.call('send_typing_indicator', {
      conversationId: this.activeConversation,
      isTyping: true
    });

    // Send message
    await mcpClient.call('send_message', {
      conversationId: this.activeConversation,
      text: message
    });

    // Stop typing indicator
    await mcpClient.call('send_typing_indicator', {
      conversationId: this.activeConversation,
      isTyping: false
    });

    return "Message sent to agent. Waiting for response...";
  }

  async startMessageRelayLoop(conversationId: string) {
    let lastEntryId = null;

    const pollInterval = setInterval(async () => {
      const { entries } = await mcpClient.call('list_conversation_entries', {
        conversationId
      });

      // Find new messages from agent
      const newMessages = entries.filter(
        entry => 
          entry.sender.role === 'Agent' && 
          entry.id !== lastEntryId
      );

      for (const msg of newMessages) {
        // Show message to user
        this.displayToUser(`${msg.sender.displayName}: ${msg.message.text}`);
        lastEntryId = msg.id;

        // Send read receipt
        await mcpClient.call('send_delivery_acknowledgements', {
          conversationId,
          acknowledgements: [{
            entryId: msg.id,
            deliveryStatus: 'Read'
          }]
        });
      }

      // Check if conversation ended
      const status = await mcpClient.call('get_conversation_routing_status', {
        conversationId
      });

      if (status.routingResult.status === 'Closed') {
        clearInterval(pollInterval);
        this.activeConversation = null;
        this.displayToUser("Conversation with agent has ended.");
      }
    }, 3000); // Poll every 3 seconds
  }
}
```

## Best Practices for AI Agents

### 1. **Transparent Communication**
Always inform the user when:
- Connecting to an agent
- Waiting in queue
- Relaying messages
- Closing the conversation

### 2. **Context Preservation**
Include relevant context in prechat details:
- User's issue summary
- Previous troubleshooting attempts
- User sentiment/urgency
- Relevant account identifiers (if known)

### 3. **Graceful Handling**
- Handle errors gracefully (agent unavailable, timeout, etc.)
- Provide estimated wait times when available
- Offer alternatives if escalation fails

### 4. **Session Management**
- Keep track of active conversations
- Use continuation tokens for long sessions
- Clean up resources when conversations end

### 5. **Read Receipts**
Always send read receipts when receiving agent messages to confirm delivery.

### 6. **Typing Indicators**
Send typing indicators to provide real-time feedback to agents.

### 7. **Message Formatting**
- Keep messages clear and concise
- Format multi-part information properly
- Indicate when messages are from the user vs. AI summary

## Testing Your Integration

### Test Checklist

- [ ] AI can generate access tokens successfully
- [ ] AI can create conversations with proper context
- [ ] AI correctly detects when escalation is needed
- [ ] AI relays messages bidirectionally without errors
- [ ] AI sends typing indicators appropriately
- [ ] AI sends read receipts for agent messages
- [ ] AI detects when agent closes conversation
- [ ] AI handles errors gracefully (no agent available, timeout, etc.)
- [ ] AI provides appropriate feedback to user throughout process
- [ ] AI cleans up resources after conversation ends

### Test Scenarios

1. **Happy Path**: Successful escalation and resolution
2. **No Agent Available**: Handle gracefully, offer retry or alternative
3. **Agent Timeout**: Detect and inform user
4. **Multiple Messages**: Ensure proper ordering and delivery
5. **User Disconnects**: Handle cleanup properly
6. **Long Conversation**: Test continuation tokens
7. **File Sharing**: Test if your use case needs file attachments

## Monitoring and Analytics

Consider tracking:
- Escalation rate (% of conversations escalated)
- Escalation reasons (categorize why escalations happen)
- Average wait time for agent connection
- Average conversation duration with agents
- User satisfaction after agent interaction
- Issues resolved by AI vs. requiring escalation

This data helps improve AI performance and escalation decision-making over time.

## Security Considerations

- **Never log sensitive information** (passwords, payment details, etc.)
- **Validate user input** before sending to Salesforce
- **Use JWT authentication** for identified users when possible
- **Rotate device IDs** appropriately for privacy
- **Follow data retention policies** for conversation transcripts
- **Implement rate limiting** to prevent abuse

---

For more information, see:
- [README.md](README.md) - Complete setup guide
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Detailed API examples
- [QUICK_START.md](QUICK_START.md) - Quick setup guide


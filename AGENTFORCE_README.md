# Salesforce Agentforce MCP Server

Connect ChatGPT to your Salesforce Agentforce agent so your AI assistant can seamlessly interact with your Agentforce-powered agents.

## 🎯 What This Does

This MCP (Model Context Protocol) server enables ChatGPT to:
- Start sessions with your Agentforce agent
- Send and receive messages in real-time
- Maintain conversation context throughout the interaction
- Handle session management automatically

Perfect for when you want ChatGPT to leverage your custom Agentforce agents for specialized tasks.

## ⚡ Quick Start

### Prerequisites

1. **Salesforce Org** with Agentforce enabled
   - Agentforce agent created and configured
   - Connected App created with OAuth2 Client Credentials flow
   - API access enabled

2. **Heroku Account** (for deployment)
   - Sign up or sign in at [heroku.com](https://heroku.com)
   - Create an app to host the MCP Server

3. **ChatGPT Plus or Team**
   - For MCP Connectors: Developer Mode enabled in Settings
   - For Custom GPT: Create your own custom GPT

4. **Tools Installed**
   - Git
   - Node.js 18+ (for local testing, optional)

### Step 1: Get Agentforce API Details

You need the following information from your Salesforce org:

1. **Server URL** - Your Agentforce instance URL
   - Example: `https://shopperagent-production.sfdc-8tgtt5-ecom1.exp-delivery.com`
   - Or your Salesforce instance URL if different

2. **Agent ID** - Your Agentforce agent's unique identifier
   - Found in Agentforce settings or API configuration

3. **OAuth2 Credentials** - From your Connected App
   - Client ID
   - Client Secret
   - Make sure the Connected App supports Client Credentials flow

### Step 2: Deploy to Heroku

1. **Clone and prepare the repository:**
   ```bash
   git clone <your-repo-url>
   cd miaw-mcp-server-demo
   ```

2. **Create a Heroku app:**
   ```bash
   heroku create your-agentforce-mcp-server
   ```

3. **Set environment variables in Heroku:**
   ```bash
   heroku config:set AGENTFORCE_SERVER_URL="https://your-instance-url.com"
   heroku config:set AGENTFORCE_AGENT_ID="your-agent-id"
   heroku config:set AGENTFORCE_CLIENT_ID="your-client-id"
   heroku config:set AGENTFORCE_CLIENT_SECRET="your-client-secret"
   heroku config:set AGENTFORCE_ORG_ID="your-org-id"  # Optional
   heroku config:set BASE_URL="https://your-app-name.herokuapp.com"
   heroku config:set MCP_TRANSPORT="http"
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Step 3: Update package.json for Agentforce

Add a script to run the Agentforce server:

```json
{
  "scripts": {
    "start:agentforce": "node dist/agentforce-index.js",
    "build": "tsc"
  }
}
```

Update the Procfile to use the Agentforce server:
```
web: node dist/agentforce-index.js
```

### Step 4: Connect to ChatGPT

#### Deploy to ChatGPT:

1. Go to ChatGPT → Profile → Settings → Apps & Connectors → Advanced Settings → Developer Mode "On" → Back
2. Click "Create" in the top right corner
3. Add an image for the Icon (Optional)
4. Name your Connector (e.g., "Agentforce MCP Server")
5. Add a Description (how/when should ChatGPT use the Connector?)
6. Enter your Heroku URL to the "MCP Server URL": `https://your-app-name.herokuapp.com/mcp`
7. Set Authentication as "No authentication"
8. Check the "I understand and want to continue..." box
9. Click the "Create" button
10. Done! The Connector will be connected to your ChatGPT
11. Test out the connection!

## 🚀 How It Works

### Conversation Flow

```
User → ChatGPT: "I need help with my order"
ChatGPT → MCP Server: create_agentforce_session()
MCP Server → Agentforce: Create session + Authenticate
Agentforce → MCP Server: sessionId
ChatGPT → MCP Server: send_agentforce_message(sessionId, "I need help with my order")
MCP Server → Agentforce: Send message
Agentforce → MCP Server: Process message + Generate response
ChatGPT → MCP Server: get_agentforce_messages(sessionId)
MCP Server → Agentforce: Get messages
Agentforce → MCP Server: Agent response
MCP Server → ChatGPT: "Here's how I can help with your order..."
ChatGPT → User: "Here's how I can help with your order..."
```

### Authentication

The server uses OAuth2 Client Credentials flow:
- Automatically authenticates on first request
- Caches access tokens
- Refreshes tokens when expired
- All authentication happens server-side (ChatGPT never sees tokens)

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Agentforce credentials:
# AGENTFORCE_SERVER_URL=https://your-instance-url.com
# AGENTFORCE_AGENT_ID=your-agent-id
# AGENTFORCE_CLIENT_ID=your-client-id
# AGENTFORCE_CLIENT_SECRET=your-client-secret
# AGENTFORCE_ORG_ID=your-org-id (optional)

# Build
npm run build

# Run locally (stdio mode for testing with Claude Desktop)
MCP_TRANSPORT=stdio node dist/agentforce-index.js

# Or run HTTP mode (for testing with curl)
MCP_TRANSPORT=http PORT=3000 node dist/agentforce-index.js
```

### Testing with cURL

```bash
# Health check
curl http://localhost:3000/

# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/list",
    "params":{}
  }'

# Create session
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"create_agentforce_session",
      "arguments":{}
    }
  }'
```

## 🐛 Troubleshooting

### "Error creating connector" or "Connection closed"

**Solution:** Make sure your Heroku app is using the `/mcp` endpoint:
```
https://your-app-name.herokuapp.com/mcp
```

### "Authentication failed" or "401 Unauthorized"

**Cause:** Invalid OAuth2 credentials or incorrect token endpoint.

**Solution:**
1. Verify `AGENTFORCE_CLIENT_ID` and `AGENTFORCE_CLIENT_SECRET` are correct
2. Verify `AGENTFORCE_SERVER_URL` points to the correct instance
3. Check that your Connected App supports Client Credentials flow
4. Verify the token endpoint URL (may need to adjust in `agentforce-client.ts`)

### "Failed to create session" or "404 Not Found"

**Cause:** Incorrect API endpoint or agent ID.

**Solution:**
1. Verify `AGENTFORCE_AGENT_ID` is correct
2. Check that the API base URL format is correct
3. Verify Agentforce API endpoints match your instance (may need to adjust in `agentforce-client.ts`)

### Messages arrive late or not at all

**Cause:** API polling may need adjustment.

**Solution:** Check Heroku logs:
```bash
heroku logs --tail --app your-app-name
```

### "Request timeout" (30s+)

**Cause:** Agent taking too long to respond or API issues.

**Solution:**
1. Check Agentforce agent status
2. Verify API endpoints are accessible
3. Check network connectivity

## 📚 Resources

- [Salesforce Agentforce Documentation](https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-get-started.html)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Heroku Deployment Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [OpenAI Custom GPT Documentation](https://platform.openai.com/docs/guides/custom-gpt)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AGENTFORCE_SERVER_URL` | Your Agentforce instance URL | Yes |
| `AGENTFORCE_AGENT_ID` | Your Agentforce agent ID | Yes |
| `AGENTFORCE_CLIENT_ID` | OAuth2 Client ID from Connected App | Yes |
| `AGENTFORCE_CLIENT_SECRET` | OAuth2 Client Secret from Connected App | Yes |
| `AGENTFORCE_ORG_ID` | Salesforce Org ID (optional) | No |
| `BASE_URL` | Your Heroku app URL (for deployment) | Yes (for deployment) |
| `MCP_TRANSPORT` | Transport mode: `stdio` or `http` | No (default: `stdio`) |
| `PORT` | Port for HTTP mode | No (default: `3000`) |

### API Endpoint Configuration

The default API endpoints assume:
- Base URL: `{AGENTFORCE_SERVER_URL}/api/v1/agents/{AGENTFORCE_AGENT_ID}`
- Token endpoint: `{AGENTFORCE_SERVER_URL}/services/oauth2/token` or `/api/v1/auth/token`

If your Agentforce instance uses different endpoints, you may need to adjust the `AgentforceClient` class in `src/agentforce-client.ts`.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- @modelcontextprotocol/sdk
- Express.js
- Axios
- Salesforce Agentforce API

---

Made with ❤️ for the Salesforce and AI community


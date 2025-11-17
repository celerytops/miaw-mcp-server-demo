# MIAW MCP Server

A Model Context Protocol (MCP) server implementation for Salesforce Enhanced Chat (MIAW - Messaging in App and Web) API. This server enables AI agents like ChatGPT to interact with Salesforce's messaging system, allowing them to escalate conversations to human or AI agents within Salesforce when additional support is needed.

## 🚀 Features

- **Complete MIAW API Coverage**: All Enhanced Chat API endpoints are exposed as MCP tools
- **Authentication Support**: Both authenticated (JWT) and unauthenticated (guest) user flows
- **Conversation Management**: Create, manage, and monitor chat conversations
- **Message Handling**: Send/receive messages, typing indicators, and file attachments
- **Session Management**: Token management, continuation tokens, and session control
- **Easy Configuration**: Simple environment variable-based setup

## 📋 Prerequisites

- Node.js 18+ and npm
- A Salesforce org with Enhanced Chat configured
- Custom Client deployment for Enhanced Chat (see [Salesforce Documentation](https://developer.salesforce.com/docs/service/messaging-api/guide/get-started.html))

## 🛠️ Installation

### 1. Clone or Download this Repository

```bash
cd "MIAW MCP Server"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your Salesforce details:

```bash
cp env.example .env
```

Edit `.env` with your Salesforce configuration:

```env
MIAW_SCRT_URL=your-company.salesforce-scrt.com
MIAW_ORG_ID=00Dxx0000000xxx
MIAW_ES_DEVELOPER_NAME=YourDeploymentName
```

#### How to Find Your Configuration Values:

- **MIAW_SCRT_URL**: Found in your Enhanced Chat deployment code snippet. Look for the URL in the format `https://[your-company].salesforce-scrt.com`. Use only the domain part (without `https://`).
- **MIAW_ORG_ID**: In Salesforce Setup, go to **Company Information** and copy the **Organization ID** (15 characters).
- **MIAW_ES_DEVELOPER_NAME**: The API/Developer Name of your Embedded Service deployment. Find this in Setup > Embedded Service Deployments.

### 4. Build the Project

```bash
npm run build
```

## 🔧 Usage

### Running the MCP Server

The server runs as an MCP stdio server:

```bash
npm start
```

Or during development:

```bash
npm run dev
```

### Integrating with ChatGPT or Other AI Agents

To use this MCP server with ChatGPT (via Claude Desktop or other MCP-compatible platforms), add it to your MCP configuration:

**For Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):**

```json
{
  "mcpServers": {
    "miaw": {
      "command": "node",
      "args": ["/absolute/path/to/MIAW MCP Server/dist/index.js"],
      "env": {
        "MIAW_SCRT_URL": "your-company.salesforce-scrt.com",
        "MIAW_ORG_ID": "00Dxx0000000xxx",
        "MIAW_ES_DEVELOPER_NAME": "YourDeploymentName"
      }
    }
  }
}
```

**For other MCP clients**, refer to their documentation on how to add stdio-based MCP servers.

## 🌐 Deployment Options

### Local Deployment (stdio mode)

The default mode runs the server locally using stdio transport, perfect for Claude Desktop integration. Follow the installation steps above.

### Hosted Deployment (HTTP/SSE mode)

Deploy to a cloud platform like Heroku to make your MCP server accessible via HTTP/SSE, allowing remote AI agents to connect.

#### Deploy to Heroku

**Quick Deploy:**

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**Or deploy using Heroku Git:**

```bash
# 1. Login to Heroku
heroku login

# 2. Create Heroku app
heroku create your-app-name

# 3. Set environment variables
heroku config:set MIAW_SCRT_URL=your-company.salesforce-scrt.com
heroku config:set MIAW_ORG_ID=00Dxx0000000xxx
heroku config:set MIAW_ES_DEVELOPER_NAME=YourDeploymentName
heroku config:set MCP_TRANSPORT=http

# 4. Deploy
git init  # if not already initialized
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 5. Verify
heroku open
```

**Your MCP server will be accessible at:**
- **Base URL:** `https://your-app-name.herokuapp.com`
- **MCP Endpoint:** `https://your-app-name.herokuapp.com/sse`
- **Health Check:** `https://your-app-name.herokuapp.com/health`

**📖 Full Heroku deployment guide:** See [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)

#### Other Hosting Options

The server can be deployed to any Node.js hosting platform:

- **Render**: Similar to Heroku with free tier
- **Railway**: Modern platform with simple deployment
- **Fly.io**: Global edge deployment
- **AWS ECS/Fargate**: Enterprise container hosting
- **Google Cloud Run**: Serverless container platform
- **Azure App Service**: Microsoft cloud platform

Set `MCP_TRANSPORT=http` environment variable to enable HTTP/SSE mode.

## 🔌 Available Tools

The MCP server exposes the following tools that AI agents can use:

### Authentication & Session Management

- **`generate_guest_access_token`**: Generate an access token for unauthenticated users
- **`generate_authenticated_access_token`**: Generate an access token using JWT for authenticated users
- **`generate_continuation_token`**: Maintain session and prevent timeout
- **`revoke_token`**: Revoke the current access token

### Conversation Management

- **`create_conversation`**: Start a new chat conversation with a Salesforce agent
- **`list_conversations`**: List all conversations for the current user
- **`close_conversation`**: Close an active conversation
- **`end_messaging_session`**: End the entire messaging session

### Messaging

- **`send_message`**: Send a text message in a conversation
- **`list_conversation_entries`**: List all messages in a conversation
- **`get_conversation_transcript`**: Get the full transcript of a conversation
- **`send_typing_indicator`**: Send typing indicator (is typing / stopped typing)
- **`send_file`**: Send a file attachment
- **`send_delivery_acknowledgements`**: Send read receipts or delivery confirmations

### Status & Monitoring

- **`get_conversation_routing_status`**: Check if conversation is queued, connected, etc.

## 📖 Example Workflow

Here's a typical conversation flow an AI agent would follow:

```
1. generate_guest_access_token (deviceId: "unique-device-id")
   → Returns: { accessToken, ... }

2. create_conversation (capabilities: ["MessageRead", "MessageDelivered"])
   → Returns: { conversationId, ... }

3. send_message (conversationId: "xxx", text: "Hello, I need help...")
   → Returns: { id, ... }

4. list_conversation_entries (conversationId: "xxx")
   → Returns: { entries: [...messages...] }

5. get_conversation_routing_status (conversationId: "xxx")
   → Returns: { routingResult: { status: "Connected" } }

6. (Continue messaging back and forth)

7. close_conversation (conversationId: "xxx")
   → Returns: { success: true }
```

## 🏗️ Salesforce Setup

### Configure Enhanced Chat for Custom Client

1. In Salesforce Setup, go to **Embedded Service Deployments**
2. Create a new deployment or edit an existing one
3. Set **Deployment Type** to **Custom Client**
4. Configure your deployment settings (queues, routing, etc.)
5. Publish the deployment
6. Note the **Developer Name** (this is your `MIAW_ES_DEVELOPER_NAME`)

### Optional: User Verification (JWT Authentication)

If you want to use authenticated users instead of guests:

1. Follow the [Salesforce JWT documentation](https://developer.salesforce.com/docs/service/messaging-api/guide/authorization.html)
2. Generate a signed JWT token
3. Use the `generate_authenticated_access_token` tool instead of `generate_guest_access_token`

See:
- [Understanding User Verification](https://help.salesforce.com/s/articleView?id=sf.snapins_chat_user_verification.htm)
- [Add User Verification](https://help.salesforce.com/s/articleView?id=sf.snapins_chat_user_verification_setup.htm)

## 📚 API Documentation

For detailed information about the MIAW API, refer to the official Salesforce documentation:

- [Get Started](https://developer.salesforce.com/docs/service/messaging-api/guide/get-started.html)
- [Authorization](https://developer.salesforce.com/docs/service/messaging-api/guide/authorization.html)
- [API Reference](https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=Summary)
- [Sample Configuration](https://developer.salesforce.com/docs/service/messaging-api/guide/miaw-sample-web-app.html)

## 🐛 Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Make sure your `.env` file exists and contains all required variables
- Verify the values are correct (no extra spaces, quotes, etc.)

**"401 Unauthorized" or "403 Forbidden"**
- Check that your `MIAW_ORG_ID` and `MIAW_ES_DEVELOPER_NAME` are correct
- Ensure your Enhanced Chat deployment is published and active
- Verify the deployment type is set to "Custom Client"

**"Connection timeout"**
- Verify your `MIAW_SCRT_URL` is correct and accessible
- Check your network/firewall settings

**"Invalid deviceId"**
- DeviceId should be a unique identifier, preferably in UUID format
- Example: `"b8c06d01-b410-4097-bd8a-03cc71862d24"`

### Enable Debug Logging

To see detailed request/response logs, you can modify the axios instance in `src/index.ts` to add interceptors.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Powered by [Salesforce Enhanced Chat API](https://developer.salesforce.com/docs/service/messaging-api/overview)

## 🔗 Related Resources

- [Salesforce Enhanced Chat Documentation](https://developer.salesforce.com/docs/service/messaging-api/overview)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Salesforce Developer Center](https://developer.salesforce.com/)

---

**Need Help?** Check the [Salesforce Developer Forums](https://developer.salesforce.com/forums) or review the [API documentation](https://developer.salesforce.com/docs/service/messaging-api/guide/get-started.html).


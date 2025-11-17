# Quick Start Guide

Get your MIAW MCP Server up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Salesforce org with Enhanced Chat configured (Custom Client deployment)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp env.example .env
```

Edit `.env` with your values:

```env
MIAW_SCRT_URL=mycompany.salesforce-scrt.com
MIAW_ORG_ID=00Dxx0000000xxx
MIAW_ES_DEVELOPER_NAME=MyDeploymentName
```

### 3. Build

```bash
npm run build
```

### 4. Test the Server

```bash
npm start
```

The server should start and output: `MIAW MCP Server running on stdio`

## Configure with Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Restart Claude Desktop.

## Test with Claude

Try these prompts in Claude:

1. **"Can you generate a guest access token for the MIAW server with device ID 'test-device-123'?"**

2. **"Create a new conversation with a Salesforce agent"**

3. **"Send the message 'Hello, I need help with my account' to the conversation"**

4. **"List all the messages in the conversation to see if the agent responded"**

## Troubleshooting

**Server won't start:**
- Check that Node.js 18+ is installed: `node --version`
- Verify all dependencies are installed: `npm install`
- Check for build errors: `npm run build`

**Claude can't see the server:**
- Verify the path in `claude_desktop_config.json` is absolute and correct
- Check that `dist/index.js` exists
- Restart Claude Desktop after config changes

**API errors:**
- Verify your `.env` values are correct (no extra spaces or quotes)
- Check that your Salesforce deployment is published and active
- Ensure deployment type is set to "Custom Client" in Salesforce

## Where to Find Salesforce Values

### MIAW_SCRT_URL
1. In Salesforce Setup, go to **Embedded Service Deployments**
2. Open your deployment
3. Look for the code snippet - find the URL like `https://[your-company].salesforce-scrt.com`
4. Use only: `your-company.salesforce-scrt.com` (without https://)

### MIAW_ORG_ID
1. In Salesforce Setup, search for **"Company Information"**
2. Copy the **Organization ID** (15 characters starting with "00D")

### MIAW_ES_DEVELOPER_NAME
1. In Salesforce Setup, go to **Embedded Service Deployments**
2. Find your deployment
3. Look for **"Developer Name"** or **"API Name"** (not the Label)

## Next Steps

- Read [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for detailed examples
- Review [README.md](README.md) for complete documentation
- Check [Salesforce API docs](https://developer.salesforce.com/docs/service/messaging-api/guide/get-started.html)

## Need Help?

- Check the [README.md](README.md) troubleshooting section
- Review [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for common patterns
- Consult [Salesforce Enhanced Chat documentation](https://developer.salesforce.com/docs/service/messaging-api/overview)


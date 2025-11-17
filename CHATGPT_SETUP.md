# ChatGPT MCP Connector Setup Guide

## ✅ What's Been Fixed

Your MIAW MCP Server is now properly configured for ChatGPT with:

1. **✅ CORS Support** - Full cross-origin support for browser-based clients
2. **✅ All HTTP Methods** - OPTIONS, HEAD, GET, POST, DELETE
3. **✅ Proper Headers** - Access-Control headers for all responses
4. **✅ Better Logging** - Detailed connection logging for debugging
5. **✅ Error Handling** - Comprehensive error messages with details
6. **✅ Isolated Instances** - Each connection gets its own MCP server instance
7. **✅ MCP Protocol** - Full compliance with MCP specification

## 🔌 Your MCP Server URL

```
https://miaw-mcp-server-6df009bc852c.herokuapp.com/mcp
```

## 📋 Available Tools (17 Total)

### Authentication (4 tools)
1. **generate_guest_access_token** - Generate token for unauthenticated users
2. **generate_authenticated_access_token** - Generate token with JWT
3. **generate_continuation_token** - Extend session
4. **revoke_token** - Invalidate token

### Conversation Management (4 tools)
5. **create_conversation** - Start new chat with Salesforce agent
6. **list_conversations** - Get all conversations
7. **close_conversation** - End a conversation
8. **end_messaging_session** - End entire session

### Messaging (6 tools)
9. **send_message** - Send text message
10. **list_conversation_entries** - Read messages
11. **get_conversation_transcript** - Get full history
12. **send_typing_indicator** - Show typing status
13. **send_file** - Send file attachment
14. **send_delivery_acknowledgements** - Send read receipts

### Status (1 tool)
15. **get_conversation_routing_status** - Check routing status

### Push Notifications (2 tools)
16. **register_device_for_push_notifications** - Register device
17. **unregister_device_from_push_notifications** - Unregister device

## 🚀 How to Connect in ChatGPT

### Step 1: Access ChatGPT Settings

1. Go to [ChatGPT](https://chatgpt.com/)
2. Click on your profile (bottom left)
3. Go to **Settings**
4. Navigate to **Connectors** tab

### Step 2: Add MCP Server

1. Click **"Add Connector"** or **"Import MCP Server"**
2. Enter the URL:
   ```
   https://miaw-mcp-server-6df009bc852c.herokuapp.com/mcp
   ```
3. Give it a name: **"MIAW Salesforce Chat"**
4. Click **Save** or **Connect**

### Step 3: Configure Tools (if prompted)

If ChatGPT asks which tools to enable:
- **Select ALL 17 tools** for full functionality
- Or select specific tools you want to use

### Step 4: Test the Connection

Try a prompt like:
```
"Use the MIAW connector to generate a guest access token with device ID 'test-123'"
```

ChatGPT should be able to call the `generate_guest_access_token` tool.

## 🧪 Testing Your Connection

### Test 1: Health Check
```bash
curl https://miaw-mcp-server-6df009bc852c.herokuapp.com/health
```

**Expected:**
```json
{"status":"healthy","service":"miaw-mcp-server","version":"1.0.0"}
```

### Test 2: CORS Preflight
```bash
curl -X OPTIONS https://miaw-mcp-server-6df009bc852c.herokuapp.com/mcp -v
```

**Expected:** 204 No Content with CORS headers

### Test 3: MCP Connection
```bash
curl -X POST https://miaw-mcp-server-6df009bc852c.herokuapp.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream"
```

**Expected:** SSE endpoint response

## 📊 Example Usage Flow

Here's how ChatGPT would use your MCP server:

### Example 1: Start a Guest Chat Session

**User:** "Help me start a chat with a Salesforce agent"

**ChatGPT Actions:**
1. Calls `generate_guest_access_token` with deviceId
2. Calls `create_conversation` to start chat
3. Calls `send_message` to send initial message
4. Calls `list_conversation_entries` to check for agent responses
5. Calls `get_conversation_routing_status` to check connection status

### Example 2: Send a Message

**User:** "Send 'I need help with my account' to the Salesforce agent"

**ChatGPT Actions:**
1. Calls `send_message` with the text
2. Calls `send_typing_indicator` (optional)
3. Returns confirmation to user

### Example 3: Check for Responses

**User:** "Did the agent respond?"

**ChatGPT Actions:**
1. Calls `list_conversation_entries`
2. Parses agent messages
3. Shows you the agent's responses

## 🔍 Monitoring & Debugging

### View Server Logs

```bash
heroku logs --tail --app miaw-mcp-server
```

**What to look for:**
- `MCP POST request from...` - Connection attempts
- `Connecting MCP server instance...` - Server initialization
- `MCP server instance connected successfully` - Successful connection
- `MCP connection closed by client` - Normal disconnection

### Common Log Messages

**Successful Connection:**
```
MCP POST request from 1.2.3.4
Accept header: application/json, text/event-stream
User-Agent: ...
Connecting MCP server instance...
MCP server instance connected successfully
```

**Connection Issues:**
```
Error establishing MCP connection: [error details]
```

## 🐛 Troubleshooting

### Issue: "Request timeout"

**Possible Causes:**
1. Heroku dyno sleeping (free tier)
2. Network latency
3. ChatGPT timeout settings

**Solutions:**
1. Upgrade to Basic dyno ($7/month) for always-on
2. First request might be slow (waking up dyno)
3. Subsequent requests should be fast

### Issue: "Connection closed"

**Possible Causes:**
1. CORS issues (now fixed ✅)
2. Missing headers
3. Protocol mismatch

**Solutions:**
- All CORS issues are now resolved
- Server supports all required methods
- Headers are properly set

### Issue: "Tools not showing up"

**Possible Causes:**
1. ChatGPT hasn't discovered tools yet
2. Connection not established
3. Permission issues

**Solutions:**
1. Make sure connection is successful first
2. Try disconnecting and reconnecting
3. Check ChatGPT settings for connector status

### Issue: "Cannot call tools"

**Possible Causes:**
1. Missing Salesforce configuration
2. Environment variables not set
3. Tool execution errors

**Solutions:**
1. Verify environment variables in Heroku:
   ```bash
   heroku config
   ```
2. Ensure you have:
   - `MIAW_SCRT_URL`
   - `MIAW_ORG_ID`
   - `MIAW_ES_DEVELOPER_NAME`

## 🔒 Security Notes

### Current Setup

- ✅ HTTPS enabled (via Heroku)
- ✅ CORS configured
- ✅ Environment variables protected
- ✅ No hardcoded credentials

### For Production

Consider adding:
- Authentication layer
- Rate limiting
- API key validation
- IP whitelisting
- OAuth integration

## 📈 Performance Tips

### Optimize Response Times

1. **Keep dyno awake:**
   ```bash
   # Upgrade to Basic dyno
   heroku ps:scale web=1:basic
   ```

2. **Monitor performance:**
   ```bash
   heroku metrics:web
   ```

3. **Add caching** (if needed for repeated calls)

### Scaling

If you need more capacity:
```bash
# Scale to multiple dynos
heroku ps:scale web=2

# Or upgrade dyno type
heroku ps:type standard-1x
```

## 📚 Additional Resources

- **MCP Specification:** https://modelcontextprotocol.io/
- **Salesforce MIAW API:** https://developer.salesforce.com/docs/service/messaging-api/overview
- **Heroku Documentation:** https://devcenter.heroku.com/

## ✅ Verification Checklist

Before using with ChatGPT:

- [ ] Server is deployed and healthy (`/health` returns 200)
- [ ] CORS is working (`OPTIONS /mcp` returns 204)
- [ ] MCP endpoint responds (`POST /mcp` returns SSE)
- [ ] Environment variables are set (`heroku config`)
- [ ] Logs show no errors (`heroku logs`)
- [ ] All 17 tools are defined and working

## 🎯 Expected Behavior

**When connecting in ChatGPT:**
1. ChatGPT POSTs to `/mcp`
2. Server responds with SSE endpoint
3. ChatGPT sends `initialize` request
4. Server returns capabilities and tools list
5. ChatGPT can now call any of the 17 tools
6. Each tool call is handled by the MCP server
7. Results are returned to ChatGPT
8. ChatGPT presents results to user

## 🎉 Success Indicators

✅ Server logs show successful connections  
✅ ChatGPT sees all 17 tools  
✅ Tool calls succeed and return data  
✅ No timeout errors  
✅ Responses are fast (<3 seconds)  

---

## 💬 Need Help?

**Server Issues:**
```bash
heroku logs --tail
```

**Check Server Status:**
```bash
curl https://miaw-mcp-server-6df009bc852c.herokuapp.com/health
```

**Restart Server:**
```bash
heroku restart
```

**Check Configuration:**
```bash
heroku config
```

---

**Your MIAW MCP Server is ready for ChatGPT! 🚀**

URL: `https://miaw-mcp-server-6df009bc852c.herokuapp.com/mcp`


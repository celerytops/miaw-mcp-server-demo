# 🚀 Deploy to Heroku - Ready to Go!

Your MIAW MCP Server is now ready for Heroku deployment! All necessary files have been created and tested.

## ✅ What's Ready

- ✅ HTTP/SSE transport support added
- ✅ Express server configured
- ✅ Procfile created
- ✅ app.json configured
- ✅ Dependencies installed
- ✅ TypeScript compiled successfully
- ✅ Environment variables documented
- ✅ Health check endpoints working

## 🎯 Deploy Now in 5 Steps

### Step 1: Login to Heroku

```bash
heroku login
```

This opens your browser for authentication.

### Step 2: Create Heroku App

```bash
cd "/Users/rdinh/MIAW MCP Server"
heroku create your-miaw-server
```

Replace `your-miaw-server` with your desired app name, or omit to get a random name.

**Note your app URL:** `https://your-miaw-server.herokuapp.com`

### Step 3: Set Environment Variables

```bash
heroku config:set MIAW_SCRT_URL=your-company.salesforce-scrt.com
heroku config:set MIAW_ORG_ID=00Dxx0000000xxx
heroku config:set MIAW_ES_DEVELOPER_NAME=YourDeploymentName
heroku config:set MCP_TRANSPORT=http
```

Replace with your actual Salesforce values:
- **MIAW_SCRT_URL**: Your Salesforce SCRT URL (without https://)
- **MIAW_ORG_ID**: Your 15-character Org ID
- **MIAW_ES_DEVELOPER_NAME**: Your deployment's API name

### Step 4: Initialize Git and Deploy

```bash
# Initialize Git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment to Heroku"

# Deploy to Heroku
git push heroku main
```

Or if your branch is `master`:
```bash
git push heroku master
```

### Step 5: Verify Deployment

```bash
# Open in browser
heroku open

# Or test with curl
curl https://your-miaw-server.herokuapp.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "miaw-mcp-server",
  "version": "1.0.0"
}
```

## 📊 Monitor Your Deployment

Watch the deployment logs:

```bash
heroku logs --tail
```

**Look for:**
```
MIAW MCP Server running on HTTP port 3000
Health check: http://localhost:3000/health
MCP endpoint: http://localhost:3000/sse
```

## 🔌 Your MCP Server Endpoints

Once deployed, your server will be available at:

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **Base** | `https://your-miaw-server.herokuapp.com` | Server info |
| **Health** | `https://your-miaw-server.herokuapp.com/health` | Health check |
| **MCP/SSE** | `https://your-miaw-server.herokuapp.com/sse` | MCP endpoint for AI agents |

## 🤖 Connect Your AI Agent

Use this URL to connect your AI agent:

```
https://your-miaw-server.herokuapp.com/sse
```

**For HTTP-based MCP clients:**
```json
{
  "mcp_server": {
    "url": "https://your-miaw-server.herokuapp.com/sse",
    "transport": "sse"
  }
}
```

## ✨ Quick Commands Reference

```bash
# View app info
heroku info

# View logs
heroku logs --tail

# Restart app
heroku restart

# View environment variables
heroku config

# Set environment variable
heroku config:set KEY=value

# Open in browser
heroku open

# Check dyno status
heroku ps

# Scale dynos
heroku ps:scale web=1
```

## 🔄 Update Your Deployment

After making code changes:

```bash
git add .
git commit -m "Your update message"
git push heroku main
heroku logs --tail  # Monitor the update
```

## 💰 Cost Considerations

### Eco Dynos ($5/month for 1000 hours)
- Apps sleep after 30 minutes of inactivity
- Wake up on first request (5-10 second delay)
- Good for testing and low-traffic apps

### Basic Dyno ($7/month)
- Never sleeps
- Always available
- Recommended for production

**Start with Eco, upgrade to Basic when you need always-on availability.**

## 🐛 Troubleshooting

### Issue: "App crashed" or H10 error

```bash
heroku logs --tail  # Check for errors
heroku restart      # Try restarting
```

### Issue: Environment variables not set

```bash
heroku config  # Verify all variables are set
```

### Issue: Build failed

```bash
# Test locally first
npm run build

# If local build works, push again
git push heroku main
```

### Issue: Can't access endpoints

```bash
# Check dyno is running
heroku ps

# Verify app URL
heroku info

# Check logs
heroku logs --tail
```

## 📖 Complete Documentation

For more detailed information:

- **[HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)** - Complete Heroku guide
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Quick reference
- **[TEST_BEFORE_DEPLOY.md](TEST_BEFORE_DEPLOY.md)** - Local testing guide
- **[README.md](README.md)** - Main documentation

## 🎉 You're Live!

Once deployed successfully:

1. ✅ Your MCP server is running 24/7 on Heroku
2. ✅ Accessible via HTTPS from anywhere
3. ✅ AI agents can connect to your SSE endpoint
4. ✅ Health checks available for monitoring
5. ✅ Logs available via `heroku logs --tail`

## 🔗 Share Your Server

Your MCP server URL:
```
https://your-miaw-server.herokuapp.com
```

MCP endpoint for AI agents:
```
https://your-miaw-server.herokuapp.com/sse
```

## 🎯 Test Your Deployed Server

```bash
# Test health
curl https://your-miaw-server.herokuapp.com/health

# Test info
curl https://your-miaw-server.herokuapp.com/

# Test SSE endpoint (will hang - that's correct!)
curl https://your-miaw-server.herokuapp.com/sse
```

## 📱 Next Steps

1. **Monitor your app**: `heroku logs --tail`
2. **Configure your AI agent** with the SSE endpoint
3. **Test the MCP connection** from your AI agent
4. **Set up monitoring** (optional: add Papertrail or New Relic)
5. **Upgrade to Basic dyno** when ready for production

---

## 🆘 Need Help?

- **Heroku Issues**: Check [Heroku Status](https://status.heroku.com/)
- **Server Issues**: Review [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md) troubleshooting section
- **MCP Issues**: See [README.md](README.md) and [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

---

**Your MIAW MCP Server is ready to deploy! 🚀**

Follow the 5 steps above and you'll be live in minutes!


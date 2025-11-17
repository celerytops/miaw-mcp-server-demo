# Heroku Deployment Guide

This guide walks you through deploying the MIAW MCP Server to Heroku, making it accessible via HTTP/SSE for remote AI agents.

## 🎯 Why Deploy to Heroku?

- **Always Available**: Server runs 24/7 without needing your local machine
- **URL-Based Access**: AI agents can connect via HTTP instead of local stdio
- **Easy Management**: Simple deployment and configuration via Heroku CLI or Git
- **Scalable**: Can scale to multiple dynos if needed

## 📋 Prerequisites

### 1. Heroku Account
Sign up at [heroku.com](https://signup.heroku.com/) (free tier available)

### 2. Heroku CLI
Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Windows:**
Download installer from Heroku website

**Verify installation:**
```bash
heroku --version
```

### 3. Git
Make sure Git is installed:
```bash
git --version
```

### 4. Salesforce Configuration
You need:
- SCRT URL (e.g., `mycompany.salesforce-scrt.com`)
- Organization ID (15 characters)
- Embedded Service Deployment Developer Name

## 🚀 Deployment Steps

### Step 1: Login to Heroku

```bash
heroku login
```

This will open a browser for authentication.

### Step 2: Initialize Git Repository (if not already done)

```bash
cd "/Users/rdinh/MIAW MCP Server"
git init
git add .
git commit -m "Initial commit - MIAW MCP Server"
```

### Step 3: Create Heroku App

```bash
heroku create your-app-name
```

Or let Heroku generate a random name:

```bash
heroku create
```

**Example output:**
```
Creating app... done, ⬢ mighty-lake-12345
https://mighty-lake-12345.herokuapp.com/ | https://git.heroku.com/mighty-lake-12345.git
```

**Note:** Your app will be available at `https://your-app-name.herokuapp.com`

### Step 4: Set Environment Variables

Configure your Salesforce credentials:

```bash
heroku config:set MIAW_SCRT_URL=mycompany.salesforce-scrt.com
heroku config:set MIAW_ORG_ID=00Dxx0000000xxx
heroku config:set MIAW_ES_DEVELOPER_NAME=MyDeploymentName
heroku config:set MCP_TRANSPORT=http
```

**Optional variables:**
```bash
heroku config:set MIAW_CAPABILITIES_VERSION=1
heroku config:set MIAW_PLATFORM=Web
```

**Verify configuration:**
```bash
heroku config
```

### Step 5: Deploy to Heroku

Deploy using Heroku Git:

```bash
git push heroku main
```

Or if your branch is named `master`:

```bash
git push heroku master
```

**First time deployment will:**
1. Detect Node.js app
2. Install dependencies
3. Run `npm run build` (TypeScript compilation)
4. Start the app with `npm start`

### Step 6: Verify Deployment

Check if the app is running:

```bash
heroku open
```

Or visit: `https://your-app-name.herokuapp.com`

You should see:
```json
{
  "name": "MIAW MCP Server",
  "description": "MCP Server for Salesforce Enhanced Chat (MIAW) API",
  "version": "1.0.0",
  "mcp_endpoint": "/sse",
  "health_check": "/health",
  "documentation": "https://github.com/your-repo/miaw-mcp-server"
}
```

**Check health:**
```bash
curl https://your-app-name.herokuapp.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "miaw-mcp-server",
  "version": "1.0.0"
}
```

### Step 7: View Logs

Monitor your app:

```bash
heroku logs --tail
```

You should see:
```
MIAW MCP Server running on HTTP port 3000
Health check: http://localhost:3000/health
MCP endpoint: http://localhost:3000/sse
```

## 🔌 Using Your Deployed Server

### MCP Endpoint

Your MCP server is now accessible at:
```
https://your-app-name.herokuapp.com/sse
```

### For AI Agents

Configure your AI agent to connect to:
- **Base URL:** `https://your-app-name.herokuapp.com`
- **MCP Endpoint:** `/sse`
- **Full URL:** `https://your-app-name.herokuapp.com/sse`

### For Claude Desktop (HTTP Mode)

While Claude Desktop primarily uses stdio, you can use an MCP HTTP client to bridge:

```json
{
  "mcpServers": {
    "miaw": {
      "url": "https://your-app-name.herokuapp.com/sse",
      "type": "sse"
    }
  }
}
```

**Note:** Native HTTP/SSE support may vary by MCP client. Check your client's documentation.

## 🔧 Common Heroku Commands

### View App Info
```bash
heroku info
```

### View Environment Variables
```bash
heroku config
```

### Set Environment Variable
```bash
heroku config:set VAR_NAME=value
```

### Unset Environment Variable
```bash
heroku config:unset VAR_NAME
```

### View Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Open App in Browser
```bash
heroku open
```

### Scale Dynos
```bash
heroku ps:scale web=1
```

### SSH into Dyno (for debugging)
```bash
heroku run bash
```

## 🔄 Updating Your Deployment

After making code changes:

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"

# 2. Push to Heroku
git push heroku main

# 3. Monitor deployment
heroku logs --tail
```

## 💰 Heroku Pricing

### Free Tier (Eco Dynos)
- **Cost:** $5/month for 1000 dyno hours across all apps
- **Limitations:**
  - Apps sleep after 30 minutes of inactivity
  - Apps wake up on first request (slight delay)
  - 512 MB RAM

### Basic Dyno
- **Cost:** $7/month per dyno
- **Benefits:**
  - Never sleeps
  - 512 MB RAM
  - Always available

### Standard Dynos
- **Cost:** Starting at $25/month
- **Benefits:**
  - 1-2 GB RAM
  - Better performance
  - Horizontal scaling

**Recommendation:** Start with Eco dyno for testing, upgrade to Basic for production.

## 🐛 Troubleshooting

### Issue: Application Error

**Check logs:**
```bash
heroku logs --tail
```

**Common causes:**
- Missing environment variables
- Build failures
- Port binding issues

### Issue: H10 App Crashed

**Solution:**
```bash
# Check logs for error
heroku logs --tail

# Restart app
heroku restart

# Check dyno status
heroku ps
```

### Issue: Environment Variables Not Set

**Verify:**
```bash
heroku config
```

**Set missing variables:**
```bash
heroku config:set MIAW_SCRT_URL=your-value
```

### Issue: Build Failures

**Common causes:**
- TypeScript compilation errors
- Missing dependencies
- Node version mismatch

**Solution:**
1. Test build locally: `npm run build`
2. Fix any errors
3. Commit and redeploy

### Issue: "Cannot GET /sse"

**Verify the endpoint:**
```bash
curl https://your-app-name.herokuapp.com/
```

**Should return server info.**

### Issue: Slow Response / Sleeping Dyno

**Cause:** Free/Eco dynos sleep after 30 minutes of inactivity.

**Solutions:**
1. Upgrade to Basic dyno ($7/month)
2. Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 25 minutes
3. Accept the wake-up delay (5-10 seconds on first request)

## 🔒 Security Best Practices

### 1. Protect Environment Variables
Never commit `.env` or config values to Git:
```bash
# Already in .gitignore
.env
```

### 2. Use Config Vars
Always use Heroku config vars for sensitive data:
```bash
heroku config:set MIAW_ORG_ID=your-org-id
```

### 3. Rotate Credentials
Periodically update your Salesforce credentials:
```bash
heroku config:set MIAW_SCRT_URL=new-value
heroku restart
```

### 4. Enable Heroku Shield (Enterprise)
For enhanced security and compliance (HIPAA, PCI, etc.)

### 5. Use HTTPS Only
Heroku provides HTTPS by default - always use it!

## 📊 Monitoring

### View Metrics
```bash
heroku metrics:web
```

### Add-ons for Monitoring

**Papertrail (Logging):**
```bash
heroku addons:create papertrail
heroku addons:open papertrail
```

**New Relic (APM):**
```bash
heroku addons:create newrelic:wayne
heroku addons:open newrelic
```

## 🌐 Custom Domain (Optional)

### Add Custom Domain
```bash
heroku domains:add www.yourdomain.com
```

### View DNS Target
```bash
heroku domains
```

### Configure DNS
Add CNAME record:
```
CNAME www.yourdomain.com -> your-app-name.herokuapp.com
```

## 🔄 CI/CD Integration

### GitHub Integration

1. Go to Heroku Dashboard
2. Select your app
3. Go to **Deploy** tab
4. Connect to GitHub
5. Enable automatic deploys from main branch

Now every push to GitHub automatically deploys to Heroku!

## 📱 Mobile/Remote Access

Your MCP server is now accessible from anywhere:

- **URL:** `https://your-app-name.herokuapp.com`
- **MCP Endpoint:** `https://your-app-name.herokuapp.com/sse`
- **Health Check:** `https://your-app-name.herokuapp.com/health`

## 🎉 You're Deployed!

Your MIAW MCP Server is now running on Heroku and accessible via HTTP/SSE!

**Next Steps:**
1. Test the endpoints with `curl` or browser
2. Configure your AI agent to use the SSE endpoint
3. Monitor logs: `heroku logs --tail`
4. Set up monitoring and alerts

## 📚 Additional Resources

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Heroku Config Vars](https://devcenter.heroku.com/articles/config-vars)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)
- [Heroku Logs](https://devcenter.heroku.com/articles/logging)

## ❓ Need Help?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review [Heroku Status](https://status.heroku.com/)
- Visit [Heroku Dev Center](https://devcenter.heroku.com/)
- Check Heroku logs: `heroku logs --tail`

---

**Happy Deploying! 🚀**


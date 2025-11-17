# Test Before Deploying to Heroku

Follow these steps to test your MIAW MCP Server locally before deploying to Heroku.

## 🧪 Step 1: Test Local Build

```bash
cd "/Users/rdinh/MIAW MCP Server"

# Clean previous build
rm -rf dist/

# Build the project
npm run build
```

**Expected output:**
- No TypeScript errors
- `dist/` directory created with compiled JavaScript files

**Verify:**
```bash
ls -la dist/
```

Should see:
- `index.js`
- `types.js`
- `index.d.ts`
- `types.d.ts`
- Source maps (.map files)

## 🧪 Step 2: Test stdio Mode (Local/Claude Desktop)

```bash
# Start in stdio mode (default)
npm start
```

**Expected output:**
```
MIAW MCP Server running on stdio
```

**Note:** Server will wait for stdio input. Press `Ctrl+C` to stop.

This confirms stdio mode works for Claude Desktop integration.

## 🧪 Step 3: Test HTTP Mode (Heroku simulation)

```bash
# Start in HTTP mode
MCP_TRANSPORT=http PORT=3000 npm start
```

**Expected output:**
```
MIAW MCP Server running on HTTP port 3000
Health check: http://localhost:3000/health
MCP endpoint: http://localhost:3000/sse
```

**Keep this running** and proceed to Step 4 in a **new terminal**.

## 🧪 Step 4: Test HTTP Endpoints

Open a **new terminal** and run these tests:

### Test 1: Root Endpoint
```bash
curl http://localhost:3000/
```

**Expected response:**
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

### Test 2: Health Check
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "miaw-mcp-server",
  "version": "1.0.0"
}
```

### Test 3: SSE Endpoint (should hang - that's correct!)
```bash
curl http://localhost:3000/sse
```

**Expected behavior:**
- Connection hangs (doesn't return immediately)
- Server logs show: "New SSE connection established"
- This is **correct** - SSE keeps connection open
- Press `Ctrl+C` to stop

**Server logs should show:**
```
New SSE connection established
SSE connection closed
```

## ✅ Step 5: Verify All Tests Passed

Checklist:

- [ ] Build completed without errors
- [ ] stdio mode starts correctly
- [ ] HTTP mode starts on port 3000
- [ ] Root endpoint returns server info
- [ ] Health check returns healthy status
- [ ] SSE endpoint accepts connections
- [ ] No errors in server logs

## 🎯 If All Tests Pass - Ready to Deploy!

You're ready to deploy to Heroku! Follow [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md).

## ❌ If Tests Fail

### Issue: Build Fails

```bash
# Check for TypeScript errors
npm run build
```

**Common fixes:**
- Make sure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Check for syntax errors in TypeScript files

### Issue: Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Cannot Find Module '@modelcontextprotocol/sdk'

```bash
# Ensure all dependencies are installed
npm install @modelcontextprotocol/sdk axios dotenv express
npm run build
```

### Issue: Port Already in Use

```bash
# Use a different port
MCP_TRANSPORT=http PORT=3001 npm start
```

Then test with `curl http://localhost:3001/health`

### Issue: Environment Variables Not Loaded

```bash
# Make sure .env file exists
ls -la .env

# Or set variables inline
MIAW_SCRT_URL=test.com MIAW_ORG_ID=test MIAW_ES_DEVELOPER_NAME=test MCP_TRANSPORT=http npm start
```

## 🔍 Detailed Diagnostics

### Check Dependencies

```bash
npm list --depth=0
```

Should show:
- `@modelcontextprotocol/sdk`
- `axios`
- `dotenv`
- `express`
- `typescript`

### Check TypeScript Compilation

```bash
npx tsc --noEmit
```

Should show no errors.

### Check Server Can Start

```bash
node dist/index.js
```

Should show: "MIAW MCP Server running on stdio"

### Check HTTP Mode

```bash
MCP_TRANSPORT=http PORT=3000 node dist/index.js
```

Should show: "MIAW MCP Server running on HTTP port 3000"

## 📊 Test Report Template

After running all tests, document your results:

```
✅ Build Test: PASSED
✅ stdio Mode: PASSED
✅ HTTP Mode: PASSED
✅ Root Endpoint: PASSED
✅ Health Check: PASSED
✅ SSE Endpoint: PASSED
✅ No Errors: PASSED

Ready for Heroku deployment: YES

Tested on: [Date]
Node version: [Your version]
npm version: [Your version]
```

## 🚀 Next Step: Deploy to Heroku

Once all tests pass, proceed with Heroku deployment:

```bash
heroku login
heroku create your-app-name
heroku config:set MIAW_SCRT_URL=your-company.salesforce-scrt.com
heroku config:set MIAW_ORG_ID=00Dxx0000000xxx
heroku config:set MIAW_ES_DEVELOPER_NAME=YourDeploymentName
heroku config:set MCP_TRANSPORT=http

git add .
git commit -m "Ready for deployment"
git push heroku main

heroku open
```

**Full guide:** [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)

---

## 💡 Pro Tips

1. **Always test locally first** before deploying to Heroku
2. **Check logs** if something doesn't work: `heroku logs --tail`
3. **Test health check** immediately after deployment
4. **Monitor for errors** in the first few minutes after deployment
5. **Keep local and Heroku versions in sync** by testing locally before each deploy

---

**Good luck with your deployment! 🚀**

See [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md) for complete deployment instructions.


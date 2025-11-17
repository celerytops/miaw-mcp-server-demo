# Changelog

All notable changes to the MIAW MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-17

### Added
- Initial release of MIAW MCP Server
- Complete implementation of Salesforce Enhanced Chat (MIAW) API v2.0.0
- Support for both authenticated (JWT) and unauthenticated (guest) users
- All core messaging endpoints:
  - `generate_guest_access_token` - Generate access token for guest users
  - `generate_authenticated_access_token` - Generate access token with JWT
  - `create_conversation` - Start new conversations with Salesforce agents
  - `send_message` - Send text messages
  - `send_typing_indicator` - Send typing indicators
  - `list_conversation_entries` - Read messages from agents
  - `get_conversation_routing_status` - Check conversation status
  - `get_conversation_transcript` - Get full conversation history
  - `send_delivery_acknowledgements` - Send read receipts
  - `send_file` - Send file attachments
  - `close_conversation` - Close conversations
  - `list_conversations` - List all user conversations
  - `end_messaging_session` - End messaging sessions
  - `generate_continuation_token` - Maintain session continuity
  - `revoke_token` - Revoke access tokens
- Comprehensive TypeScript type definitions
- Environment-based configuration
- Error handling with detailed error messages
- Automatic access token management
- Full MCP (Model Context Protocol) compliance
- Documentation:
  - Complete README with setup instructions
  - Quick Start Guide
  - Detailed Usage Examples
  - API reference links
- Example configuration files
- MIT License

### Security
- Secure token management
- Environment variable-based configuration (no hardcoded credentials)
- Support for JWT authentication

## [Unreleased]

### Planned Features
- WebSocket support for real-time message updates
- Push notification integration
- Advanced routing attributes examples
- Conversation history ingestion for third-party bots
- Rate limiting and retry strategies
- Prometheus metrics export
- Debug logging options
- Unit and integration tests
- Docker container support
- CI/CD pipeline

---

## Release Notes

### Version 1.0.0

This is the initial release of the MIAW MCP Server, providing a complete MCP interface to Salesforce's Enhanced Chat (MIAW) API. This server enables AI agents like ChatGPT to seamlessly escalate conversations to human or AI agents within Salesforce Service Cloud.

**Key Features:**
- ✅ Full MIAW API v2.0.0 coverage
- ✅ Both authenticated and guest user support
- ✅ Complete conversation lifecycle management
- ✅ File attachment support
- ✅ Typing indicators and read receipts
- ✅ Session management with continuation tokens
- ✅ Comprehensive documentation and examples

**Requirements:**
- Node.js 18 or higher
- Salesforce org with Enhanced Chat configured
- Custom Client deployment for Enhanced Chat

**Installation:**
```bash
npm install
npm run build
```

**Usage:**
See [QUICK_START.md](QUICK_START.md) for setup instructions and [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for detailed usage examples.

---

For questions, issues, or contributions, please visit the repository or contact the maintainers.


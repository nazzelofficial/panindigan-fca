# Changelog

All notable changes to **Panindigan FCA** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- 🎥 Voice/Video call support
- 🤖 AI-powered command suggestions
- 📊 Advanced analytics dashboard
- 🔌 Plugin marketplace integration
- 🌐 Multi-language support

---

## [1.4.18] - 2026-02-10
### Removed
- **Architecture**: Aligned with standard FCA library architecture. Removed `CommandHandler`, `PermissionGuard`, and `CooldownManager`.

## [1.4.17] - 2026-02-10
### Changed
- **Prefix Configuration**: Removed default `!` and `/` prefixes to give users full control. Multi-prefix support remains available via `prefixes` option.

## [1.4.16] - 2026-02-10
### Fixed
- **Log Formatting**: Ensured all MQTT event logs are properly stringified to eliminate `[object Object]` entries.
- **Listen Error Safety**: Added defensive checks and debug logging for `typ` event dispatching to prevent "Listen error".
- **Default Prefixes**: Restored default prefixes `['!', '/']` in `CommandHandler` to ensure out-of-the-box compatibility with common bot commands like `!help`.

## [1.4.15] - 2026-02-10
### Fixed
- **Event Formatting**: Added standard FCA formatting for `typ` (typing) and `presence` events to fix compatibility with existing bot commands.
- **MQTT Stability**: Updated MQTT keepalive and connection timeouts to match standard configurations (30s keepalive).
- **Listen Error**: Resolved "Listen error" by ensuring events are correctly formatted before dispatching to callbacks.

## [1.4.14] - 2026-02-10
### Fixed
- **Logging**: Fixed `[object Object]` in MQTT info logs by properly stringifying event data.
- **Debugging**: Added verbose info logging for event dispatching to help trace "Listen error" issues.

## [1.4.13] - 2026-02-10
### Fixed
- **Listen Error Logging**: Fixed `[object Object]` error logs by ensuring error objects are properly stringified before logging.
- **Connection Stability**: Fixed duplicate MQTT connection attempts and potential disconnection loops by adding robust `isConnecting` state tracking in `Client` and `MQTTClient`.
### Changed
- **Command Handling**: Removed default `!` prefix enforcement. The `CommandHandler` now strictly respects the user-configured prefixes (defaulting to empty if none provided), allowing for natural language or custom prefix logic.
### Added
- **Log Detail**: Aligned MQTT logs, now including broker URL (`wss://edge.messenger.com/chat`) and region sequence details.

## [1.4.12] - 2026-02-09
### Fixed
- **MQTT Error Logging**: Improved error handling to ensure error objects are properly logged instead of `[object Object]`.
- **Build System**: Updated `clean` script to be cross-platform (Windows compatible) using Node.js `fs.rmSync`.
### Added
- **Professional Logging**: Added comprehensive MQTT logging (connection, subscription, message payload, parsing) and CommandHandler logging to aid in debugging group chat issues.

## [1.4.11] - 2026-02-09
### Fixed
- **Event Listener Crash**: Fixed `TypeError: callback is not a function` by adding robust argument validation to `listenMqtt` and `.on` methods.
- **EventEmitter Compatibility**: Added support for `.on('message', callback)` signature to support bot frameworks that treat the client as an EventEmitter.

## [1.4.10] - 2026-02-09
### Fixed
- **Account Name Resolution**: Fixed "Unknown" account name issue by extracting name directly from login page and improving profile scraping fallback.
- **Profile Scraping**: Updated fallback profile URL to use `profile.php?id=` for better reliability with numeric IDs.

## [1.4.9] - 2026-02-09
### Fixed
- **Critical MQTT Bug**: Fixed "Connection refused" caused by malformed Cookie header (handled `c.name` vs `c.key` inconsistency).
- **User Identity**: Fixed "Unknown" account name by adding a robust profile scraping fallback when GraphQL fails.
- **Connection**: Ensured `mqtt` options fully align with legacy protocols.

## [1.4.8] - 2026-02-09
### Fixed
- **MQTT Authentication**: Updated `FACEBOOK_APP_ID` to Messenger Web standard (`219994525426954`) to resolve "Connection refused" errors.
- **Dependency Compatibility**: Downgraded `mqtt` to `4.3.7` to ensure literal protocol compatibility with legacy implementations.
- **Connection Stability**: Verified `websocket-stream` integration with `mqtt` v4 for stable persistent connections.

## [1.4.7] - 2026-02-09
### Fixed
- **Critical Crash**: Fixed `this.onEventCallback is not a function` error by adding safe checks and legacy support.
- **Legacy Compatibility**: Added `listenMqtt(callback)` method to fully support legacy style bots.
- **MQTT Connection**: Resolved "Connection refused" by strictly enforcing compatible headers (`Origin: https://www.facebook.com`) and capabilities (`3`).

## [1.4.6] - 2026-02-09
### Fixed
- Replaced MQTT connection stream builder with `websocket-stream` for maximum compatibility.
- Added `websocket-stream` and `https-proxy-agent` dependencies.
- Updated MQTT options: explicit `keepalive: 10`, `connectTimeout: 60000`, `reconnectPeriod: 1000`.
- Implemented exact replica of `stream creation logic.`

## [1.4.5] - 2026-02-09
### Fixed
- Fully aligned MQTT connection logic for maximum compatibility.
- Updated MQTT Broker URL to `wss://edge-chat.messenger.com/chat`.
- Added required query parameters (`sid`, `cid`) to MQTT connection URL.
- Added `User-Agent` to MQTT username payload (required for security validation).
- Updated `Origin` and `Referer` headers to `messenger.com`.

## [1.4.4] - 2026-02-09
### Fixed
- Fixed critical MQTT disconnection loop by shortening `clientId` to comply with MQTT 3.1 protocol limits (< 23 chars).
- Synchronized `User-Agent` between Login and MQTT sessions to prevent security flags.
- Removed experimental `x-msgr-region` header to ensure broader compatibility.

## [1.4.3] - 2026-02-09
### Fixed
- Fixed MQTT disconnection loop by ensuring unique `clientId` for each session.
- Fixed `listenMqtt` compatibility by formatting raw deltas into compatible event objects.
- Added `x-msgr-region` header to MQTT connection for better stability.

## [1.4.2] - 2026-02-09

### Fixed
- **AppState Compatibility**: Improved cookie parsing to support `name` property and browser exports alongside `key`.
- **Login Reliability**: Enhanced `c_user` extraction logic to work with varied cookie formats.

## [1.4.1] - 2026-02-09

### Fixed
- **User Information Retrieval**: Fixed `getUserInfo` returning "Unknown User" by migrating to GraphQL Batch API (`USER_INFO` doc id).
- **Username Parsing**: Improved parsing logic to reliably extract names, short names, and usernames.
- **Package Metadata**: Added missing `repository`, `homepage`, and `bugs` fields in `package.json` for better NPM integration.
- **Publishing Workflow**: Added `prepublishOnly` script and file whitelist to ensure only necessary files are published.

### Added
- **Internal Helper**: Added `parseGraphQLBatchMap` utility for handling complex GraphQL batch responses.

## [1.4.0] - 2025-02-08

### Added

#### 🛠️ Advanced Command Handler System
- **Middleware Support**: Introduced `.use()` method for command interception
  - Enable logging, permission checks, and rate limiting
  - Chain multiple middleware functions
  - Async middleware support with `await next()`
- **Smart Argument Parsing**: Enhanced parser with quoted string support
  - Example: `!say "Hello World"` → `["Hello World"]` (instead of `['"Hello', 'World"']`)
  - Support for mixed quoted and unquoted arguments
- **Event-Driven Architecture**: `CommandHandler` now extends `EventEmitter`
  - Events: `commandStart`, `commandFinish`, `commandError`, `commandCooldown`, `commandPermission`
  - Subscribe to events for custom logging and analytics
- **Hot Reloading**: New `reloadCommands(dir)` method
  - Update command logic without bot restart
  - Automatic command cache invalidation
  - Support for dynamic command directories

#### 🎨 Professional Logging System
- **Color-Coded Console Output**: Integrated `chalk` for visual diagnostics
  - 🟢 SUCCESS - Successful operations
  - 🔵 INFO - General information
  - 🟡 WARNING - Warnings and cautions
  - 🔴 ERROR - Errors with stack traces
  - 🟣 DEBUG - Debug information
  - ⚪ SYSTEM - System-level logs
- **Automatic Log Rotation**: File-based logging to `logs/` directory
  - Daily rotation with date-stamped files
  - Automatic archival of old logs
  - Configurable retention policy
- **Enhanced Diagnostics**
  - Timestamp on every log entry
  - Contextual icons for quick scanning
  - Full stack traces for errors
  - Performance metrics logging
- **Centralized Logger**: Replaced all `console.log` calls
  - Consistent logging across `Client`, `CommandHandler`, `MQTT`, `Auth` modules
  - Configurable log levels (debug, info, warn, error)

### Changed

#### 📚 Documentation Improvements
- **Comprehensive README**: Complete rewrite with professional structure
  - Feature comparison tables
  - Visual badges for quick insights
  - Step-by-step quick start guide
  - Advanced usage examples
- **Enhanced Examples**: Refactored `example.ts`
  - Environment variable best practices
  - Proper error handling patterns
  - Real-world use cases
- **Type Definitions**: Improved IntelliSense support
  - Complete JSDoc comments
  - Generic type parameters
  - Better type inference
- **Community Files**: Added governance documents
  - `CONTRIBUTING.md` - Contribution guidelines
  - `SECURITY.md` - Security policy and reporting
  - `CODE_OF_CONDUCT.md` - Community standards
  - `LICENSE.md` - MIT License terms

#### 📦 Dependency Updates
- **Core Dependencies**
  - `axios@^1.7.9` - Latest HTTP client
  - `mqtt@^5.10.3` - MQTT protocol support
  - `fs-extra@^11.2.0` - Enhanced file operations
  - `cheerio@^1.0.0` - HTML parsing
  - `chalk@^4.1.2` - Terminal styling (pinned for CJS compatibility)
  - `uuid@^11.0.5` - UUID generation
- **Development Dependencies**
  - `typescript@^5.7.3` - Latest TypeScript
  - `@types/node@^22.13.1` - Node.js type definitions

### Fixed
- Corrected invalid version constraints for `uuid` and `typescript`
- Fixed CommonJS compatibility by pinning `chalk` to v4.x
- Resolved circular dependency warnings
- Fixed TypeScript strict mode errors

---

## [1.3.0] - 2025-02-08

### Added

#### ⚡ Real-Time MQTT Engine (Complete Implementation)
- **Secure TLS/SSL Connection**
  - Robust handshake with error recovery
  - Certificate validation
  - Connection pooling
- **Intelligent Delta Parsing**: Advanced `/t_ms` delta handling
  - Real-time message delivery
  - Delivery receipts processing
  - Read receipts synchronization
  - Message unsend events
- **Resilient Auto-Reconnection**
  - Exponential backoff strategy (3s base interval)
  - Connection state management
  - Queue message buffering during disconnection
- **Comprehensive Topic Subscription**
  - `/t_ms` - Messages and deltas
  - `/thread_typing` - Typing indicators
  - `/orca_presence` - User presence (online/offline)
  - `/webrtc` - Call notifications
  - `/pp` - Profile changes
  - `/legacy_web` - Notifications
- **Quality of Service (QoS)**
  - QoS 0 (At most once) for non-critical events
  - QoS 1 (At least once) for messages
  - Acknowledgment handling
- **Performance Monitoring**
  - Real-time latency tracking
  - Payload size metrics
  - Connection health monitoring

#### 🔐 Security Enhancements
- **Environment-Based Configuration**
  - `process.env.FB_APPSTATE` support for secure cookie storage
  - Compatible with Docker, Vercel, Heroku, AWS Lambda
  - Base64 encoding for safe transmission
- **Enhanced Request Headers**
  - `Origin` and `Referer` headers for legitimacy
  - `DNT` (Do Not Track) header
  - Realistic browser fingerprinting
- **Token Extraction**
  - Centralized regex patterns in `constants.ts`
  - Patterns for `DTSG`, `IRIS_SEQ_ID`, `LSD`, `JAZOEST`
  - Fallback mechanisms for missing tokens
- **User Agent Diversity**
  - Expanded pool with modern Firefox configurations
  - Automatic rotation on requests
  - Version-specific UA strings

### Changed
- **Constants Standardization**: Eliminated magic strings across codebase
- **Type Safety**: Resolved all TypeScript strict mode errors
- **HTTP Connection Pooling**: Optimized for reduced latency
- **Code Organization**: Removed duplicate constant definitions

### Fixed
- Replaced placeholder values in `friends.ts`, `notifications.ts`
- Fixed MQTT QoS type definitions
- Corrected GraphQL document IDs
- Removed mock data from production code

---

## [1.2.0] - 2025-02-08

### Added

#### 🛡️ Anti-Detection & Security Framework
- **Behavioral Simulator**
  - Human-like typing speeds (40-120 WPM)
  - Random idle times between actions
  - Natural reading patterns
  - Mouse movement simulation (when applicable)
- **CAPTCHA Solver Integration**
  - 2captcha API support
  - Anti-Captcha API support
  - Automatic retry on failed solve
  - Configurable timeout settings
- **Fingerprint Manager**
  - Canvas fingerprint rotation
  - Audio context randomization
  - WebGL fingerprint masking
  - Font enumeration spoofing
- **User Agent Rotation**
  - 2025-2026 Chrome versions (145+)
  - Microsoft Edge configurations
  - Mobile/Desktop mixing
  - Weighted random selection
- **Auto-Refresh with Encryption**
  - AES-256 cookie encryption
  - Automatic session refresh every 20 minutes
  - Seamless token renewal

#### 📊 Performance Optimization
- **Message Queue System**
  - Throttling control (max 5 requests/second)
  - Priority queue for urgent messages
  - Automatic retry on failure
- **Response Caching**
  - LRU cache for `getThreadList()`
  - Cache for `getUserInfo()`
  - Configurable TTL (Time To Live)
  - Memory-efficient storage
- **Lazy Loading**
  - Dynamic imports for API modules
  - Faster initial startup time
  - Reduced memory footprint
- **Compression Support**
  - GZIP compression for requests
  - Brotli compression when available
  - Bandwidth savings up to 70%
- **Metrics Tracking**
  - Request duration logging
  - Payload size monitoring
  - Error rate analytics
  - Real-time dashboards (when enabled)

### Fixed
- Replaced `getFriendsList()` placeholder with GraphQL implementation
- Fixed memory leaks in event listeners
- Corrected timezone handling in timestamps

---

## [1.1.0] - 2025-02-08

### Added

#### 📱 Timeline & Social Features
- **Post Management**
  - `createPost()` - Share text to timeline, groups, or pages
  - `reactToPost()` - Like, love, haha, wow, sad, angry reactions
  - `commentOnPost()` - Add comments to posts
  - `sharePost()` - Share posts to timeline or groups
  - `deletePost()` - Remove your own posts
- **Privacy Controls**
  - Set post visibility: Everyone, Friends, Only Me
  - Tag users in posts
  - Mention friends in comments

#### 💬 Advanced Messaging
- **Rich Media Helpers**
  - `sendImage()` - Send images with optional captions
  - `sendVideo()` - Share videos
  - `sendAudio()` - Send voice messages
  - `sendFile()` - Upload and send documents
- **Sticker Support**
  - `sendSticker()` - Send stickers by ID
  - Access to Facebook's sticker library
- **Message Management**
  - `deleteMessage()` - Permanently delete messages (both sides)
  - `editMessage()` - Edit sent messages (experimental)

#### 👥 Enhanced Group Management
- **Group Settings**
  - `setApprovalMode()` - Require admin approval for new members
  - `approveJoinRequest()` - Accept or reject join requests
  - `leaveGroup()` - Exit group conversations
- **Thread Organization**
  - `pinThread()` - Pin important conversations
  - `muteThread()` - Mute notifications
  - `archiveThread()` - Archive/unarchive conversations
  - `deleteThread()` - Permanently delete threads

#### 🔔 Notification System
- **Notification Center**
  - `getNotifications()` - Retrieve latest notifications
  - `markNotificationsRead()` - Mark all as read
  - Filter by type (friend requests, mentions, tags)

#### 👫 User Actions
- **Friend Request Management**
  - `acceptFriendRequest()` - Accept incoming requests
  - `deleteFriendRequest()` - Reject requests
  - Batch operations support

---

## [1.0.0] - 2025-02-08

### Added

#### 🚀 Initial Release

#### 🔐 Authentication & Session Management
- **AppState-Based Login**
  - Secure cookie-based authentication
  - No password storage required
  - Compatible with all Facebook accounts
- **Automatic Token Extraction**
  - `fb_dtsg` - Form token
  - `jazoest` - Anti-CSRF token
  - `userID` - Current user identifier
- **Cookie Jar Integration**
  - Persistent cookie storage
  - Automatic session maintenance
  - Multi-account support

#### 💬 Core Messaging Engine
- **Text Messaging**
  - Send plain text messages
  - Unicode and emoji support
  - Thread-safe message delivery
- **Attachment System**
  - Upload images, videos, files
  - Multi-attachment support
  - Progress tracking for large files
- **Message Reply**
  - Reply to specific messages
  - Context preservation
  - Quote original message
- **Message Tracking**
  - Unique message ID generation
  - Delivery confirmation
  - Read receipt tracking
- **Message Actions**
  - `unsendMessage()` - Retract sent messages
  - `sendMessageReaction()` - Add emoji reactions
  - `getMessageHistory()` - Retrieve conversation history with pagination

#### ⚡ Real-Time Events (MQTT)
- **WebSocket Gateway**
  - High-performance connection to `edge-chat.facebook.com`
  - TLS encryption
  - Auto-reconnection on disconnect
- **Topic Subscriptions**
  - `/t_ms` - Message deltas
  - `/thread_typing` - Typing indicators
  - `/orca_presence` - User presence
- **Real-Time Actions**
  - `sendTypingIndicator()` - Show typing status
  - `markAsRead()` - Update read receipts
  - Live event streaming

#### 🧵 Thread Management
- **Thread Retrieval**
  - GraphQL Batch API integration
  - Efficient inbox fetching
  - Pagination support
- **Group Operations**
  - `createGroup()` - Create new group chats
  - `addUserToGroup()` - Add participants
  - `removeUserFromGroup()` - Remove members
- **Thread Customization**
  - `changeThreadEmoji()` - Set default emoji
  - `changeThreadColor()` - Update bubble color
  - `changeNickname()` - Set user nicknames
  - `changeThreadName()` - Rename groups
  - `changeThreadImage()` - Upload group photos

#### 📊 Data Retrieval
- **User Information**
  - `getUserInfo()` - Fetch profile details
  - Name, vanity URL, profile picture
  - Online status and last active
- **Thread Information**
  - `getThreadInfo()` - Get conversation details
  - Participant list
  - Thread settings and metadata

#### 👥 Social Features
- **Friend Management**
  - `addFriend()` - Send friend requests
  - `cancelFriendRequest()` - Cancel pending requests
  - `removeFriend()` - Unfriend users
  - `getFriendsList()` - Retrieve friends via GraphQL
- **Blocking**
  - `blockUser()` - Block on Messenger
  - `unblockUser()` - Unblock users
- **Search**
  - `searchUser()` - Find users by name (Typeahead API)
- **Message Forwarding**
  - `forwardMessage()` - Forward to other threads

#### 🏗️ Infrastructure
- **Modular Architecture**
  - Specialized modules under `src/api/`
  - Separation of concerns
  - Easy maintenance and testing
- **TypeScript Support**
  - Full type safety
  - Interfaces for `User`, `Message`, `Thread`, `AppState`
  - Generic type parameters
- **Package Management**
  - Built with `pnpm` for efficiency
  - Lock file for reproducible builds
- **Utilities**
  - `generateOfflineThreadingID()` - Unique message IDs
  - `parseGraphQLBatch()` - Parse complex responses
  - Custom Axios instance with header rotation

#### 🔄 Auto-Refresh System
- **Cookie Management**
  - Automatic refresh every 20 minutes
  - Proactive expiration prevention
  - Session validation after refresh
- **MQTT Keep-Alive**
  - Heartbeat every 30 seconds
  - Connection health monitoring
  - Automatic recovery
- **Advanced Features**
  - Cookie encryption (AES-256)
  - Multi-account coordination
  - Background processing
  - Fallback to re-login on failure

#### 🎭 Anti-Detection Features
- **Fingerprint Manager**
  - Session fingerprint generation
  - Auto-rotation every 6 hours
  - Canvas fingerprint randomization
  - WebGL signature masking
  - Audio context randomization
  - Font list variation
  - Screen resolution spoofing
  - Timezone consistency
  - Plugin list generation
- **User Agent Rotation**
  - Latest Chrome/Edge configurations
  - Realistic OS + Browser combinations
  - Mobile/Desktop switching
  - Version history support
  - Accept-Language matching
  - Platform consistency
  - Automated updates
  - Weight-based selection

### Best Practices

#### ⚠️ Anti-Detection Guidelines
1. **Enable All Features** - Maximum protection against detection
2. **Realistic Profiles** - Match actual hardware specifications
3. **Session Consistency** - Avoid mid-session configuration changes
4. **Rate Limit Monitoring** - Stay well below Facebook's limits
5. **Regular Rotation** - But not too frequently to avoid suspicion
6. **Proxy Usage** - Different IPs for different accounts
7. **Human Behavior** - Random delays and idle times
8. **Fresh Cookies** - 20-minute refresh is optimal
9. **Detection Monitoring** - Watch for warning signs
10. **Stay Updated** - Regular library updates for latest protections

---

## Version History Summary

| Version | Release Date | Highlights |
|---------|--------------|------------|
| 1.4.0 | 2025-02-08 | Command Handler, Professional Logging |
| 1.3.0 | 2025-02-08 | Full MQTT Implementation, Security Hardening |
| 1.2.0 | 2025-02-08 | Anti-Detection Framework, Performance Optimization |
| 1.1.0 | 2025-02-08 | Timeline Features, Advanced Messaging |
| 1.0.0 | 2025-02-08 | Initial Release, Core Features |

---

## Upgrade Guide

### From 1.3.x to 1.4.x

**Breaking Changes:**
- None - Fully backward compatible

**New Features:**
```typescript
// Use the new command handler
import { CommandHandler } from 'panindigan-fca/command';

const handler = new CommandHandler(client);

// Add middleware
handler.use(async (ctx, next) => {
  console.log(`Command: ${ctx.command.name}`);
  await next();
});

// Register commands
handler.register({
  name: 'test',
  execute: async (ctx) => {
    await ctx.reply('Hello!');
  }
});
```

**Logger Migration:**
```typescript
// Old
console.log('Message sent');

// New
import { logger } from 'panindigan-fca/utils/Logger';
logger.success('Message sent');
```

### From 1.2.x to 1.3.x

**Environment Variables:**
```bash
# Add to .env
FB_APPSTATE='{"cookies": [...]}'
```

**MQTT Configuration:**
```typescript
const client = new PanindiganClient({
  listenEvents: true, // Enable MQTT
  mqtt: {
    autoReconnect: true,
    keepAlive: 30
  }
});
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Reporting Issues
- Use GitHub Issues for bug reports
- Include version number and error logs
- Provide minimal reproduction steps

### Suggesting Features
- Open a GitHub Discussion
- Describe use case and benefits
- Check roadmap for planned features

---

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

---

## Acknowledgments

- Inspired by [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api)
- Built with ❤️ by the Panindigan Team
- Thanks to all contributors and testers

---

<p align="center">
  <strong>Panindigan FCA</strong> - Empowering developers to build amazing things
  <br>
  <sub>For support, visit our <a href="https://github.com/nazzelofficial/panindigan-fca/issues">GitHub Issues</a></sub>
</p>
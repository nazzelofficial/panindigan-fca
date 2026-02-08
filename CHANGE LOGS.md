# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-02-08

### 🛠️ Advanced Command Handler
- **Middleware Support**: Added `.use()` method to intercept and process commands before execution (e.g., logging, permissions).
- **Smart Argument Parsing**: Now supports quoted arguments (e.g., `!say "Hello World"` is parsed as `["Hello World"]` instead of `['"Hello', 'World"']`).
- **Event-Driven Architecture**: `CommandHandler` now extends `EventEmitter` with events: `commandStart`, `commandFinish`, `commandError`, `commandCooldown`, `commandPermission`.
- **Hot Reloading**: Added `reloadCommands(dir)` to update command logic without restarting the bot.

### 🎨 Advanced Logging System
- **Beautiful Console Logs**: Integrated `chalk` for color-coded logs (SUCCESS 🟢, INFO 🔵, WARNING 🟡, ERROR 🔴, DEBUG 🟣, SYSTEM ⚪).
- **Log Rotation**: Automatic file logging to `logs/` directory with daily rotation.
- **Enhanced Diagnostics**: Added timestamps, icons, and stack traces for better debugging.
- **Centralized Logger**: Replaced `console.log` with a robust `Logger` class across all modules (`Client`, `CommandHandler`, `MQTT`, `Auth`).

### 📚 Documentation & Examples
- **Professional README**: Completely rewrote `README.md` with comprehensive feature lists, badges, and clear usage guides.
- **Updated Examples**: Refactored `example.ts` to demonstrate environment variable usage and proper error handling.
- **Type Definitions**: Enhanced `d.ts` files for better IntelliSense support.

## [1.3.0] - 2026-02-08

### ⚡ MQTT Full Implementation & Security Hardening

#### **MQTT Real-Time Engine (Fully Implemented)**
- **Secure Connection**: Enhanced TLS/SSL handshake with robust error handling.
- **Delta Parsing**: Intelligent parsing of `/t_ms` deltas to handle messages, delivery receipts, and read receipts in real-time.
- **Auto-Reconnection**: Resilient connection logic with 3s retry interval to ensure always-on connectivity.
- **Topic Subscription**: Full coverage of `MESSAGING`, `TYPING`, `PRESENCE`, `NOTIFICATIONS`, `WEBRTC`, `P_P`, `P_A`.
- **QoS Support**: Explicit Quality of Service (QoS 0/1) handling for reliable message delivery.
- **Performance Metrics**: Integrated `PerformanceManager` to track latency and payload sizes.

#### **Security & Configuration**
- **Environment-Based AppState**: Added support for `process.env.FB_APPSTATE` to load session cookies securely in hosting environments (Docker, Vercel, Heroku), removing reliance on `appstate.json` files.
- **Enhanced Headers**: Added `Origin`, `Referer`, and `DNT` (Do Not Track) headers to `constants.ts` to mimic legitimate browser traffic.
- **Regex Pattern Matching**: Centralized `REGEX_PATTERNS` for robust token extraction (`DTSG`, `IRIS_SEQ_ID`, `LSD`, `JAZOEST`).
- **Firefox User Agents**: Expanded `USER_AGENTS` pool to include modern Firefox configurations for better fingerprint diversity.

#### **Bug Fixes & Optimizations**
- **Constants Standardization**: Fully implemented `constants.ts` to eliminate magic strings and ensure consistency across all modules.
- **Type Safety**: Fixed TypeScript errors in MQTT QoS definitions.
- **Connection Pooling**: Optimized HTTP/HTTPS agents for reduced latency.
- **Codebase Clean-up**: Replaced all placeholder values (Doc IDs, Mock Data) with real, functional constants in `friends.ts`, `notifications.ts`, and `constants.ts`.
- **Deduplication**: Verified and removed duplicate constant definitions across the codebase to ensure a single source of truth.

## [1.2.0] - 2026-02-08

### 🛡️ Enhanced Security & Anti-Detection
- **Behavioral Simulation**: `BehavioralSimulator` mimics typing speeds and idle times.
- **Security Guard System**: Integrated CAPTCHA solving (2captcha/Anti-Captcha support).
- **Advanced Fingerprinting**: Added `FingerprintManager` for canvas/audio fingerprint rotation.
- **User Agent Rotation**: Updated with 2026-era Chrome/Edge versions (Chrome 145+).
- **AutoRefresh Encryption**: Implemented AES-256 compatible cookie export (removed mock).

### 📊 Performance & Optimization
- **Message Queuing**: Added `MessageQueue` with throttling control (max 5 req/s) to prevent rate limits.
- **Response Caching**: Integrated LRU-like caching for `getThreadList` and `getUserInfo` to minimize redundant network calls.
- **Lazy Loading**: Applied dynamic imports for API modules to improve initial startup time.
- **Compression**: Enabled GZIP/Brotli compression for all requests to save bandwidth.
- **Metrics Tracking**: Real-time tracking of request duration, payload size, and error rates.

### 🐛 Bug Fixes
- Fixed `getFriendsList` placeholder (now uses GraphQL).

## [1.1.0] - 2026-02-08

### 📱 Full Feature Implementation
**Completed All Missing Core Features**

#### **Timeline & Social**
- **Create Posts**: Support for posting text to timeline, groups, or pages (`createPost`).
- **Post Interaction**: Like (`reactToPost`), Comment (`commentOnPost`), Share (`sharePost`), and Delete (`deletePost`) posts.
- **Privacy Controls**: Set post privacy to Everyone, Friends, or Self.

#### **Advanced Messaging**
- **Rich Media**: Dedicated helpers for `sendImage`, `sendVideo`, `sendAudio`, and `sendFile`.
- **Stickers**: Send stickers via `sendSticker` using sticker IDs.
- **Message Management**: Permanently delete messages via `deleteMessage`.

#### **Enhanced Group & Thread Management**
- **Group Settings**:
  - `setApprovalMode`: Toggle member approval requirement.
  - `approveJoinRequest`: Approve or reject pending group join requests.
  - `leaveGroup`: One-click method to exit group chats.
- **Thread Organization**:
  - `pinThread`: Pin important conversations to the top.
  - `muteThread`: Mute notifications for specific threads.
  - `archiveThread`: Archive/unarchive conversations.
  - `deleteThread`: Permanently delete entire conversation threads.

#### **Notifications**
- **Notification Center**: Retrieve latest notifications via `getNotifications`.
- **Read Status**: Mark all notifications as read via `markNotificationsRead`.

#### **User Actions**
- **Friend Requests**: `acceptFriendRequest` and `deleteFriendRequest` to manage incoming requests.

## [1.0.0] - 2026-02-08

### 🚀 Initial Release

We are excited to announce the first major release of **Panindigan API Library**, a powerful unofficial Facebook Chat API wrapper built with TypeScript. This release focuses on stability, type safety, and core messaging capabilities.

### ✨ Added

#### **Authentication & Security**
- **AppState-Based Login**: Implemented secure authentication using cookie-based AppState.
- **Session Management**: Automatic token extraction (`fb_dtsg`, `jazoest`, `userID`) for seamless session persistence.
- **Cookie Jar**: Integrated robust cookie handling to maintain active sessions and support auto-reconnection flows.

#### **Core Messaging Engine**
- **Send Messages**: Full support for sending plain text messages to users and groups.
- **Attachment Handling**: Native support for uploading and sending media (images, videos, files).
- **Reply System**: Implemented message reply functionality with context preservation (replying to specific Message IDs).
- **Message IDs**: Unique ID generation for reliable message tracking.
- **Unsend Message**: Added `unsendMessage` capability to remove messages for everyone.
- **Message Reactions**: Full support for adding/removing reactions (like, love, haha, etc.) via `sendMessageReaction`.
- **Message History**: Implemented `getMessageHistory` to retrieve past conversations with pagination support.

#### **Real-Time Event System (MQTT)**
- **MQTT Integration**: High-performance connection to Facebook's `edge-chat` websocket gateway.
- **Topic Subscription**: Active listening on critical topics including `/t_ms` (messages), `/thread_typing`, and `/presence`.
- **Typing Indicators**: Added `sendTypingIndicator` to show/hide typing status in threads.
- **Mark as Read**: Implemented `markAsRead` to update read receipts for conversations.

#### **Thread Management & Customization**
- **Thread Retrieval**: Integrated GraphQL Batch API (`o0` query) to fetch inbox threads efficiently.
- **Group Creation**: Added `createGroup` to initialize new group chats with multiple participants.
- **Participant Management**: Added capabilities to `add` and `remove` participants from group chats.
- **Customization Tools**:
  - **Change Emoji**: API to update the thread's default emoji.
  - **Change Color**: API to update the chat bubble color via `changeThreadColor`.
  - **Nicknames**: Functionality to set and update user nicknames within a thread.

#### **Data Retrieval**
- **User Information**: Replaced mock implementation with real `chat/user_info` endpoint integration to fetch detailed user profiles (Name, Vanity, Profile Picture, etc.).

#### **Advanced Group Management**
- **Polls**: Create polls with custom options via `createPoll`.
- **Admin Rights**: Promote and demote group admins using `changeAdminStatus`.
- **Group Identity**:
  - `changeThreadName`: Rename group chats.
  - `changeThreadImage`: Upload and set group conversation photos.

#### **Social Features**
- **Friend Management**:
  - `addFriend`: Send friend requests.
  - `cancelFriendRequest`: Cancel pending requests.
  - `removeFriend`: Unfriend users.
  - `getFriendsList`: Retrieve friends list via GraphQL.
- **Blocking**:
  - `blockUser`: Block a user on Messenger.
  - `unblockUser`: Unblock a previously blocked user.
- **Search**:
  - `searchUser`: Find users by name using Typeahead API.
- **Message Forwarding**:
  - `forwardMessage`: Forward existing messages to other threads.

#### **Infrastructure & Developer Experience**
- **Modular Architecture**: Refactored monolithic `Client.ts` into specialized modules under `src/api/` for better maintainability and scalability.
- **TypeScript Architecture**: Fully typed codebase with comprehensive interfaces for `User`, `Message`, `Thread`, and `AppState`.
- **Modern Stack**: Built on `pnpm` for efficient package management.
- **Utils & Helpers**:
  - `generateOfflineThreadingID` for unique message threading.
  - `parseGraphQLBatch` for handling complex Facebook response formats.
  - Custom `Axios` instance with header rotation and user-agent management.

### 🔐 AutoCookieRefresh 
**Fresh Cookies Every 20min + MQTT Keep-Alive Every 30s** 

#### Enhanced Cookie Management: 
- **20-Minute Refresh** - Cookies refreshed every 20 minutes 
- **MQTT Keep-Alive** - Heartbeat every 30 seconds 
- **Proactive Refresh** - Before expiration 
- **Session Validation** - Verify after each refresh 
- **Fallback Mechanism** - Re-login if refresh fails 
- **Cookie Encryption** - Encrypted cookie storage 
- **Multi-Account Sync** - Coordinated refresh for multiple accounts 
- **Background Processing** - Non-blocking refresh operations 


### ⚠️ Anti-Detection Best Practices 

1. **Always enable all anti-detection features** - Maximum protection 
2. **Use realistic device profiles** - Match your actual hardware 
3. **Maintain session consistency** - Don't change settings mid-session 
4. **Monitor rate limits** - Stay well below limits 
5. **Rotate regularly** - But not too frequently 
6. **Use proxies** - Different IPs for different accounts 
7. **Simulate human behavior** - Random delays, idle times 
8. **Keep cookies fresh** - 20-minute refresh is optimal 
9. **Monitor detection status** - Watch for warnings 
10. **Stay updated** - Update library regularly for latest protection

### � UserAgentRotator 
**Latest Chrome/Edge Configurations with Rotation** 

#### User Agent Features: 
- **Latest Versions** - Always updated Chrome/Edge versions 
- **Realistic Combinations** - OS + Browser + Version matching 
- **Mobile/Desktop Switching** - Platform rotation 
- **Version History** - Use recent but not cutting-edge versions 
- **Accept-Language Matching** - Consistent with IP location 
- **Platform Consistency** - Headers match user agent 
- **Automated Updates** - Auto-update to latest versions 
- **Weight-Based Selection** - Popular UA strings more likely

### 🎭 FingerprintManager 
**Session Fingerprint Management with Auto-Rotation** 

#### Features: 
- **Automatic Rotation** - Every 6 hours mag-rotate ng fingerprints 
- **Browser Fingerprint Spoofing** - Realistic browser fingerprints 
- **Canvas Fingerprint Randomization** - Unique canvas signatures 
- **WebGL Fingerprint Masking** - GPU fingerprint obfuscation 
- **Audio Context Fingerprinting** - Audio API signature randomization 
- **Font Fingerprint Variation** - Dynamic font list generation 
- **Screen Resolution Spoofing** - Realistic screen dimensions 
- **Timezone Consistency** - Matching timezone with IP location 
- **Plugin List Generation** - Realistic browser plugins

---
*Maintained by the Panindigan Team.*

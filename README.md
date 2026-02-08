# Panindigan FCA

<p align="center">
  <img src="https://img.shields.io/npm/v/panindigan-fca?color=blue&style=for-the-badge" alt="npm version" />
  <img src="https://img.shields.io/npm/dt/panindigan-fca?style=for-the-badge" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/nazzelofficial/panindigan-fca?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/TypeScript-5.7+-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" alt="Node.js" />
</p>

<p align="center">
  <strong>Unofficial Facebook Chat API Library</strong>
</p>

<p align="center">
  A robust, type-safe, and feature-rich TypeScript library for programmatic interaction with Facebook Messenger. Built for automation, chatbots, and social management tools with enterprise-grade reliability and anti-detection capabilities.
</p>

---

## ⚠️ Important Disclaimer

**Panindigan FCA is an UNOFFICIAL library** that uses reverse-engineered Facebook APIs. This library is **NOT affiliated with, endorsed by, or supported by Meta/Facebook**.

### Legal & Usage Warnings

- ⚠️ **Terms of Service**: Using this library may violate Facebook's Terms of Service
- ⚠️ **Account Risk**: Your Facebook account may be restricted, suspended, or banned
- ⚠️ **No Warranty**: This software is provided "as-is" without any guarantees
- ⚠️ **Educational Purpose**: Intended for educational and research purposes only
- ⚠️ **Use Responsibly**: Always respect privacy, consent, and applicable laws

**By using this library, you acknowledge and accept all risks associated with automated Facebook access.**

---

## 🚀 Key Features

### 📨 Messaging Engine
- ✅ **Rich Media Support**: Text, images, videos, audio, files, and stickers
- ✅ **Interactive Features**: Message replies, reactions, and unsend
- ✅ **Thread Management**: Create/manage groups, participants, customization (colors, emojis, nicknames)
- ✅ **Message History**: Fetch conversation history with pagination
- ✅ **Typing Indicators**: Send typing status to conversations
- ✅ **Read Receipts**: Mark messages as read/delivered

### ⚡ Real-Time Events (MQTT)
- 🔴 **Live Message Streaming**: Receive messages instantly via MQTT
- 👤 **Presence Updates**: Track online/offline status of users
- ⌨️ **Typing Events**: Real-time typing indicators
- 🔄 **Delta Parsing**: Intelligent `/t_ms` delta handling
- 🛡️ **Auto-Reconnection**: Exponential backoff with connection pooling
- 📊 **QoS Support**: Reliable message delivery guarantees

### 🛡️ Anti-Detection & Security
- 🎭 **Behavioral Simulation**: Human-like typing speeds and reading patterns
- 🖐️ **Fingerprint Rotation**: Canvas, WebGL, Audio, and Font randomization
- 🌐 **User Agent Rotation**: Modern Chrome/Edge UA strings
- 🔐 **Auto-Cookie Refresh**: Session management (every 20 minutes)
- 🤖 **CAPTCHA Integration**: 2captcha and Anti-Captcha support
- 🕵️ **Request Throttling**: Rate limiting to avoid detection

### 🛠️ Command System
- 📦 **Plugin Architecture**: Modular command registration
- 🔌 **Middleware Support**: Logging, permissions, rate limiting
- 📝 **Smart Argument Parsing**: Quoted strings, flags, and options
- 🎯 **Event-Driven**: `commandStart`, `commandError`, custom events
- 🔥 **Hot Reloading**: Dynamic command updates without restart
- 🎨 **Built-in Commands**: Extensible base command system

### 🎨 Developer Experience
- 📋 **Professional Logging**: Color-coded console output (chalk)
- 📁 **File Logging**: Automatic daily rotation and archival
- 📊 **Performance Metrics**: Response time and memory tracking
- 🔍 **TypeScript Native**: Full type definitions included
- 📚 **Comprehensive Docs**: Inline JSDoc comments
- 🧪 **Error Handling**: Graceful error recovery

### 👥 Social Features
- 📰 **Timeline Operations**: Create, like, comment, share, delete posts
- 👫 **Friend Management**: Send/accept/cancel friend requests
- 🚫 **Block/Unblock Users**: Manage blocked users list
- 🔔 **Notifications**: Retrieve and mark notifications as read
- 🔍 **Search API**: Find users, groups, pages via Typeahead
- 👤 **User Info**: Fetch profile data and metadata

---

## 📦 Installation

### Using npm
```bash
npm install panindigan-fca
```

### Using pnpm (Recommended)
```bash
pnpm add panindigan-fca
```

### Using yarn
```bash
yarn add panindigan-fca
```

### Requirements
- **Node.js**: >= 16.0.0
- **TypeScript**: >= 5.0 (for TypeScript projects)

---

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { PanindiganClient } from 'panindigan-fca';
import { logger } from 'panindigan-fca/utils/Logger';

async function main() {
  const client = new PanindiganClient({
    listenEvents: true,
    autoMarkRead: true,
    antiDetection: {
      autoRefresh: true,
      behavioralSim: true,
      fingerprint: true
    }
  });

  // Login using appstate
  await client.login({
    appState: JSON.parse(process.env.FB_APPSTATE!)
  });

  logger.success('✅ Bot started successfully!');

  // Listen for messages
  client.on('message', async (message) => {
    logger.info(`📩 ${message.senderID}: ${message.body}`);

    if (message.body === '!ping') {
      await client.sendMessage(message.threadId, 'Pong! 🏓');
    }
  });

  // Handle errors
  client.on('error', (error) => {
    logger.error('❌ Client error:', error);
  });
}

main().catch(console.error);
```

### 2. Getting AppState

You need to obtain your Facebook session credentials (appstate):

#### Method 1: Using Browser Extension (Recommended)
1. Install [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/) or similar
2. Login to Facebook
3. Export cookies as JSON
4. Convert to appstate format

#### Method 2: Using c3c-fbstate Tool
```bash
npx c3c-fbstate
```

⚠️ **Security Warning**: Never share your appstate publicly. Store it securely in environment variables.

```env
# .env
FB_APPSTATE={"cookies": [...]}
```

---

## 📚 Advanced Usage

### Command Handler System

```typescript
import { CommandHandler } from 'panindigan-fca/command';

const commands = new CommandHandler(client, {
  prefix: '!',
  caseSensitive: false,
  ignoreBots: true
});

// Register a command
commands.register({
  name: 'greet',
  description: 'Greets the user',
  usage: '!greet [name]',
  aliases: ['hello', 'hi'],
  execute: async (ctx) => {
    const name = ctx.args[0] || ctx.message.senderID;
    await ctx.reply(`Hello, ${name}! 👋`);
  }
});

// Add middleware
commands.use(async (ctx, next) => {
  // Log all commands
  logger.info(`Command: ${ctx.command.name} by ${ctx.message.senderID}`);
  await next();
});

// Permission middleware
commands.use(async (ctx, next) => {
  const adminIds = ['123456789'];
  if (ctx.command.adminOnly && !adminIds.includes(ctx.message.senderID)) {
    return ctx.reply('⛔ Admin only command!');
  }
  await next();
});

// Connect to client
client.on('message', (msg) => commands.handleMessage(msg));
```

### Sending Rich Media

```typescript
// Send image
await client.sendMessage(threadId, {
  body: 'Check this out!',
  attachment: fs.createReadStream('./image.jpg')
});

// Send multiple attachments
await client.sendMessage(threadId, {
  body: 'Gallery:',
  attachment: [
    fs.createReadStream('./photo1.jpg'),
    fs.createReadStream('./photo2.jpg')
  ]
});

// Send sticker
await client.sendMessage(threadId, {
  sticker: '369239263222822'
});

// Reply to a message
await client.sendMessage(threadId, {
  body: 'Replying to you!',
  mentions: [{ id: userId, tag: '@User' }]
}, messageId);
```

### Thread Management

```typescript
// Create a group
const groupId = await client.createGroup('Study Group', [userId1, userId2]);

// Add participant
await client.addUserToGroup(userId3, groupId);

// Remove participant
await client.removeUserFromGroup(userId1, groupId);

// Change thread color
await client.changeThreadColor('#ff0000', groupId);

// Change thread emoji
await client.changeThreadEmoji('🔥', groupId);

// Set nickname
await client.changeNickname('Cool Guy', groupId, userId1);

// Change thread name
await client.setTitle('New Group Name', groupId);
```

### Real-Time Events

```typescript
// Message events
client.on('message', (msg) => {
  console.log('New message:', msg.body);
});

// Typing indicator
client.on('typ', (event) => {
  console.log(`${event.from} is typing in ${event.threadId}`);
});

// Read receipt
client.on('read_receipt', (event) => {
  console.log(`${event.reader} read the message at ${event.time}`);
});

// Presence (online/offline)
client.on('presence', (event) => {
  console.log(`${event.userID} is now ${event.statuses}`);
});

// Message reaction
client.on('message_reaction', (event) => {
  console.log(`${event.userID} reacted with ${event.reaction}`);
});
```

### User & Search Operations

```typescript
// Get user info
const userInfo = await client.getUserInfo(userId);
console.log(userInfo);

// Search for users
const results = await client.searchForUser('John Doe');

// Get friend list
const friends = await client.getFriendsList();

// Send friend request
await client.addFriend(userId);

// Accept friend request
await client.acceptFriendRequest(userId);

// Block user
await client.blockUser(userId);
```

---

## ⚙️ Configuration Options

```typescript
interface PanindiganOptions {
  // Listen for real-time events via MQTT
  listenEvents?: boolean;          // default: true
  
  // Automatically mark messages as read
  autoMarkRead?: boolean;          // default: false
  
  // Automatically mark messages as delivered
  autoMarkDelivered?: boolean;     // default: true
  
  // Update presence status
  updatePresence?: boolean;        // default: false
  
  // Self-listen (receive own messages)
  selfListen?: boolean;            // default: false
  
  // Anti-detection features
  antiDetection?: {
    autoRefresh?: boolean;         // Auto-refresh session
    behavioralSim?: boolean;       // Simulate human behavior
    fingerprint?: boolean;         // Rotate fingerprints
    userAgent?: boolean;           // Rotate user agents
  };
  
  // Logging configuration
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  // Proxy configuration
  proxy?: string;                  // HTTP/HTTPS/SOCKS proxy URL
}
```

---

## 📖 API Reference

### Client Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `login(credentials)` | Authenticate with Facebook | `Promise<void>` |
| `sendMessage(threadId, message, replyTo?)` | Send a message | `Promise<MessageInfo>` |
| `sendTypingIndicator(threadId)` | Send typing indicator | `Promise<void>` |
| `markAsRead(threadId)` | Mark thread as read | `Promise<void>` |
| `unsendMessage(messageId)` | Unsend a message | `Promise<void>` |
| `reactMessage(messageId, reaction)` | React to a message | `Promise<void>` |
| `getUserInfo(userId)` | Get user information | `Promise<UserInfo>` |
| `getThreadInfo(threadId)` | Get thread details | `Promise<ThreadInfo>` |
| `getThreadHistory(threadId, count)` | Fetch message history | `Promise<Message[]>` |
| `createGroup(name, userIds)` | Create a group chat | `Promise<string>` |
| `addUserToGroup(userId, threadId)` | Add user to group | `Promise<void>` |
| `removeUserFromGroup(userId, threadId)` | Remove user from group | `Promise<void>` |
| `changeThreadColor(color, threadId)` | Change thread color | `Promise<void>` |
| `changeThreadEmoji(emoji, threadId)` | Change thread emoji | `Promise<void>` |
| `changeNickname(nickname, threadId, userId)` | Set user nickname | `Promise<void>` |
| `setTitle(title, threadId)` | Change group name | `Promise<void>` |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `Message` | New message received |
| `message_reply` | `Message` | Reply to a message |
| `message_unsend` | `UnsendEvent` | Message unsent |
| `message_reaction` | `ReactionEvent` | Message reaction |
| `typ` | `TypingEvent` | User typing |
| `read_receipt` | `ReadReceiptEvent` | Message read |
| `presence` | `PresenceEvent` | User online/offline |
| `error` | `Error` | Client error |

---

## 🔧 Troubleshooting

### Common Issues

#### "Login Failed" or "Invalid Credentials"
- ✅ Verify your appstate is valid and not expired
- ✅ Try logging in manually to check for 2FA/checkpoint
- ✅ Use a fresh appstate from a recent browser session

#### "MQTT Connection Failed"
- ✅ Check your internet connection
- ✅ Verify firewall/proxy settings
- ✅ Enable `antiDetection.autoRefresh`

#### "Account Restricted/Banned"
- ⚠️ Facebook detected automated behavior
- ⚠️ Reduce request frequency
- ⚠️ Enable all anti-detection features
- ⚠️ Use a proxy or rotate IP addresses

#### "Missing TypeScript Definitions"
- ✅ Ensure `typescript` >= 5.0 is installed
- ✅ Check `tsconfig.json` includes `"moduleResolution": "node"`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/nazzelofficial/panindigan-fca.git
cd panindigan-fca

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run in development mode
pnpm run dev
```

### Guidelines

- ✅ Follow [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- ✅ Write meaningful commit messages
- ✅ Add JSDoc comments for public APIs
- ✅ Test your changes thoroughly
- ✅ Update documentation when needed

### Useful Links

- 📖 [Contributing Guide](CONTRIBUTING.md)
- 📋 [Code of Conduct](CODE_OF_CONDUCT.md)
- 🔒 [Security Policy](SECURITY.md)
- 📝 [Changelog](CHANGELOG.md)

---

## 🛡️ Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead:

1. Email: **security@panindigan.dev** (if available) or
2. Open a private security advisory on GitHub
3. Include detailed steps to reproduce

See our [Security Policy](SECURITY.md) for more details.

### Security Best Practices

- 🔐 Never commit `appstate.json` or credentials
- 🔐 Use environment variables for sensitive data
- 🔐 Rotate credentials regularly
- 🔐 Enable all anti-detection features
- 🔐 Monitor account activity for suspicious behavior

---

## 📊 Project Status

| Feature | Status |
|---------|--------|
| Core Messaging | ✅ Stable |
| MQTT Events | ✅ Stable |
| Command Handler | ✅ Stable |
| Anti-Detection | ✅ Beta |
| Timeline API | ⚠️ Experimental |
| Voice/Video Calls | ❌ Not Supported |

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE.md](LICENSE.md) file for details.

```
MIT License

Copyright (c) 2024-2025 Panindigan Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

- Inspired by [fca-unofficial](https://github.com/Schmavery/facebook-chat-api)
- Built with ❤️ by the Panindigan Team
- Community contributors and testers

---

## 📞 Support & Community

- 🌐 **Website**: [panindigan.com](https://panindigan.com)
- 👤 **Developer**: [nazzelofficial.com](https://nazzelofficial.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/nazzelofficial/panindigan-fca/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/nazzelofficial/panindigan-fca/discussions)
- 📧 **Email**: support@panindigan.com
- 📚 **Documentation**: [Wiki](https://github.com/nazzelofficial/panindigan-fca/wiki)

---

## ⚖️ Legal Notice

This library is an independent project and is **NOT** affiliated with, endorsed by, or supported by Meta Platforms, Inc. (Facebook). 

"Facebook" and "Messenger" are trademarks of Meta Platforms, Inc. Use of these trademarks does not imply endorsement.

**Use at your own risk. The developers and contributors are not responsible for any consequences resulting from the use of this library, including but not limited to account restrictions, data loss, or legal issues.**

---

<p align="center">
  <strong>Made with ❤️ by the Panindigan Team</strong>
  <br>
  <sub>Empowering developers to build amazing things</sub>
</p>

<p align="center">
  <a href="https://github.com/nazzelofficial/panindigan-fca">⭐ Star us on GitHub</a>
  •
  <a href="https://github.com/nazzelofficial/panindigan-fca/issues">🐛 Report Bug</a>
  •
  <a href="https://github.com/nazzelofficial/panindigan-fca/issues">✨ Request Feature</a>
</p>
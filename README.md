# Panindigan - Unofficial Facebook Chat API

<p align="center">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/Status-Stable-brightgreen.svg" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.4.0-orange.svg" alt="Version" />
</p>

Panindigan is a robust, type-safe, and feature-rich library for interacting with Facebook Messenger programmatically. Built with **TypeScript** and engineered for **reliability** and **anti-detection**, it leverages Facebook's internal GraphQL API and MQTT gateway to provide a seamless developer experience.

Whether you're building a chatbot, an automation tool, or a social management dashboard, Panindigan provides the professional-grade tools you need.

---

## 🚀 Key Features

### 📨 Core Messaging Engine
*   **Rich Media Support**: Send text, images, videos, audio, files, and stickers.
*   **Interactive Messaging**: Support for replies, message unsend, and message reactions.
*   **Thread Management**: Create groups, add/remove participants, change thread colors/emojis/nicknames.
*   **History**: Fetch message history with pagination.

### ⚡ Real-Time MQTT Engine
*   **Live Events**: Listen to incoming messages, typing indicators, and presence updates in real-time.
*   **Delta Parsing**: Intelligent handling of `/t_ms` deltas for immediate updates.
*   **Resilience**: Auto-reconnection with exponential backoff and connection pooling.
*   **QoS Support**: Reliable message delivery with Quality of Service handling.

### 🛡️ Security & Anti-Detection
*   **Behavioral Simulation**: Mimics human typing speeds, idle times, and reading patterns.
*   **Fingerprint Management**: Rotates Canvas, WebGL, Audio, and Font fingerprints to avoid detection.
*   **User Agent Rotation**: Intelligent rotation of modern Chrome/Edge user agents.
*   **Auto-Cookie Refresh**: Automatically refreshes session cookies every 20 minutes to prevent expiration.
*   **CAPTCHA Handling**: Integrated support for 2captcha/Anti-Captcha.

### 🛠️ Advanced Command System
*   **Middleware Support**: Intercept commands for logging, permission checks, or rate limiting.
*   **Smart Parsing**: Handles quoted arguments (e.g., `!say "Hello World"`).
*   **Event-Driven**: Listen to `commandStart`, `commandError`, and custom events.
*   **Hot Reloading**: Update command logic dynamically without restarting the application.

### 🎨 Professional Logging
*   **Visual Diagnostics**: Color-coded logs (SUCCESS 🟢, INFO 🔵, WARNING 🟡, ERROR 🔴) using `chalk`.
*   **File Logging**: Automatic daily log rotation and archival.
*   **Performance Metrics**: Track response times and memory usage.

### 👥 Social & Timeline
*   **Timeline Operations**: Create posts, like, comment, share, and delete posts.
*   **Friend Management**: Add friends, accept/cancel requests, unblock users.
*   **Notifications**: Retrieve and mark notifications as read.
*   **Search**: Find users and groups via Typeahead API.

---

## 📦 Installation

```bash
pnpm add panindigan-fca
# or
npm install panindigan-fca
# or
yarn add panindigan-fca
```

---

## ⚙️ Configuration

Panindigan supports secure configuration via environment variables, making it ideal for containerized environments (Docker, Vercel, Heroku).

1.  **Generate AppState**: Login manually once to get your `appstate.json` or base64 string.
2.  **Set Environment Variable**:
    ```env
    FB_APPSTATE=your_base64_encoded_appstate_or_json_string
    ```

---

## ⚡ Quick Start

Here's a complete example showing how to set up a bot with logging and command handling.

```typescript
import { PanindiganClient } from 'panindigan-fca';
import { logger } from 'panindigan-fca/utils/Logger';

async function main() {
  const client = new PanindiganClient({
    listenEvents: true,
    autoMarkRead: false,
    antiDetection: {
      autoRefresh: true,
      behavioralSim: true,
      fingerprint: true
    }
  });

  // Login using Environment Variable (Recommended)
  // Ensure process.env.FB_APPSTATE is set
  await client.login();

  logger.success('Bot has started successfully!');

  // Listen for messages
  client.on('message', async (message) => {
    logger.info(`Received message from ${message.senderID}: ${message.body}`);

    if (message.body === '!ping') {
      await client.sendMessage(message.threadId, 'Pong! 🏓');
    }
  });

  // Handle errors
  client.on('error', (err) => {
    logger.error('Client encountered an error', err);
  });
}

main().catch(console.error);
```

---

## 📚 Advanced Usage

### Using the Command Handler

Panindigan comes with a built-in, scalable command handler.

```typescript
import { CommandHandler } from 'panindigan-fca/command';

const commands = new CommandHandler(client);

// Register a command
commands.register({
  name: 'echo',
  description: 'Repeats what you say',
  usage: '!echo <text>',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    await ctx.reply(text);
  }
});

// Add Middleware (e.g., Logger)
commands.use(async (ctx, next) => {
  logger.info(`Executing command: ${ctx.command.name}`);
  await next();
});

// Connect to message stream
client.on('message', (msg) => commands.handleMessage(msg));
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

## 🤝 Contributing & Community

We welcome contributions from the community! Whether it's reporting a bug, suggesting a new feature, or submitting a pull request, your input is valuable.

*   **[Contributing Guide](CONTRIBUTING.md)**: Learn how to contribute to the project.
*   **[Code of Conduct](CODE_OF_CONDUCT.md)**: Our pledge to foster an open and welcoming environment.
*   **[Security Policy](SECURITY.md)**: How to report security vulnerabilities responsibly.

---

<p align="center">
  Made with ❤️ by the Panindigan Team
</p>

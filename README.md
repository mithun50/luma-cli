# Luma-CLI

```
██╗     ██╗   ██╗███╗   ███╗ █████╗        ██████╗██╗     ██╗
██║     ██║   ██║████╗ ████║██╔══██╗      ██╔════╝██║     ██║
██║     ██║   ██║██╔████╔██║███████║█████╗██║     ██║     ██║
██║     ██║   ██║██║╚██╔╝██║██╔══██║╚════╝██║     ██║     ██║
███████╗╚██████╔╝██║ ╚═╝ ██║██║  ██║      ╚██████╗███████╗██║
╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝       ╚═════╝╚══════╝╚═╝
```

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://expo.dev)

> **Remote monitoring and control for Antigravity IDE** — Access your AI coding sessions from anywhere, get notified when responses are ready, and never miss a generation.

---

## Why Luma-CLI?

Ever started a long AI generation and had to stare at your screen waiting? With Luma-CLI:

```
📱 Send prompt from your phone
🚶 Walk away, grab coffee
🔔 Get notified when AI is done
✨ Come back to a ready response
```

---

## Table of Contents

<details>
<summary>Click to expand</summary>

- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [CLI Commands](#-cli-commands)
- [Mobile App](#-mobile-app)
- [Notifications](#-notifications)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

</details>

---

## ✨ Features

| Feature | Description |
|:--------|:------------|
| 📡 **Remote Access** | Connect via local WiFi or global ngrok tunnel |
| 🔄 **Real-Time Sync** | Live updates with 1-second polling |
| 💬 **Remote Control** | Send messages, stop generations, switch modes |
| 🔔 **Smart Notifications** | Push alerts when AI finishes generating |
| 🔒 **Secure** | HTTPS with auto-generated SSL certificates |
| 📱 **Mobile App** | Native Expo app for iOS and Android |
| 🎨 **Modern CLI** | Beautiful terminal UI with QR codes |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MOBILE APP                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Connect     │  │ Chat View   │  │ Notifications       │  │
│  │ Screen      │  │ (WebView)   │  │ (Expo Notifications)│  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ WebSocket / HTTP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       LUMA SERVER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Express     │  │ WebSocket   │  │ Polling Loop        │  │
│  │ REST API    │  │ Events      │  │ (Generation Detect) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ Chrome DevTools Protocol
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    ANTIGRAVITY IDE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Chat UI     │  │ AI Models   │  │ Debug Port 9000     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

| Requirement | Version | Check |
|:------------|:--------|:------|
| Node.js | 18+ | `node --version` |
| npm | 8+ | `npm --version` |
| Antigravity IDE | Latest | Must support debug mode |

### Install

```bash
# Clone repository
git clone https://github.com/mithun50/luma-cli.git
cd luma-cli

# Install backend dependencies
npm install

# Install mobile dependencies
cd mobile && npm install && cd ..

# Link CLI globally (optional)
npm link
```

### Verify

```bash
luma-cli --version
# Output: 1.0.0
```

---

## 🚀 Quick Start

### Step 1: Start Antigravity with Debug Mode

```bash
antigravity . --remote-debugging-port=9000
```

### Step 2: Launch Luma Server

```bash
luma-cli start
```

You'll see:
```
╔═══════════════════════════════════════╗
║           LUMA-CLI v1.0.0             ║
╚═══════════════════════════════════════╝

🚀 Starting Luma server in LOCAL mode...
✅ Found Antigravity on port 9000
✅ Connected! Found 3 execution contexts

📡 Connection Info:
   URL: http://192.168.1.100:3000

█████████████████████████████
█ ▄▄▄▄▄ █ ▀▄▀▄█ ▄▄▄▄▄ █
█ █   █ █▀▄ ▀██ █   █ █
█ █▄▄▄█ █ ▄▀ ██ █▄▄▄█ █
█████████████████████████████

✅ Server is running
⌨️  Press Ctrl+C to stop
```

### Step 3: Connect Mobile App

```bash
cd mobile
npx expo start
```

Scan QR code with Expo Go app → Enter server URL → Start chatting!

---

## 💻 CLI Commands

### `luma-cli start`

Start the Luma server.

```bash
# Interactive mode (choose local/web)
luma-cli start

# Local network mode
luma-cli start --local

# Global access via ngrok
luma-cli start --web

# Custom port
luma-cli start --port 8080
```

| Option | Short | Description |
|:-------|:------|:------------|
| `--local` | `-l` | LAN/WiFi mode (default) |
| `--web` | `-w` | ngrok tunnel for global access |
| `--port <number>` | `-p` | Custom port (default: 3000) |

---

### `luma-cli config`

Manage configuration.

```bash
# Show current config
luma-cli config show

# Set password
luma-cli config set password mySecretPass

# Set ngrok token
luma-cli config set ngrok-token 2abc123xyz...

# Reset to defaults
luma-cli config reset
```

| Action | Description |
|:-------|:------------|
| `show` | Display current configuration |
| `set <key> <value>` | Set a config value |
| `reset` | Reset all to defaults |

**Config Keys:**

| Key | Environment Variable | Description |
|:----|:---------------------|:------------|
| `password` | `APP_PASSWORD` | Auth password |
| `ngrok-token` | `NGROK_AUTHTOKEN` | ngrok auth token |
| `port` | `PORT` | Server port |

---

### `luma-cli ssl`

Manage SSL certificates.

```bash
# Check SSL status
luma-cli ssl status

# Generate new certificates
luma-cli ssl generate
```

| Action | Description |
|:-------|:------------|
| `status` | Check if SSL certs exist |
| `generate` | Create new self-signed certs |

---

### `luma-cli info`

Display connection info and QR codes.

```bash
luma-cli info
```

Shows:
- Local URL with QR code
- ngrok tunnel URL (if active)
- Server configuration
- Quick tips

---

## 📱 Mobile App

### Setup

```bash
cd mobile
npm install
npx expo start
```

### Screens

| Screen | Description |
|:-------|:------------|
| **Connect** | Enter server URL or scan QR code |
| **Chat** | View live chat snapshot from Antigravity |
| **Settings** | Change mode/model, disconnect |

### Controls

| Control | Action |
|:--------|:-------|
| **Send Button** | Send message to AI |
| **Stop Button** | Stop current generation |
| **Mode Toggle** | Switch Fast/Planning mode |
| **Model Selector** | Change AI model |

---

## 🔔 Notifications

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. USER SENDS MESSAGE                                  │
│     📱 Mobile App → 🖥️ Luma Server → 🤖 Antigravity    │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  2. GENERATION STARTS                                   │
│     🤖 Antigravity starts generating                    │
│     🔍 Luma detects via CDP (stop button appears)       │
│     📡 WebSocket: { type: "generation_started" }        │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  3. USER SWITCHES APP                                   │
│     📱 App goes to background                           │
│     ☕ User grabs coffee                                │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  4. GENERATION COMPLETES                                │
│     🤖 Antigravity finishes response                    │
│     🔍 Luma detects (stop button disappears)            │
│     📡 WebSocket: { type: "generation_complete" }       │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  5. NOTIFICATION SENT                                   │
│     🔔 Push notification appears                        │
│     📱 "AI Response Ready (15s)"                        │
│     👆 User taps to view response                       │
└─────────────────────────────────────────────────────────┘
```

### Notification Types

| Type | When | Content |
|:-----|:-----|:--------|
| **Generation Complete** | AI finishes responding | "AI Response Ready (Xs)" |
| **Error** | Connection/API error | Error message |

### Detection Methods

Luma uses multiple methods to detect generation state:

| Method | How It Works | Reliability |
|:-------|:-------------|:------------|
| Stop Button | Detects visible stop button | ⭐⭐⭐⭐⭐ |
| Stop Icon | Detects stop icon (square SVG) | ⭐⭐⭐⭐ |
| Spinner | Detects loading animations | ⭐⭐⭐ |
| Cursor | Detects blinking text cursor | ⭐⭐⭐ |
| Input State | Checks if input is disabled | ⭐⭐ |

### Configuration

Notifications are configurable in the mobile app:

```javascript
// In useNotifications hook
notifications.updateSettings({
  enabled: true,        // Master toggle
  sound: true,          // Play sound
  vibrate: true,        // Vibrate device
  onGenerationComplete: true,  // Notify on complete
  onError: true,        // Notify on errors
});
```

---

## 🔌 API Reference

### Endpoints

| Endpoint | Method | Auth | Description |
|:---------|:-------|:-----|:------------|
| `/health` | GET | No | Server health check |
| `/snapshot` | GET | Yes | Get chat HTML snapshot |
| `/send` | POST | Yes | Send message |
| `/stop` | POST | Yes | Stop generation |
| `/set-mode` | POST | Yes | Set Fast/Planning mode |
| `/set-model` | POST | Yes | Set AI model |
| `/app-state` | GET | Yes | Get current mode/model |
| `/remote-click` | POST | Yes | Click element |
| `/remote-scroll` | POST | Yes | Sync scroll |
| `/login` | POST | No | Authenticate |
| `/logout` | POST | Yes | Clear session |

### WebSocket Events

| Event | Direction | Payload |
|:------|:----------|:--------|
| `connected` | Server→Client | — |
| `snapshot_update` | Server→Client | `{ isGenerating, timestamp }` |
| `generation_started` | Server→Client | `{ timestamp }` |
| `generation_complete` | Server→Client | `{ duration, timestamp }` |
| `error` | Server→Client | `{ message }` |

### Examples

<details>
<summary>Health Check</summary>

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "cdp": true,
  "mode": "Fast",
  "model": "Claude 3.5 Sonnet"
}
```
</details>

<details>
<summary>Send Message</summary>

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, AI!"}' \
  --cookie "ag_auth_token=..."
```

Response:
```json
{
  "success": true,
  "messageId": "msg_123"
}
```
</details>

<details>
<summary>Get Snapshot</summary>

```bash
curl http://localhost:3000/snapshot \
  --cookie "ag_auth_token=..."
```

Response:
```json
{
  "html": "<div id=\"cascade\">...</div>",
  "css": "...",
  "backgroundColor": "#1a1a2e",
  "scrollInfo": {
    "scrollTop": 0,
    "scrollPercent": 0
  }
}
```
</details>

---

## ⚙️ Configuration

### Environment Variables

Create `.env` in project root:

```env
# Server
PORT=3000
APP_PASSWORD=your_secure_password

# ngrok (for web mode)
NGROK_AUTHTOKEN=your_ngrok_token

# Advanced (optional)
# COOKIE_SECRET=custom_secret
# CDP_CALL_TIMEOUT=30000
# POLL_INTERVAL=1000
```

### Defaults

| Setting | Default | Description |
|:--------|:--------|:------------|
| `PORT` | 3000 | Server port |
| `APP_PASSWORD` | antigravity | Auth password |
| `CDP_PORTS` | 9000-9003 | Debug ports to scan |
| `POLL_INTERVAL` | 1000ms | Snapshot polling |
| `COOKIE_MAX_AGE` | 30 days | Session lifetime |

---

## 🔧 Troubleshooting

### Connection Issues

<details>
<summary>"Cannot connect to Antigravity"</summary>

1. Ensure debug mode is enabled:
   ```bash
   antigravity . --remote-debugging-port=9000
   ```

2. Check ports are accessible:
   ```bash
   curl http://localhost:9000/json
   ```

3. Verify health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```
</details>

<details>
<summary>"ngrok tunnel failed"</summary>

1. Verify token is set:
   ```bash
   luma-cli config show
   ```

2. Check internet connection

3. Reset token:
   ```bash
   luma-cli config set ngrok-token NEW_TOKEN
   ```
</details>

<details>
<summary>"SSL certificate error"</summary>

1. Regenerate certificates:
   ```bash
   luma-cli ssl generate
   ```

2. On mobile, accept self-signed cert warning

3. In browser: Advanced → Proceed anyway
</details>

<details>
<summary>"Notifications not working"</summary>

1. Check permission was granted:
   ```javascript
   // In app, hasPermission should be true
   const { hasPermission } = useNotifications();
   ```

2. Ensure app is in background when testing

3. Check notification settings in phone settings
</details>

---

## 📁 Project Structure

```
luma-cli/
├── bin/
│   └── luma-cli.js           # CLI entry point
│
├── backend/
│   ├── cdp/                  # Chrome DevTools Protocol
│   │   ├── connection.js     # WebSocket connection
│   │   ├── discovery.js      # Port scanning
│   │   ├── generation.js     # Generation detection ⭐
│   │   ├── interactions.js   # Click/scroll
│   │   ├── messaging.js      # Send/stop
│   │   ├── settings.js       # Mode/model
│   │   ├── snapshot.js       # DOM capture
│   │   └── state.js          # App state
│   │
│   ├── cli/                  # CLI commands
│   │   ├── commands/
│   │   │   ├── start.js
│   │   │   ├── config.js
│   │   │   ├── ssl.js
│   │   │   └── info.js
│   │   ├── qrcode.js
│   │   ├── tunnel.js
│   │   └── prompts.js
│   │
│   ├── server/               # Express server
│   │   ├── express.js
│   │   ├── websocket.js
│   │   ├── polling.js        # Generation monitoring ⭐
│   │   └── index.js
│   │
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── settings.js
│   │   ├── interactions.js
│   │   └── system.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── ngrok.js
│   │
│   ├── ssl/
│   │   ├── generator.js
│   │   └── openssl.js
│   │
│   ├── utils/
│   │   ├── network.js
│   │   ├── process.js
│   │   ├── hash.js
│   │   ├── passcode.js
│   │   └── logger.js
│   │
│   └── config/
│       ├── defaults.js
│       └── index.js
│
├── mobile/                   # Expo React Native app
│   ├── app/
│   │   ├── _layout.js
│   │   └── index.js
│   │
│   ├── components/
│   │   ├── ChatView.js
│   │   ├── ConnectScreen.js
│   │   ├── Header.js
│   │   ├── InputBar.js
│   │   └── SettingsModal.js
│   │
│   ├── hooks/
│   │   ├── useConnection.js
│   │   ├── useSnapshot.js
│   │   ├── useAppState.js
│   │   └── useNotifications.js  ⭐
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── websocket.js
│   │   ├── storage.js
│   │   └── notifications.js     ⭐
│   │
│   └── constants/
│       ├── theme.js
│       └── config.js
│
├── package.json
├── .env.example
├── LICENSE
└── README.md
```

**⭐ = New notification-related files**

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

**GNU General Public License v3.0**

```
Luma-CLI: Remote monitoring and control for Antigravity IDE
Copyright (C) 2025 Mithun Gowda B

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

See [LICENSE](LICENSE) for full text.

---

<div align="center">

**Made with ❤️ by [Mithun Gowda B](https://github.com/mithun50)**

[Report Bug](https://github.com/mithun50/luma-cli/issues) · [Request Feature](https://github.com/mithun50/luma-cli/issues)

</div>

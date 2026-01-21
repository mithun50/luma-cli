# Contributing to Luma-CLI

Thank you for considering contributing to Luma-CLI! Your contributions help make remote AI development better for everyone.

## How to Contribute

### 1. Reporting Bugs

- **Check existing issues** to avoid duplicates
- **Provide context**: OS, Node.js version, Antigravity version
- **Include logs**: Terminal output when the error occurred
- **Steps to reproduce**: Clear instructions to replicate the issue

### 2. Suggesting Features

- Open a "Feature Request" issue on GitHub
- Describe the use case and expected behavior
- Include mockups if it's a UI change

### 3. Development Workflow

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/luma-cli.git
   cd luma-cli
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Install dependencies**:
   ```bash
   npm install
   cd mobile && npm install
   ```
5. **Make your changes**
6. **Test thoroughly**
7. **Submit a PR** with a clear description

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `bin/` | CLI entry point |
| `backend/cli/` | CLI commands and utilities |
| `backend/server/` | Express server and WebSocket |
| `backend/cdp/` | Chrome DevTools Protocol integration |
| `backend/routes/` | API route handlers |
| `backend/middleware/` | Auth and ngrok middleware |
| `backend/ssl/` | SSL certificate generation |
| `backend/utils/` | Utility functions |
| `backend/config/` | Configuration management |
| `mobile/` | Expo React Native app |

## Development Setup

### Backend

```bash
# Install dependencies
npm install

# Start Antigravity with debug mode
antigravity . --remote-debugging-port=9000

# Run the server
node bin/luma-cli.js start --local
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

## Pre-submission Checklist

- [ ] Code follows existing style
- [ ] No hardcoded IPs or credentials
- [ ] SSL certificates are NOT committed
- [ ] Both HTTP and HTTPS modes work
- [ ] Mobile app tested on device/emulator
- [ ] CLI commands work as expected
- [ ] Documentation updated if needed

## Testing

### Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get snapshot
curl http://localhost:3000/snapshot

# HTTPS (after generating certs)
curl -k https://localhost:3000/health
```

### Mobile App

- Test on both iOS and Android
- Test with local and web mode
- Verify real-time updates work

## Code Style

- Use ES modules (import/export)
- Use async/await for async operations
- Add JSDoc comments for functions
- Keep functions focused and small

## Author

**Mithun Gowda B** ([@mithun50](https://github.com/mithun50))

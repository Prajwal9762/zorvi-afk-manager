# ZORVI AFK Manager

A lightweight Node.js 22+ Minecraft connection manager for ZORVI Studios. It connects with Mineflayer, reports connection state, and reconnects after a disconnect. It performs no movement, clicking, mining, fishing, combat, or other gameplay actions.

## Requirements

- Node.js 22 or newer
- npm
- Permission from the Minecraft server to connect and, if enabled, use the configured commands

## Setup

```sh
npm install
cp .env.example .env
```

Edit `.env` with the server settings. Keep `COMMAND_SEQUENCE_ENABLED=false` unless the server rules permit the command sequence. Set `MINECRAFT_PASSWORD` in `.env` only if the sequence is permitted and `/login` is required. The program never writes the password to its logs.

Start the connection manager:

```sh
npm start
```

Check JavaScript syntax:

```sh
npm run check
```

Press `Ctrl+C` to shut down cleanly. On a Linux VPS, use a process manager such as systemd or pm2 if you want the process to restart after a machine reboot.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `MINECRAFT_HOST` | `minechat.levyathan.ch` | Server hostname |
| `MINECRAFT_PORT` | `25565` | Server port |
| `MINECRAFT_USERNAME` | `SAROJGMG` | Minecraft username |
| `MINECRAFT_AUTH` | `offline` | Mineflayer authentication mode: `offline` or `microsoft` |
| `MINECRAFT_PASSWORD` | empty | Server `/login` password; only used when the sequence is enabled |
| `COMMAND_SEQUENCE_ENABLED` | `false` | Enables `/login`, followed by the configured commands |
| `COMMAND_DELAY_SECONDS` | `5` | Delay between successive commands |
| `COMMANDS` | `/go sur,/home fish,/afk` | Comma-separated commands after `/login` |
| `RECONNECT_DELAY_SECONDS` | `30` | Wait before reconnecting after a disconnect |

With Microsoft authentication, Mineflayer may ask for account sign-in through its supported authentication flow. The server `/login` password is separate from Microsoft account credentials.

## Security

- `.env` is ignored by Git; never commit it or share its contents.
- Do not put secrets in source files or command-line arguments.
- Logs intentionally omit server error details and command text, so credentials are not exposed.
- Review the server rules before enabling any commands. This project does not implement anti-AFK bypasses or artificial player activity.

## GitHub Actions

The workflow uses Node.js 22, installs dependencies, checks source syntax, and runs `npm test --if-present` so any configured test suite is picked up automatically.

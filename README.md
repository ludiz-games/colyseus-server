# @ludiz/colyseus-server

Generic Colyseus server for ludiz-vibe game templates. This package provides a data-driven, XState-powered Colyseus server that loads game definitions from DSL files.

## Features

- 🎮 **Generic Game Server**: No hardcoded game logic, everything driven by DSL
- 🔄 **XState Integration**: State machines for robust game flow management
- 📁 **DSL-Based**: Schema, machine, and data defined in separate JSON files
- 🛠️ **CLI Interface**: Easy development server with hot-reload support
- 🔗 **Link-Friendly**: Supports npm link for local development

## Installation

### For Local Development (Monorepo)

```bash
# In the colyseus-server package
cd packages/colyseus-server
pnpm link --global

# In your game template
cd apps/your-game-template
pnpm link --global @ludiz/colyseus-server
```

### For Production Templates

```bash
npm install @ludiz/colyseus-server --save-dev
```

## Usage

### CLI Commands

Start the development server:

```bash
# Using npm script (recommended)
pnpm run dev

# Direct CLI usage
ludiz-colyseus --dsl-dir ./dsl --port 2567

# With custom options
ludiz-colyseus --dsl-dir ./game-config --port 3000 --env .env.local
```

### DSL Structure

Your game template should have a `dsl/` directory with these files:

```
dsl/
├── manifest.json    # Game metadata and configuration
├── schema.json      # Colyseus state schema definition
├── machine.json     # XState machine definition
└── data.json        # Game content and static data
```

#### manifest.json

```json
{
  "slug": "my-game",
  "name": "My Awesome Game",
  "description": "A fun multiplayer game",
  "version": "1.0.0",
  "actions": ["setState", "increment", "log"]
}
```

#### schema.json

```json
{
  "root": "GameState",
  "classes": {
    "Player": {
      "name": { "type": "string" },
      "score": { "type": "number" }
    },
    "GameState": {
      "players": { "map": "Player" }
    }
  },
  "defaults": {
    "Player": { "name": "", "score": 0 },
    "GameState": {}
  }
}
```

#### machine.json

```json
{
  "id": "game-machine",
  "initial": "waiting",
  "states": {
    "waiting": {
      "on": {
        "start": {
          "actions": [
            { "type": "setState", "path": "gameStarted", "value": true }
          ]
        }
      }
    }
  }
}
```

#### data.json

```json
{
  "gameConfig": {
    "maxPlayers": 4,
    "timeLimit": 300
  }
}
```

## Development Workflow

### Local Development (Monorepo)

1. Link the server package globally
2. Link it in your game template
3. Run `pnpm run dev` to start both server and frontend

### Production Templates

1. Install `@ludiz/colyseus-server` as devDependency
2. Templates work independently without the monorepo
3. Server points to production Colyseus infrastructure

## Package Scripts

Add these scripts to your game template's `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"ludiz-colyseus --dsl-dir ./dsl --port 2567\" \"vite --port 3003\"",
    "server": "ludiz-colyseus --dsl-dir ./dsl --port 2567"
  },
  "devDependencies": {
    "@ludiz/colyseus-server": "^1.0.0",
    "concurrently": "^9.1.0"
  }
}
```

## Room Connection

Connect from your frontend using the definition slug:

```javascript
import { Client } from "colyseus.js";

const client = new Client("ws://localhost:2567");
const room = await client.joinOrCreate("project", {
  definitionSlug: "my-game",
});
```

## CLI Options

| Option             | Description           | Default |
| ------------------ | --------------------- | ------- |
| `--dsl-dir <path>` | Path to DSL directory | `./dsl` |
| `--port <number>`  | Server port           | `2567`  |
| `--env <file>`     | Environment file path | `.env`  |
| `--help`           | Show help message     | -       |

## Environment Variables

| Variable        | Description                     |
| --------------- | ------------------------------- |
| `LUDIZ_DSL_DIR` | DSL directory path (set by CLI) |
| `PORT`          | Server port                     |
| `NODE_ENV`      | Environment mode                |

## Development vs Production

### Development

- Uses local DSL files from `dsl/` directory
- Hot-reload support for DSL changes
- Runs as devDependency via npm link

### Production

- Templates are self-contained with DSL files
- Points to managed Colyseus infrastructure
- No server code in production builds

## Troubleshooting

### CLI Not Found

```bash
# Re-link the package
cd packages/colyseus-server
pnpm run build
pnpm link --global

cd apps/your-game-template
pnpm link --global @ludiz/colyseus-server
```

### Server Exits Immediately

- Check that DSL directory exists and contains required files
- Verify all JSON files are valid
- Check console for validation errors

### Connection Issues

- Ensure server is running on correct port
- Check firewall settings
- Verify frontend is connecting to correct URL
# Fixed git integration

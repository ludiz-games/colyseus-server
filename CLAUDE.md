# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start server in development mode with hot reload (uses tsx watch)
- `pnpm build` - Build TypeScript to JavaScript (outputs to build/)
- `pnpm start` - Start production server from build/
- `pnpm test` - Run all tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm check-types` - Type check without emitting files
- `pnpm clean` - Clean build directory

## Architecture Overview

This is a **data-driven Colyseus multiplayer server** that uses a fully generic architecture. Key architectural principles:

### Core Components

1. **GenericRoom** (`src/rooms/GenericRoom.ts`) - The main room class that loads game definitions from JSON and creates dynamic state schemas
2. **Definition Loader** (`src/definition-loader.ts`) - Loads and validates JSON game definitions from `definition.json`
3. **Schema Builder** (`src/schema-builder.ts`) - Dynamically creates Colyseus Schema classes from JSON definitions
4. **XState Interpreter** (`src/xstate-interpreter.ts`) - Processes state machine logic using XState v5
5. **Runtime Actions** (`src/runtime-actions.ts`) - Whitelisted generic actions available to all games

### Data-Driven Design

- **No hardcoded game logic** - Everything is driven by JSON configurations
- **Dynamic schema generation** - Colyseus schemas are built at runtime from JSON definitions
- **Generic actions only** - The `standardActions` object contains safe, reusable operations
- **XState-powered state machines** - All game flow is defined in JSON and interpreted by XState

### Key Files Structure

- `src/index.ts` - Entry point using `@colyseus/tools`
- `src/app.config.ts` - Colyseus server configuration
- `src/schemas/` - Base schema classes (BaseState, BasePlayer, etc.)
- `definition.json` - Game definition loaded at runtime (not in src/)

## Development Notes

- Room type is registered as `"project"` in app.config.ts
- Server runs on port 2567 by default
- Playground available at `/` (dev only)
- Monitor available at `/monitor`
- Health check at `/hello_world`

## Game Definition Format

Games are defined in JSON with:
- `schema`: Defines state structure and classes
- `machine`: XState v5 compatible state machine
- `actions`: Whitelisted action names
- `data`: Static game data (questions, etc.)

## Testing

- Uses Vitest for testing
- Test files in `src/__tests__/`
- 10 second timeout configured for async operations
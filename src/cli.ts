#!/usr/bin/env node

/**
 * CLI entry point for @ludiz/colyseus-server
 *
 * This CLI allows game templates to run the Colyseus server as a dev dependency
 * while pointing to production servers in production environments.
 */

import { listen } from "@colyseus/tools";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import app from "./app.config.js";

interface CliOptions {
  dslDir?: string;
  port?: number;
  env?: string;
  help?: boolean;
}

function showHelp() {
  console.log(`
@ludiz/colyseus-server CLI

Usage: ludiz-colyseus [options]

Options:
  --dsl-dir <path>    Path to DSL directory containing game definitions (default: ./dsl)
  --port <number>     Port to run server on (default: 2567 or PORT env var)
  --env <file>        Path to environment file (default: .env)
  --help              Show this help message

Examples:
  ludiz-colyseus --dsl-dir ./game-config --port 3000
  ludiz-colyseus --dsl-dir ./dsl --env .env.local
  npx @ludiz/colyseus-server --dsl-dir ./dsl
`);
}

function validateDslDirectory(dslDir: string): void {
  if (!existsSync(dslDir)) {
    console.error(`❌ DSL directory not found: ${dslDir}`);
    console.error(
      "Please ensure the DSL directory exists and contains your game definitions."
    );
    process.exit(1);
  }

  console.log(`✅ Using DSL directory: ${dslDir}`);
}

async function main() {
  try {
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        "dsl-dir": { type: "string" },
        port: { type: "string" },
        env: { type: "string" },
        help: { type: "boolean" },
      },
      allowPositionals: false,
    });

    const options: CliOptions = {
      dslDir: values["dsl-dir"],
      port: values.port ? parseInt(values.port, 10) : undefined,
      env: values.env,
      help: values.help,
    };

    if (options.help) {
      showHelp();
      return;
    }

    // Set default DSL directory
    const dslDir = resolve(process.cwd(), options.dslDir || "./dsl");
    validateDslDirectory(dslDir);

    // Set DSL directory in environment for the server to pick up
    process.env.LUDIZ_DSL_DIR = dslDir;

    // Set port if provided
    if (options.port) {
      process.env.PORT = options.port.toString();
    }

    // Load environment file if specified
    if (options.env) {
      const envPath = resolve(process.cwd(), options.env);
      if (existsSync(envPath)) {
        console.log(`📄 Loading environment from: ${envPath}`);
        // Note: You might want to use dotenv here if needed
        // import('dotenv').then(dotenv => dotenv.config({ path: envPath }));
      } else {
        console.warn(`⚠️  Environment file not found: ${envPath}`);
      }
    }

    console.log(`🚀 Starting Ludiz Colyseus Server...`);
    console.log(`📁 DSL Directory: ${dslDir}`);
    console.log(`🌐 Port: ${process.env.PORT || "2567"}`);

    // Start the Colyseus server
    await listen(app);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Run the CLI
main().catch(console.error);

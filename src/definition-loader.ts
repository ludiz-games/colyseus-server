import { readFileSync } from "fs";
import { join } from "path";

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  schema: {
    root: string;
    classes: Record<string, any>;
    defaults?: Record<string, any>;
  };
  machine: {
    id: string;
    initial: string;
    context?: Record<string, any>;
    states: Record<string, any>;
  };
  actions: string[]; // Whitelisted action names
  data: Record<string, any>; // Static game data
}

/**
 * Load a game definition from DSL directory (dev mode) or provided config
 */
export async function loadDefinition(options: {
  definitionId: string;
  config?: GameDefinition;
}): Promise<GameDefinition> {
  const { definitionId, config } = options;

  // If config is provided directly, use it
  if (config) {
    console.log(`[Definition] Using provided config for ${definitionId}`);
    return config;
  }

  // Load from DSL directory (dev mode)
  const dslDir = process.env.LUDIZ_DSL_DIR;
  if (dslDir) {
    return loadFromDslDirectory(dslDir, definitionId);
  }

  // Fallback: load from server folder (legacy POC)
  try {
    const definitionPath = join(process.cwd(), "definition.json");
    const definitionData = readFileSync(definitionPath, "utf8");
    const definition = JSON.parse(definitionData) as GameDefinition;

    console.log(
      `[Definition] Loaded ${definition.name} v${definition.version} from server folder`
    );
    return definition;
  } catch (error) {
    throw new Error(`Failed to load definition '${definitionId}': ${error}`);
  }
}

/**
 * Load definition from DSL directory structure
 */
function loadFromDslDirectory(
  dslDir: string,
  definitionId: string
): GameDefinition {
  try {
    // Load manifest
    const manifestPath = join(dslDir, "manifest.json");
    const manifestData = readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestData);

    // Validate that this is the right definition
    if (manifest.slug !== definitionId) {
      throw new Error(
        `Definition slug mismatch: expected '${definitionId}', got '${manifest.slug}'`
      );
    }

    // Load schema
    const schemaPath = join(dslDir, "schema.json");
    const schemaData = readFileSync(schemaPath, "utf8");
    const schema = JSON.parse(schemaData);

    // Load machine
    const machinePath = join(dslDir, "machine.json");
    const machineData = readFileSync(machinePath, "utf8");
    const machine = JSON.parse(machineData);

    // Load data
    const dataPath = join(dslDir, "data.json");
    const dataData = readFileSync(dataPath, "utf8");
    const data = JSON.parse(dataData);

    // Construct full definition
    const definition: GameDefinition = {
      id: manifest.slug,
      name: manifest.name,
      description: manifest.description || "",
      version: manifest.version || "1.0.0",
      schema,
      machine,
      actions: manifest.actions || [],
      data,
    };

    console.log(
      `[Definition] ✅ Loaded ${definition.name} v${definition.version} from DSL directory: ${dslDir}`
    );

    return definition;
  } catch (error) {
    throw new Error(
      `Failed to load definition from DSL directory '${dslDir}': ${error}`
    );
  }
}

/**
 * Validate that a game definition is valid
 */
export function validateDefinition(definition: GameDefinition): void {
  if (!definition.id || !definition.schema || !definition.machine) {
    throw new Error("Definition must have id, schema, and machine properties");
  }

  if (!definition.schema.root || !definition.schema.classes) {
    throw new Error("Definition schema must have root and classes properties");
  }

  if (!definition.machine.initial || !definition.machine.states) {
    throw new Error(
      "Definition machine must have initial and states properties"
    );
  }

  // Validate that root class exists
  if (!definition.schema.classes[definition.schema.root]) {
    throw new Error(
      `Definition schema root class '${definition.schema.root}' not found in classes`
    );
  }
}

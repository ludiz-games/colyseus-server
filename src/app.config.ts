import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import config from "@colyseus/tools";

/**
 * Import your Room files
 */
import { GenericRoom } from "./rooms/GenericRoom.js";

export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    // Generic dynamic room host; loads per-project blueprint bundles at runtime.
    // Join with: client.joinOrCreate("project", { projectId, blueprintId, version })
    gameServer.define("project", GenericRoom);
  },

  initializeExpress: (app) => {
    /**
     * Configure CORS for E2B sandbox environments and local development
     */
    app.use((req, res, next) => {
      const origin = req.headers.origin;

      // Allow requests from E2B sandbox domains and localhost
      if (origin) {
        if (
          origin.includes(".e2b.app") ||
          origin.includes("localhost") ||
          origin.includes("127.0.0.1")
        ) {
          res.header("Access-Control-Allow-Origin", origin);
        }
      }

      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      res.header("Access-Control-Allow-Credentials", "true");

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("Ludiz-Vibe Colyseus Server is running!");
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground());
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});

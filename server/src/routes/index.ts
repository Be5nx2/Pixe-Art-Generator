import type { FastifyInstance } from "fastify";
import { health } from "./health.js";
import { validate } from "./validateRoute.js";

/**
 * Register API routes.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/health", health);
  app.post("/api/validate", validate);
}

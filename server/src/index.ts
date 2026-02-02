import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes/index.js";

const app = Fastify({
  logger: false
});
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

await app.register(cors, {
  origin: true
});

await registerRoutes(app);

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Pixe Art server running on http://localhost:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

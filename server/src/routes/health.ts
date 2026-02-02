import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * GET /api/health
 * Returns server readiness.
 */
export async function health(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ ok: true, status: "ready" });
}

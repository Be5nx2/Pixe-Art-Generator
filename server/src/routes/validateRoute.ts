import type { FastifyReply, FastifyRequest } from "fastify";
import { validateGridAndPalette } from "../validation/validateGridAndPalette.js";

export interface ValidateBody {
  gridText?: string;
  palette?: string;
}

/**
 * POST /api/validate
 * Body: { gridText: string, palette?: string }
 */
export async function validate(
  request: FastifyRequest<{ Body: ValidateBody }>,
  reply: FastifyReply
) {
  try {
    const { gridText, palette } = request.body ?? {};
    const result = validateGridAndPalette({ gridRawInput: gridText ?? '', paletteRawInput: palette });
    return reply.send(result);
  } catch (error) {
    console.error("Validation error:", error);
    return reply.send({
      ok: false,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
      width: 0,
      height: 0,
      uniqueChars: [],
      paletteChars: [],
      lines: [],
    });
  }

}

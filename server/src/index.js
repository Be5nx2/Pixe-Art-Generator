import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({
  logger: false
});
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

await app.register(cors, {
  origin: true
});

const MIN_SIZE = 8;
const MAX_SIZE = 64;

function normalizeLines(text) {
  const normalized = text.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");

  // Trim only leading/trailing empty lines (common with copy/paste)
  while (lines.length && lines[0] === "") lines.shift();
  while (lines.length && lines[lines.length - 1] === "") lines.pop();

  return lines;
}

function parsePalette(input) {
  if (!input) return { chars: [], errors: [] };

  const raw = Array.isArray(input)
    ? input.join("")
    : String(input);

  const cleaned = raw
    .split("")
    .filter((char) => char !== "," && char !== " " && char !== "\n" && char !== "\t");

  const seen = new Set();
  const duplicates = new Set();
  for (const char of cleaned) {
    if (seen.has(char)) duplicates.add(char);
    seen.add(char);
  }

  const errors = [];
  if (duplicates.size > 0) {
    errors.push(`Palette contient des doublons: ${[...duplicates].join(" ")}.`);
  }

  return { chars: cleaned, errors };
}

function validateGrid({ gridText, palette }) {
  const errors = [];
  const warnings = [];

  if (!gridText || typeof gridText !== "string") {
    return { ok: false, errors: ["Aucun tableau fourni."], warnings: [] };
  }

  const lines = normalizeLines(gridText);

  if (lines.length === 0) {
    return { ok: false, errors: ["Le tableau est vide."], warnings: [] };
  }

  if (lines.length < MIN_SIZE || lines.length > MAX_SIZE) {
    errors.push(`Le tableau doit avoir entre ${MIN_SIZE} et ${MAX_SIZE} lignes.`);
  }

  const width = lines[0].length;

  if (width < MIN_SIZE || width > MAX_SIZE) {
    errors.push(`Chaque ligne doit avoir entre ${MIN_SIZE} et ${MAX_SIZE} caractères.`);
  }

  const inconsistent = lines.findIndex((line) => line.length !== width);
  if (inconsistent !== -1) {
    errors.push(`Toutes les lignes doivent avoir la même longueur (erreur ligne ${inconsistent + 1}).`);
  }

  if (lines.some((line) => line.length === 0)) {
    errors.push("Les lignes vides ne sont pas autorisées.");
  }

  const uniqueChars = new Set();
  for (const line of lines) {
    for (const char of line) {
      uniqueChars.add(char);
    }
  }

  const paletteResult = parsePalette(palette);
  errors.push(...paletteResult.errors);

  let paletteChars = paletteResult.chars;
  if (paletteChars.length > 0) {
    const missing = [...uniqueChars].filter((char) => !paletteChars.includes(char));
    if (missing.length > 0) {
      errors.push(`Le tableau contient des caractères absents de la palette: ${missing.join(" ")}.`);
    }

    if (uniqueChars.size !== paletteChars.length) {
      errors.push(
        `La palette doit contenir exactement ${uniqueChars.size} caractères (actuellement ${paletteChars.length}).`
      );
    }
  } else {
    paletteChars = [...uniqueChars];
    warnings.push("Aucune palette fournie : palette déduite automatiquement.");
  }

  const ok = errors.length === 0;

  return {
    ok,
    errors,
    warnings,
    width,
    height: lines.length,
    uniqueChars: [...uniqueChars],
    paletteChars,
    lines
  };
}

app.get("/api/health", async () => ({ ok: true, status: "ready" }));

app.post("/api/validate", async (request) => {
  const { gridText, palette } = request.body ?? {};
  const result = validateGrid({ gridText, palette });
  return result;
});

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Pixe Art server running on http://localhost:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

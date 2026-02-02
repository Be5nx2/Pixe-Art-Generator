import { GridValidator, normalizeLines } from "../domain/grid.js";
import { computePaletteCharsFromGridLines, normalizePalette, PaletteValidator } from "../domain/palette.js";
import { MIN_SIZE, MAX_SIZE } from "./constants.js";

export interface ValidateGridInput {
  gridRawInput: string;
  paletteRawInput?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  width: number;
  height: number;
  uniqueChars: string[];
  paletteChars: string[];
  lines: string[];
}

/**
 * Validate grid text and optional palette.
 */
export function validateGridAndPalette(input: ValidateGridInput): ValidationResult {
  const { gridRawInput, paletteRawInput } = input;

  const gridLines = normalizeLines(gridRawInput);
  let paletteChars: string[] = [];
  let errors: Set<string> = new Set();
  let warnings: Set<string> = new Set();

  // if paletteRawInput is not empty, normalize it and parse it into a palette
  if (paletteRawInput) {
    paletteChars = normalizePalette(paletteRawInput);
  }else{ // compute the palette chars from the grid lines
    warnings.add("No palette provided, computing palette from grid lines.");
    const computedPaletteChars = computePaletteCharsFromGridLines(gridLines);
    paletteChars = normalizePalette(computedPaletteChars.join(''));
  }


  const paletteValidator = new PaletteValidator(paletteChars);
  const paletteResult = paletteValidator.validate();
  paletteChars = paletteResult.chars;
  paletteResult.errors.forEach(error => errors.add(error));
  console.log(`Chars : ${paletteChars.join(', ')}`);

  const gridValidator = new GridValidator(gridLines, paletteChars);
  const gridResult = gridValidator.validate();
  gridResult.errors.forEach(error => errors.add(error));


  return {
    ok: true,
    errors: Array.from(errors),
    warnings: Array.from(warnings),
    width: gridResult.width,
    height: gridResult.height,
    uniqueChars: paletteChars,
    paletteChars: paletteChars,
    lines: errors.size === 0 ? gridResult.lines : []  };
}

import { MAX_SIZE, MIN_SIZE } from "../validation/constants.js";

/**
 * Normalize raw text into grid lines (split on newlines, trim empty edges).
 */
export function normalizeLines(text: string): string[] {
  const normalized = text.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  while (lines.length && lines[0] === "") lines.shift();
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export interface ValidateGridResult {
  lines: string[];
  errors: Set<string>;
  width: number;
  height: number;
}

export class GridValidator{
  private lines: string[] = [];
  private errors: Set<string> = new Set();
  private paletteChars: string[] = [];

  constructor(lines: string[], paletteChars: string[]) {
    this.lines = lines;
    this.paletteChars = paletteChars;
  }

  validate(): ValidateGridResult {
    this.checkIsEmpty();
    this.checkIsBoundariesValid();
    this.checkAllLinesHaveTheSameLength();
    this.checkAllLinesHaveValidCharacters();
    return {
      lines: this.lines,
      errors: new Set(this.errors),
      width: this.lines[0]?.length ?? 0,
      height: this.lines.length
    };
  }

  private checkIsEmpty(): void {
    if(this.lines.length === 0) {
      this.errors.add("Grid is required.");
    }
  }

  private checkIsBoundariesValid(): void {
    if(this.lines.length < MIN_SIZE || this.lines.length > MAX_SIZE) {
      this.errors.add("Grid must be between 8 and 64 lines.");
    }
    for (let index = 0; index < this.lines.length; index++) {
      const line = this.lines[index];
      if(line.length < MIN_SIZE || line.length > MAX_SIZE) {
        this.errors.add(`Line ${index + 1} must be between 8 and 64 characters.`);
      }
    }
  }

  private checkAllLinesHaveTheSameLength(): void {
    if(this.lines.length === 0) {
      return;
    }
    const firstLineLength = this.lines[0].length;
    for (let index = 0; index < this.lines.length; index++) {
      const line = this.lines[index];
      if(line.length !== firstLineLength) {
        this.errors.add(`Line ${index + 1} must have the same length as the first line.`);
      }
    }
  }

  private checkAllLinesHaveValidCharacters(): void {
    const isValidChar = (char: string) => this.paletteChars.includes(char);
    for (let index = 0; index < this.lines.length; index++) {
      const line = this.lines[index];
      line.split('').forEach((char, charIndex) => {
        if(!isValidChar(char)) {
          this.errors.add(`Line ${index + 1} has invalid character: "${char}"`);
        }
      });
    }
  }
}
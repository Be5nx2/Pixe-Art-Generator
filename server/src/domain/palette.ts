
export interface ParsePaletteResult {
  chars: string[];
  errors: Set<string>;
}

const ALLOWED_CHARS = /[a-zA-Z0-9@#=!*%$&\-_.+|]/i;

export class PaletteValidator{
  private chars: string[] = [];
  private errors: Set<string> = new Set();
  private warnings: string[] = [];

  constructor(input: string[]) {
    this.chars = input;
  }

  validate(): ParsePaletteResult {
    this.checkForDuplicates();
    this.checkForInvalidCharacters();
    return {
      chars: this.chars,
      errors: new Set(this.errors),
    };
  }

  private checkForDuplicates(): void {
    const uniqueChars = new Set(this.chars);
    if (uniqueChars.size !== this.chars.length) {
      this.errors.add("Duplicate characters found in palette. Only unique characters are allowed.");
    }
    this.chars = Array.from(uniqueChars);
  }

  private checkForInvalidCharacters(): void {
    const invalidChars = this.chars.filter(char => !ALLOWED_CHARS.test(char));
    if (invalidChars.length > 0) {
      this.errors.add(`Invalid characters found in palette: ${invalidChars.join(", ")}. Only characters allowed are: a-zA-Z0-9@#=!*%$&-_.+|`);
    }
    this.chars = this.chars.filter(char => ALLOWED_CHARS.test(char));
  }

}


export function normalizePalette(input: string): string[] {
// Remove commas or spaces from the input before splitting into chars and filter out invalid characters
const normalizedInput = input.replace(/[, ]/g, '');
const chars = normalizedInput.split("").filter(char => ALLOWED_CHARS.test(char)); 
return chars;
}

export function computePaletteCharsFromGridLines(lines: string[]): string[] {
  const chars = new Set<string>();
  for (const line of lines) {
    for (const char of line) {
      chars.add(char);
    }
  }
  return Array.from(chars);
}
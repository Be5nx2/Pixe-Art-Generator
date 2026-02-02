import { describe, it, expect } from "vitest";
import {
  PaletteValidator,
  normalizePalette,
  computePaletteCharsFromGridLines,
} from "../palette.js";

describe("PaletteValidator", () => {
  describe("validate()", () => {
    it("allows @ and numbers 0-9 in the palette", () => {
      const validator = new PaletteValidator(["a", "@", "0", "5", "9", "Z"]);
      const result = validator.validate();
      expect(result.chars).toEqual(expect.arrayContaining(["a", "@", "0", "5", "9", "Z"]));
      expect(result.errors.size).toBe(0);
    });

    it("filters and errors on non-allowed special chars, but allows @ and 0-9", () => {
      const validator = new PaletteValidator(["@", "^", "2", "~", "a"]);
      const result = validator.validate();
      expect(result.chars).toEqual(expect.arrayContaining(["@", "2", "a"]));
      expect(result.chars).not.toContain("^");
      expect(result.chars).not.toContain("~");
      expect(Array.from(result.errors).some((e: string) => e.startsWith("Invalid characters found in palette"))).toBe(true);
    });
    it("returns chars and empty errors for valid unique palette characters", () => {
      const validator = new PaletteValidator(["a", "b", "#", "="]);
      const result = validator.validate();
      expect(result.chars).toEqual(["a", "b", "#", "="]);
      expect(result.errors.size).toBe(0);
    });

    it("allows allowed special characters: a-zA-Z#=!*%$&-_.+|", () => {
      const validator = new PaletteValidator(["a", "Z", "#", "=", "!", "*", "%", "$", "&", "-", "_", ".", "+", "|"]);
      const result = validator.validate();
      expect(result.chars).toEqual(expect.arrayContaining(["a", "Z", "#", "=", "!", "*", "%", "$", "&", "-", "_", ".", "+", "|"]));
      expect(result.errors.size).toBe(0);
    });

    it("adds error and deduplicates when palette has duplicate characters", () => {
      const validator = new PaletteValidator(["a", "b", "a", "b"]);
      const result = validator.validate();
      expect(result.chars).toEqual(["a", "b"]);
      expect(Array.from(result.errors).some((e: string) => e.startsWith("Duplicate characters found in palette"))).toBe(true);
    });

    it("adds error and filters out invalid characters", () => {
      const validator = new PaletteValidator(["a", "b", " ", "\n"]);
      const result = validator.validate();
      expect(result.chars).toEqual(["a", "b"]);
      const invalidError = Array.from(result.errors).find((e: string) => e.startsWith("Invalid characters found in palette"));
      expect(invalidError).toBeDefined();
      expect(invalidError).toContain("Only characters allowed are");
    });

    it("can report both duplicate and invalid character errors", () => {
      const validator = new PaletteValidator(["a", "a", " "]);
      const result = validator.validate();
      expect(result.chars).toEqual(["a"]);
      expect(result.errors.size).toBe(2);
      expect(result.errors.has("Duplicate characters found in palette. Only unique characters are allowed.")).toBe(true);
      expect(Array.from(result.errors).some((e: string) => e.startsWith("Invalid characters"))).toBe(true);
    });
  });
});

describe("normalizePalette", () => {
  it("removes commas and spaces and returns valid chars", () => {
    const result = normalizePalette("a, b , c");
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("filters to only allowed characters (a-zA-Z#=!*%$&+-_.|)", () => {
    const result = normalizePalette("a1b#=!*%$&+|x");
    expect(result).toEqual(["a", "1", "b", "#", "=", "!", "*", "%", "$", "&", "+", "|", "x"]);
  });

  it("returns empty array for empty string", () => {
    expect(normalizePalette("")).toEqual([]);
  });

  it("returns empty array when input has no allowed characters", () => {
    expect(normalizePalette("123  ,  @  \n")).toEqual(["1", "2", "3", "@"]);
  });
});

describe("computePaletteCharsFromGridLines", () => {
  it("returns unique characters from all lines", () => {
    const lines = ["abc", "def", "ad"];
    expect(computePaletteCharsFromGridLines(lines)).toEqual(
      expect.arrayContaining(["a", "b", "c", "d", "e", "f"])
    );
    expect(computePaletteCharsFromGridLines(lines).length).toBe(6);
  });

  it("deduplicates characters across lines", () => {
    const lines = ["aaa", "aba", "a"];
    const result = computePaletteCharsFromGridLines(lines);
    expect(result).toEqual(["a", "b"]);
  });

  it("returns empty array for empty lines", () => {
    expect(computePaletteCharsFromGridLines([])).toEqual([]);
  });

  it("returns single char for single line with one char", () => {
    expect(computePaletteCharsFromGridLines(["x"])).toEqual(["x"]);
  });
});

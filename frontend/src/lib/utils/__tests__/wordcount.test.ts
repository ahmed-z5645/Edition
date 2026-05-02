import { describe, it, expect } from "vitest";
import { countWords } from "@/lib/utils/wordcount";

describe("countWords", () => {
  it("counts plain text words", () => {
    expect(countWords("hello world foo")).toBe(3);
  });

  it("strips markdown headings", () => {
    expect(countWords("# Hello World")).toBe(2);
  });

  it("strips bold and italic markers", () => {
    expect(countWords("**bold** and _italic_ text")).toBe(4);
  });

  it("strips backtick code markers", () => {
    expect(countWords("`code` is here")).toBe(3);
  });

  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(countWords("   \n\t  ")).toBe(0);
  });

  it("counts a single word", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("strips blockquote markers", () => {
    expect(countWords("> a quote here")).toBe(3);
  });
});

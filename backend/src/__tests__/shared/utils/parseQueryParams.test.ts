// Tests for query parameter parsing utilities

import { parseQueryInt } from "../../../shared/utils/parseQueryParams";

describe("parseQueryInt", () => {
  test("parses a valid numeric string", () => {
    expect(parseQueryInt("42", 1)).toBe(42);
  });

  test("parses zero correctly rather than returning the default", () => {
    expect(parseQueryInt("0", 5)).toBe(0);
  });

  test("parses negative numbers", () => {
    expect(parseQueryInt("-7", 1)).toBe(-7);
  });

  test("parses leading integer portion of mixed strings", () => {
    // parseInt semantics: stops at first non-numeric character
    expect(parseQueryInt("10abc", 1)).toBe(10);
  });

  test("returns default for non-numeric strings", () => {
    expect(parseQueryInt("abc", 99)).toBe(99);
  });

  test("returns default for undefined", () => {
    expect(parseQueryInt(undefined, 100)).toBe(100);
  });

  test("returns default for arrays (non-string input)", () => {
    expect(parseQueryInt(["1", "2"], 3)).toBe(3);
  });

  test("returns default for numeric (non-string) input", () => {
    expect(parseQueryInt(50, 3)).toBe(3);
  });

  test("returns default for objects", () => {
    expect(parseQueryInt({ page: 2 }, 1)).toBe(1);
  });
});

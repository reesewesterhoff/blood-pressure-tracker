// Tests for string manipulation utilities

import { decodeHtmlEntities } from "../../../shared/utils/stringUtils";

describe("decodeHtmlEntities", () => {
  test("decodes forward slash entity", () => {
    expect(decodeHtmlEntities("4&#x2F;0ATX")).toBe("4/0ATX");
  });

  test("decodes equals sign entity", () => {
    expect(decodeHtmlEntities("a&#x3D;b")).toBe("a=b");
  });

  test("decodes ampersand entity", () => {
    expect(decodeHtmlEntities("Tom&amp;Jerry")).toBe("Tom&Jerry");
  });

  test("decodes angle bracket entities", () => {
    expect(decodeHtmlEntities("&lt;div&gt;")).toBe("<div>");
  });

  test("decodes quote entities", () => {
    expect(decodeHtmlEntities("&quot;hi&quot; it&#39;s")).toBe("\"hi\" it's");
  });

  test("decodes multiple different entities in one string", () => {
    expect(decodeHtmlEntities("&lt;a href&#x3D;&quot;x&#x2F;y&quot;&gt;")).toBe(
      '<a href="x/y">'
    );
  });

  test("leaves strings without entities unchanged", () => {
    expect(decodeHtmlEntities("plain text 123")).toBe("plain text 123");
  });

  test("returns empty string unchanged", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });

  test("decodes repeated occurrences of the same entity", () => {
    expect(decodeHtmlEntities("a&amp;b&amp;c")).toBe("a&b&c");
  });
});

// Tests for input sanitization middleware

import { Request, Response, NextFunction } from "express";
import {
  createInputSanitizer,
  sanitizeUserInput,
} from "../../../shared/middleware/inputSanitizer";

describe("createInputSanitizer", () => {
  test("trims whitespace from string values", () => {
    const req = { body: { name: "  Alice  " } } as unknown as Request;
    const next = jest.fn() as NextFunction;

    sanitizeUserInput(req, {} as Response, next);

    expect(req.body.name).toBe("Alice");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("strips HTML tags from string values", () => {
    const req = { body: { bio: "<b>hello</b>" } } as unknown as Request;
    const next = jest.fn() as NextFunction;

    sanitizeUserInput(req, {} as Response, next);

    expect(req.body.bio).toBe("hello");
  });

  test("removes script tags to mitigate XSS", () => {
    const req = {
      body: { comment: "<script>alert('x')</script>" },
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    sanitizeUserInput(req, {} as Response, next);

    expect(req.body.comment).not.toContain("<");
    expect(req.body.comment).not.toContain("script>");
  });

  test("normalizes email addresses when enabled", () => {
    const req = { body: { email: "User@Example.com" } } as unknown as Request;
    const next = jest.fn() as NextFunction;

    sanitizeUserInput(req, {} as Response, next);

    expect(req.body.email).toBe("user@example.com");
  });

  test("recursively sanitizes nested objects and arrays", () => {
    const req = {
      body: {
        profile: { name: "  Bob  " },
        tags: ["<i>one</i>", "  two  "],
      },
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    sanitizeUserInput(req, {} as Response, next);

    expect(req.body.profile.name).toBe("Bob");
    expect(req.body.tags).toEqual(["one", "two"]);
  });

  test("leaves non-string primitives untouched", () => {
    const req = {
      body: { age: 42, active: true, missing: null },
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    sanitizeUserInput(req, {} as Response, next);

    expect(req.body.age).toBe(42);
    expect(req.body.active).toBe(true);
    expect(req.body.missing).toBeNull();
  });

  test("sanitizes body, query, and params", () => {
    const req = {
      body: { a: "  a  " },
      query: { b: "  b  " },
      params: { c: "  c  " },
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    createInputSanitizer()(req, {} as Response, next);

    expect(req.body.a).toBe("a");
    expect(req.query.b).toBe("b");
    expect(req.params.c).toBe("c");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("calls next even when there is nothing to sanitize", () => {
    const req = {} as unknown as Request;
    const next = jest.fn() as NextFunction;

    createInputSanitizer()(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

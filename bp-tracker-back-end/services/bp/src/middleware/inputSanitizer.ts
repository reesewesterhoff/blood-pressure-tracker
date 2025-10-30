// Description: Input sanitization middleware to prevent injection attacks

import { Request, Response, NextFunction } from "express";
import validator from "validator";

interface SanitizeOptions {
  allowedTags?: string[];
  stripHtml?: boolean;
  normalizeEmail?: boolean;
  trimWhitespace?: boolean;
}

function sanitizeInput(input: any, options: SanitizeOptions = {}): any {
  const {
    allowedTags = [],
    stripHtml = true,
    normalizeEmail = true,
    trimWhitespace = true,
  } = options;

  if (typeof input === "string") {
    let sanitized = input;

    // Trim whitespace
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Strip HTML tags
    if (stripHtml) {
      sanitized = validator.stripLow(sanitized);
      // Remove any remaining HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, "");
    }

    // Normalize email
    if (normalizeEmail && validator.isEmail(sanitized)) {
      sanitized = validator.normalizeEmail(sanitized) || sanitized;
    }

    // Escape special characters for XSS prevention
    sanitized = validator.escape(sanitized);

    return sanitized;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item, options));
  }

  if (input && typeof input === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value, options);
    }
    return sanitized;
  }

  return input;
}

export function createInputSanitizer(options: SanitizeOptions = {}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeInput(req.body, options);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeInput(req.query, options);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeInput(req.params, options);
    }

    next();
  };
}

// Pre-configured sanitizers
export const sanitizeUserInput = createInputSanitizer({
  stripHtml: true,
  normalizeEmail: true,
  trimWhitespace: true,
});

export const sanitizeApiInput = createInputSanitizer({
  stripHtml: true,
  trimWhitespace: true,
});

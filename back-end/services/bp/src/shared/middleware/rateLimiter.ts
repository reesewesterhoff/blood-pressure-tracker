// Description: Rate limiting middleware to prevent abuse

import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory rate limiter (for production, consider using Redis)
// Each rate limiter instance gets its own store to avoid interference
const stores: Map<string, RateLimitStore> = new Map();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyPrefix?: string; // Optional prefix to separate different rate limiters
}

export function createRateLimiter(options: RateLimitOptions) {
  console.log("rate limiter hit", options);
  const {
    windowMs,
    max,
    message = "Too many requests",
    skipSuccessfulRequests = false,
    keyPrefix = "default",
  } = options;

  // Get or create store for this rate limiter instance
  if (!stores.has(keyPrefix)) {
    stores.set(keyPrefix, {});
  }
  const store = stores.get(keyPrefix)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    // Clean up expired entries
    Object.keys(store).forEach((ip) => {
      if (store[ip].resetTime < now) {
        delete store[ip];
      }
    });

    // Get or create entry for this IP
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const entry = store[key];

    // Check if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // For skipSuccessfulRequests, check limit before proceeding (only count failures)
    // For normal rate limiting, increment and check immediately
    if (skipSuccessfulRequests) {
      // Check if we've already hit the limit from previous failures
      if (entry.count >= max) {
        return res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        });
      }

      // Track response status - only count failures
      res.on("finish", () => {
        // Only increment count for failed requests (4xx, 5xx)
        if (res.statusCode >= 400) {
          entry.count++;
        }
      });
    } else {
      // Normal rate limiting: increment immediately
      entry.count++;

      // Check if limit exceeded
      if (entry.count > max) {
        return res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        });
      }
    }

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": max.toString(),
      "X-RateLimit-Remaining": Math.max(0, max - entry.count).toString(),
      "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
    });

    next();
  };
}

// Pre-configured rate limiters
export const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per window
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true, // Only count failed login attempts
  keyPrefix: "login", // Separate store for login rate limiting
});

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window (~67/minute)
  message: "Too many requests, please try again later",
  keyPrefix: "general", // Separate store for general rate limiting
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute (for high-risk endpoints)
  message: "Rate limit exceeded, please slow down",
  keyPrefix: "strict", // Separate store for strict rate limiting
});

// Separate rate limiter for registration (more lenient than login)
export const registrationRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed attempts per window (more lenient than login)
  message: "Too many registration attempts, please try again later",
  skipSuccessfulRequests: true, // Only count failed registration attempts
  keyPrefix: "registration", // Separate store for registration rate limiting
});

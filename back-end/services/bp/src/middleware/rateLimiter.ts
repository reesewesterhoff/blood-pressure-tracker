// Description: Rate limiting middleware to prevent abuse

import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory rate limiter (for production, consider using Redis)
const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests",
    skipSuccessfulRequests = false,
  } = options;

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

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": max.toString(),
      "X-RateLimit-Remaining": Math.max(0, max - entry.count).toString(),
      "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
    });

    // Track response status if needed
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function (data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          entry.count = Math.max(0, entry.count - 1);
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
}

// Pre-configured rate limiters
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many authentication attempts, please try again later",
});

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later",
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Rate limit exceeded, please slow down",
});

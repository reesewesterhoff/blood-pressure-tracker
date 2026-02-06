// Description: Rate limiting middleware using Upstash Redis

import { Request, Response, NextFunction } from "express";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
// Environment variables are loaded via dotenv import in server.ts before this module loads
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Verify Redis connection on startup
async function verifyRedisConnection(): Promise<void> {
  try {
    await redis.ping();
    console.log("Upstash Redis connected");
  } catch (error) {
    console.error("Upstash Redis connection error:", error);
    // Don't exit - rate limiting will fail open and log errors per-request
  }
}

// Run verification (non-blocking)
verifyRedisConnection();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyPrefix?: string; // Optional prefix to separate different rate limiters
}

/**
 * Creates a rate limiter middleware using Upstash Redis
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests",
    skipSuccessfulRequests = false,
    keyPrefix = "default",
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const key = `ratelimit:${keyPrefix}:${ip}`;

    try {
      if (skipSuccessfulRequests) {
        // For skipSuccessfulRequests: check current count, only increment on failure
        const currentCount = (await redis.get<number>(key)) || 0;

        if (currentCount >= max) {
          const ttl = await redis.ttl(key);
          return res.status(429).json({
            success: false,
            message,
            retryAfter: ttl > 0 ? ttl : windowSeconds,
          });
        }

        // Set rate limit headers based on current count
        res.set({
          "X-RateLimit-Limit": max.toString(),
          "X-RateLimit-Remaining": Math.max(0, max - currentCount).toString(),
          "X-RateLimit-Reset": new Date(
            Date.now() + windowSeconds * 1000
          ).toISOString(),
        });

        // Track response status - only count failures
        res.on("finish", async () => {
          if (res.statusCode >= 400) {
            try {
              const newCount = await redis.incr(key);
              // Set expiry only on first increment
              if (newCount === 1) {
                await redis.expire(key, windowSeconds);
              }
            } catch (error) {
              console.error("Failed to increment rate limit counter:", error);
            }
          }
        });
      } else {
        // Normal rate limiting: increment immediately using atomic INCR
        const currentCount = await redis.incr(key);

        // Set expiry on first request in window
        if (currentCount === 1) {
          await redis.expire(key, windowSeconds);
        }

        // Get TTL for headers
        const ttl = await redis.ttl(key);

        // Set rate limit headers
        res.set({
          "X-RateLimit-Limit": max.toString(),
          "X-RateLimit-Remaining": Math.max(0, max - currentCount).toString(),
          "X-RateLimit-Reset": new Date(
            Date.now() + (ttl > 0 ? ttl : windowSeconds) * 1000
          ).toISOString(),
        });

        // Check if limit exceeded
        if (currentCount > max) {
          return res.status(429).json({
            success: false,
            message,
            retryAfter: ttl > 0 ? ttl : windowSeconds,
          });
        }
      }

      next();
    } catch (error) {
      // On Redis error, log and allow the request (fail open)
      console.error("Rate limiter Redis error:", error);
      next();
    }
  };
}

// Pre-configured rate limiters
export const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per window
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true, // Only count failed login attempts
  keyPrefix: "login",
});

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window (~67/minute)
  message: "Too many requests, please try again later",
  keyPrefix: "general",
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute (for high-risk endpoints)
  message: "Rate limit exceeded, please slow down",
  keyPrefix: "strict",
});

// Separate rate limiter for registration (more lenient than login)
export const registrationRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed attempts per window (more lenient than login)
  message: "Too many registration attempts, please try again later",
  skipSuccessfulRequests: true, // Only count failed registration attempts
  keyPrefix: "registration",
});

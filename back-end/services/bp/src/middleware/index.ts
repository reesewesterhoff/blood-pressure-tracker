// Description: Centralized exports for all middleware functions

// Authentication middleware
export { ensureAuth } from "./authMiddleware";

// Error handling middleware
export { CustomError, errorHandler, notFoundHandler } from "./errorHandler";

// Input sanitization middleware
export {
  sanitizeUserInput,
  sanitizeApiInput,
  createInputSanitizer,
} from "./inputSanitizer";

// Rate limiting middleware
export {
  authRateLimit,
  generalRateLimit,
  strictRateLimit,
  createRateLimiter,
} from "./rateLimiter";

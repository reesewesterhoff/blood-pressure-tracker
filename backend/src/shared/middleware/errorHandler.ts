// Description: Centralized error handling middleware

import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../types/api";

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response<ApiResponse>
) {
  let error: AppError = err;

  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    const message = "Invalid ID format provided";
    error = new CustomError(message, 400);
  }

  // Mongoose duplicate key
  if (err instanceof mongoose.Error && "code" in err && err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new CustomError(message, 400);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new CustomError(message, 400);
  }

  // Passport authentication errors
  if (err.name === "AuthenticationError") {
    const message = "Authentication failed";
    error = new CustomError(message, 401);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new CustomError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new CustomError(message, 401);
  }

  // Rate limiting errors
  if (err.message.includes("Too many requests")) {
    error = new CustomError(err.message, 429);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// 404 handler
export function notFoundHandler(req: Request, res: Response<ApiResponse>) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
}

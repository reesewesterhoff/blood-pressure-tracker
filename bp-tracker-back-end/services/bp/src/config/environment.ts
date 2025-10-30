// Description: Environment configuration validation and management

import { EnvironmentConfig } from "../types";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  config?: EnvironmentConfig;
}

function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const requiredVars = [
    "MONGO_URI",
    "SESSION_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  // Check required environment variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate MONGO_URI format
  if (
    process.env.MONGO_URI &&
    !process.env.MONGO_URI.startsWith("mongodb://") &&
    !process.env.MONGO_URI.startsWith("mongodb+srv://")
  ) {
    errors.push("MONGO_URI must be a valid MongoDB connection string");
  }

  // Validate SESSION_SECRET strength
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    errors.push("SESSION_SECRET must be at least 32 characters long");
  }

  // Validate PORT
  const port = parseInt(process.env.PORT || "3000");
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid number between 1 and 65535");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const config: EnvironmentConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: port,
    MONGO_URI: process.env.MONGO_URI!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  };

  return { isValid: true, errors: [], config };
}

export function loadEnvironmentConfig(): EnvironmentConfig {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    console.error("Environment validation failed:");
    validation.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("Environment configuration validated successfully");
  return validation.config!;
}

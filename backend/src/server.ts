import expressApp from "express";
import dotenvConfig from "dotenv";
import corsMiddleware from "cors";
import expressSession from "express-session";
import connectMongoSession from "connect-mongo";
import passportMain from "passport";
import mongoose from "mongoose";

import {
  connectDB,
  configurePassport,
  loadEnvironmentConfig,
} from "./shared/config";
import {
  errorHandler,
  notFoundHandler,
  generalRateLimit,
  sanitizeApiInput,
} from "./shared/middleware";

import { authRoutes } from "./auth/routes";
import { bloodPressureRoutes } from "./readings/routes";

// Load environment variables
dotenvConfig.config();

// Validate environment configuration
const envConfig = loadEnvironmentConfig();
const isProduction = process.env.NODE_ENV === "production";

const startServer = async () => {
  // Initialize Express app
  const serverApp = expressApp();

  if (isProduction) {
    // Ensure secure cookies work behind a proxy (Nginx)
    serverApp.set("trust proxy", 1);
  }

  // Connect to MongoDB
  await connectDB();

  // Passport configuration
  configurePassport();

  // Security middleware
  serverApp.use(generalRateLimit);
  serverApp.use(sanitizeApiInput);

  // CORS middleware
  serverApp.use(
    corsMiddleware({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  // Body parsing middleware
  serverApp.use(expressApp.json({ limit: "10mb" }));
  serverApp.use(expressApp.urlencoded({ extended: false, limit: "10mb" }));

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not defined in .env file");
    process.exit(1);
  }

  serverApp.use(
    expressSession({
      secret: process.env.SESSION_SECRET || "supersecretkeyfortestingonly",
      resave: false,
      saveUninitialized: false,
      store: connectMongoSession.create({
        // Reuse the primary Mongoose connection pool for sessions.
        // @ts-expect-error connect-mongo's MongoClient type comes from a different
        // mongodb package instance than Mongoose's; runtime client is compatible.
        client: mongoose.connection.getClient(),
      }),
      cookie: {
        secure: isProduction, // required for SameSite=None
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      },
    }),
  );

  serverApp.use(passportMain.initialize());
  serverApp.use(passportMain.session());

  // Define Routes with rate limiting
  // Note: Rate limiters are applied per-route in authRoutes.ts
  serverApp.use("/auth", authRoutes);
  serverApp.use("/api/readings", bloodPressureRoutes);

  serverApp.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Blood Pressure Tracker API Running",
      version: "1.0.0",
      environment: envConfig.NODE_ENV,
    });
  });

  // 404 handler
  serverApp.use(notFoundHandler);

  // Error handling middleware (must be last)
  serverApp.use(errorHandler);

  serverApp.listen(envConfig.PORT, () =>
    console.log(
      `Server running in ${envConfig.NODE_ENV} mode on port ${envConfig.PORT}`,
    ),
  );
};

startServer().catch((err) => {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error("Unknown server startup error");
  }
  process.exit(1);
});

import expressApp from "express";
import dotenvConfig from "dotenv";
import corsMiddleware from "cors";
import expressSession from "express-session";
import connectMongoSession from "connect-mongo";
import passportMain from "passport";

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

// Initialize Express app
const serverApp = expressApp();

// Connect to MongoDB
connectDB();

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
  })
);

// Body parsing middleware
serverApp.use(expressApp.json({ limit: "10mb" }));
serverApp.use(expressApp.urlencoded({ extended: false, limit: "10mb" }));

const mongoSessionUri = process.env.MONGO_URI;
if (!mongoSessionUri) {
  console.error(
    "MONGO_URI not defined in .env file. Session storage will not work."
  );
  process.exit(1);
}

serverApp.use(
  expressSession({
    secret: process.env.SESSION_SECRET || "supersecretkeyfortestingonly",
    resave: false,
    saveUninitialized: false,
    store: connectMongoSession.create({ mongoUrl: mongoSessionUri }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
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
    `Server running in ${envConfig.NODE_ENV} mode on port ${envConfig.PORT}`
  )
);

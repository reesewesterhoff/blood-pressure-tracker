// Description: Main Express server setup.

import expressApp from "express";
import dotenvConfig from "dotenv";
import corsMiddleware from "cors";
import expressSession from "express-session";
import connectMongoSession from "connect-mongo";
import passportMain from "passport";

import connectDBInstance from "./config/db";
import { configurePassport as configurePassportInstance } from "./config/passport-setup";

import bloodPressureRoutesInstance from "./routes/bloodPressureRoutes";
import authRoutesInstance from "./routes/authRoutes";

// Load environment variables
dotenvConfig.config();

// Initialize Express app
const serverApp = expressApp();

// Connect to MongoDB
connectDBInstance();

// Passport configuration
configurePassportInstance();

// Middleware
serverApp.use(
  corsMiddleware({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);
serverApp.use(expressApp.json());
serverApp.use(expressApp.urlencoded({ extended: false }));

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
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

serverApp.use(passportMain.initialize());
serverApp.use(passportMain.session());

// Define Routes
serverApp.use("/api/readings", bloodPressureRoutesInstance);
serverApp.use("/auth", authRoutesInstance);

serverApp.get("/", (req, res) => {
  res.send("Blood Pressure Tracker API Running (with Local Auth)");
});

const SERVER_PORT = process.env.PORT || 5000;

serverApp.listen(SERVER_PORT, () =>
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${SERVER_PORT}`
  )
);

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session"; // For session management with Passport
import MongoStore from "connect-mongo"; // To store session in MongoDB
import passport from "passport"; // For authentication

import connectDB from "./config/db";
import { configurePassport } from "./config/passport-setup"; // Your Passport config

import bloodPressureRoutes from "./routes/bloodPressureRoutes";
import authRoutes from "./routes/authRoutes";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Passport configuration
configurePassport(); // Call the function to set up Passport strategies

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080", // Allow frontend to connect
    credentials: true, // Important for cookies/sessions
  })
);
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data

// Express session middleware
// Make sure MONGO_URI is defined in your .env file
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error(
    "MONGO_URI not defined in .env file. Session storage will not work."
  );
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey", // Change this to a strong secret
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      // httpOnly: true, // Prevent client-side JS from accessing the cookie
      // maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
  })
);

// Passport middleware (Initialize Passport and restore authentication state, if any, from the session)
app.use(passport.initialize());
app.use(passport.session());

// Define Routes
app.use("/api/readings", bloodPressureRoutes);
app.use("/auth", authRoutes); // Authentication routes

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Blood Pressure Tracker API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  )
);

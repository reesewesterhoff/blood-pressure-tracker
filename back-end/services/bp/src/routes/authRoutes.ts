// Description: Authentication routes for Google OAuth and Local (email/password).

import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import User from "../models/User";
import { ensureAuth } from "../middleware/authMiddleware";
import { validatePassword } from "../utils/validatePassword";
import { validateEmail } from "../utils/validateEmail";

const router = express.Router();

// --- Local Authentication Routes ---

// @desc    Register new user with email and password
// @route   POST /auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, displayName, firstName, lastName } = req.body;

    if (!email || !password || !displayName) {
      return res
        .status(400)
        .json({ message: "Please provide email, password, and display name." });
    }

    // validate email
    const { isValidEmail, message } = validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ message });
    }

    // validate password
    const { isValidPassword, errors } = validatePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Password validation failed.",
        errors,
      });
    }

    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists." });
      }

      const newUser = new User({
        email: email.toLowerCase(),
        password, // Password will be hashed by the pre-save hook in User model
        displayName,
        firstName,
        lastName,
      });

      await newUser.save();

      // Log in the user immediately after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error("Error logging in after registration:", err);
          return res.status(500).json({
            message:
              "Registration successful, but failed to log in automatically.",
          });
        }
        // Send back user object without password
        const userResponse = { ...newUser.toObject() };
        delete userResponse.password;
        return res.status(201).json({
          message: "User registered and logged in successfully",
          user: userResponse,
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Validation Error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration." });
    }
  }
);

// @desc    Login user with email and password
// @route   POST /auth/login
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (
      err: any,
      user: Express.User | false | null,
      info: { message: string } | undefined
    ) => {
      if (err) {
        console.error("Local login error:", err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: info?.message || "Login failed. Invalid credentials.",
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error during req.logIn:", err);
          return res.status(500).json({ message: "Error logging in." });
        }
        // Send back user object without password
        const userResponse = { ...(user as any).toObject() };
        delete userResponse.password;
        return res
          .status(200)
          .json({ message: "Logged in successfully", user: userResponse });
      });
    }
  )(req, res, next);
});

// --- Google OAuth Routes ---

// @desc    Auth with Google
// @route   GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // successRedirect: process.env.FRONTEND_URL || 'http://localhost:8080/dashboard', // We handle redirect manually
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:8080"
    }/login?error=google_auth_failed`, // Redirect to frontend login on failure
    failureMessage: true,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard.
    res.redirect(process.env.FRONTEND_URL || "http://localhost:8080/dashboard");
  }
);

// --- Common Auth Routes ---

// @desc    Logout user
// @route   GET /auth/logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error during logout." });
    }
    req.session.destroy((destroyErr) => {
      // Destroy session
      if (destroyErr) {
        console.error("Session destruction error:", destroyErr);
        return res
          .status(500)
          .json({ message: "Logged out, but session destruction failed." });
      }
      res.clearCookie("connect.sid"); // Clear session cookie (name might vary based on session config)
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

// @desc    Get current logged-in user
// @route   GET /auth/user
router.get("/user", ensureAuth, (req, res) => {
  // req.user is populated by Passport. Ensure password is not sent.
  if (req.user) {
    const userResponse = { ...(req.user as any).toObject() };
    delete userResponse.password; // Ensure password is not sent
    res.json(userResponse);
  } else {
    res.status(404).json({ message: "No user found in session." });
  }
});

export default router;

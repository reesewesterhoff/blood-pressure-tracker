// Description: Authentication routes for Google OAuth and Local (email/password).

import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { User } from "../models";
import { ensureAuth, CustomError } from "../../shared/middleware";
import { validatePassword, validateEmail } from "../../shared/utils";
import { ApiResponse } from "../../shared/types";

const authRoutes = express.Router();

// --- Local Authentication Routes ---

// @desc    Register new user with email and password
// @route   POST /auth/register
authRoutes.post(
  "/register",
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({
          success: false,
          message: "Please provide email, password, and first name.",
        });
      }

      // validate email
      const { isValidEmail, message } = validateEmail(email);
      if (!isValidEmail) {
        return res.status(400).json({ success: false, message });
      }

      // validate password
      const { isValidPassword, errors } = validatePassword(password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Password validation failed.",
          errors,
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists.",
        });
      }

      const newUser = new User({
        email: email.toLowerCase(),
        password, // Password will be hashed by the pre-save hook in User model
        firstName,
        lastName,
      });

      await newUser.save();

      // Log in the user immediately after registration
      req.login(newUser, (err) => {
        if (err) {
          return next(
            new CustomError(`Registration login failed: ${err.message}`)
          );
        }
        // Password is automatically excluded via schema toJSON transform
        return res.status(201).json({
          success: true,
          message: "User registered and logged in successfully",
          data: newUser,
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Login user with email and password
// @route   POST /auth/login
authRoutes.post(
  "/login",
  (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false | null,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(new CustomError(`Authentication failed: ${err.message}`));
        }
        if (!user) {
          return res.status(401).json({
            success: false,
            message: info?.message || "Login failed. Invalid credentials.",
          });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(
              new CustomError(`Login session creation failed: ${err.message}`)
            );
          }
          // Password is automatically excluded via schema toJSON transform
          return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: user,
          });
        });
      }
    )(req, res, next);
  }
);

// --- Google OAuth Routes ---

// @desc    Auth with Google
// @route   GET /auth/google
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @desc    Google auth callback
// @route   GET /auth/google/callback
authRoutes.get(
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
authRoutes.get("/logout", (req, res) => {
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
authRoutes.get(
  "/user",
  ensureAuth,
  (req: Request, res: Response<ApiResponse>) => {
    // req.user is populated by Passport. Password is automatically excluded via schema toJSON transform.
    if (req.user) {
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: req.user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No user found in session.",
      });
    }
  }
);

export { authRoutes };

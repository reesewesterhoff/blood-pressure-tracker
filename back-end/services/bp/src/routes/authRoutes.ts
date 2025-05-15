// Description: Authentication routes using Passport.js for Google OAuth.

import express from "express";
import passport from "passport"; // You would configure Passport with GoogleStrategy
import { ensureAuth } from "../middleware/authMiddleware";

const router = express.Router();

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
  passport.authenticate("google", { failureRedirect: "/login" }), // Redirect to frontend login on failure
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard.
    // You might set a cookie or JWT here.
    res.redirect(process.env.FRONTEND_URL || "http://localhost:8080/dashboard");
  }
);

// @desc    Logout user
// @route   GET /auth/logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    // req.logout requires a callback in newer passport versions
    if (err) {
      return next(err);
    }
    // res.redirect(process.env.FRONTEND_URL || 'http://localhost:8080/'); // Redirect to frontend home
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// @desc    Get current logged-in user
// @route   GET /auth/user
router.get("/user", ensureAuth, (req, res) => {
  res.json(req.user); // req.user is populated by Passport
});

export default router;

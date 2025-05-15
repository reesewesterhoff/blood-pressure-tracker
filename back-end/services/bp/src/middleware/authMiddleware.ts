// Description: Middleware to protect routes.
// This assumes you are using Passport.js with a JWT strategy or session strategy after Google OAuth.

import { Request, Response, NextFunction } from "express";
import passport from "passport"; // Assuming you'll use Passport for auth

// This is a placeholder. Actual implementation depends on your Passport strategy.
export const ensureAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // This method comes from Passport
    return next();
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
};

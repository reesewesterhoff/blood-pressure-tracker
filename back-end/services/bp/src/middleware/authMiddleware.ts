// Description: Middleware to protect routes.

import { Request, Response, NextFunction } from "express";
// import passport from 'passport'; // Not directly used here but ensureAuth relies on passport's req.isAuthenticated()

export const ensureAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // This method comes from Passport
    return next();
  } else {
    res.status(401).json({ message: "User not authenticated. Please log in." });
  }
};

// Description: API routes for blood pressure readings.

import express from "express";
import {
  addReading,
  getReadings,
  getAverageBloodPressure,
} from "../controllers/bloodPressureController";
import { ensureAuth } from "../middleware/authMiddleware"; // Middleware to protect routes

const router = express.Router();

// All routes in this file are protected and require authentication
router.post("/", ensureAuth, addReading);
router.get("/", ensureAuth, getReadings);
router.get("/average", ensureAuth, getAverageBloodPressure);

export default router;

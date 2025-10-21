// Description: API routes for blood pressure readings.

import expressRoute, { Request, Response, NextFunction } from "express";
import {
  addReading as addReadingController,
  getReadings as getReadingsController,
  getAverageBloodPressure as getAverageBloodPressureController,
} from "../controllers/bloodPressureController";
import { ensureAuth as ensureAuthMiddleware } from "../middleware";

const bloodPressureRoutes = expressRoute.Router();

// All routes in this file are protected and require authentication
bloodPressureRoutes.post("/", ensureAuthMiddleware, addReadingController);
bloodPressureRoutes.get("/", ensureAuthMiddleware, getReadingsController);
bloodPressureRoutes.get(
  "/average",
  ensureAuthMiddleware,
  getAverageBloodPressureController
);

export { bloodPressureRoutes };

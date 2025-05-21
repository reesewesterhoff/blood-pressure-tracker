// Description: API routes for blood pressure readings.

import expressRoute from "express";
import {
  addReading as addReadingController,
  getReadings as getReadingsController,
  getAverageBloodPressure as getAverageBloodPressureController,
} from "../controllers/bloodPressureController";
import { ensureAuth as ensureAuthMiddleware } from "../middleware/authMiddleware";

const bpRouter = expressRoute.Router();

// All routes in this file are protected and require authentication
bpRouter.post("/", ensureAuthMiddleware, addReadingController);
bpRouter.get("/", ensureAuthMiddleware, getReadingsController);
bpRouter.get(
  "/average",
  ensureAuthMiddleware,
  getAverageBloodPressureController
);

export default bpRouter;

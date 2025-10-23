// Description: API routes for blood pressure readings.

import express from "express";
import {
  addReading,
  getReadings,
  getAverageBloodPressure,
} from "../controllers";
import { ensureAuth } from "../middleware";

const bloodPressureRoutes = express.Router();

// All routes in this file are protected and require authentication
bloodPressureRoutes.post("/", ensureAuth, addReading);
bloodPressureRoutes.get("/", ensureAuth, getReadings);
bloodPressureRoutes.get("/average", ensureAuth, getAverageBloodPressure);

export { bloodPressureRoutes };

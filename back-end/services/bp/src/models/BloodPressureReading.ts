// Description: Mongoose schema for Blood Pressure Readings.

import mongoose, { Schema as MongooseSchema } from "mongoose";
import { IBloodPressureReading } from "../types";

const BloodPressureReadingSchema: MongooseSchema = new MongooseSchema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User collection
    required: true,
    index: true, // Add index for better query performance
  },
  systolic: {
    type: Number,
    required: [true, "Systolic pressure is required"],
  },
  diastolic: {
    type: Number,
    required: [true, "Diastolic pressure is required"],
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true, // Add index for sorting queries
  },
  // You might add a virtual or a pre-save hook to determine this
  isHealthy: {
    type: Boolean,
  },
});

// Helper to determine if reading is healthy (example thresholds)
BloodPressureReadingSchema.pre<IBloodPressureReading>("save", function (next) {
  // Example: Normal: <=120/<=80, Elevated: 120-129/<80, Stage 1 HTN: 130-139/80-89, Stage 2 HTN: >=140/>=90
  // Consider healthy if systolic <=120 AND diastolic <=80
  if (this.systolic <= 120 && this.diastolic <= 80) {
    this.isHealthy = true;
  } else if (
    this.systolic >= 120 &&
    this.systolic <= 129 &&
    this.diastolic < 80
  ) {
    this.isHealthy = true; // Elevated but still within acceptable range
  } else {
    this.isHealthy = false; // Simplified, real logic would be more nuanced
  }
  next();
});

export const BloodPressureReading = mongoose.model<IBloodPressureReading>(
  "BloodPressureReading",
  BloodPressureReadingSchema
);

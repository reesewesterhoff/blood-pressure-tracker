// Description: Mongoose schema for Blood Pressure Readings.

import mongoose, { Document, Schema } from "mongoose";

export interface IBloodPressureReading extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  systolic: number;
  diastolic: number;
  recordedAt: Date;
  isHealthy?: boolean; // Optional: calculated field or set based on thresholds
}

const BloodPressureReadingSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User collection
    required: true,
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
  },
  // You might add a virtual or a pre-save hook to determine this
  isHealthy: {
    type: Boolean,
  },
});

// Helper to determine if reading is healthy (example thresholds)
BloodPressureReadingSchema.pre<IBloodPressureReading>("save", function (next) {
  // Example: Normal: <120/80, Elevated: 120-129/<80, Stage 1 HTN: 130-139/80-89, Stage 2 HTN: >=140/>=90
  if (this.systolic < 120 && this.diastolic < 80) {
    this.isHealthy = true;
  } else if (
    this.systolic >= 120 &&
    this.systolic <= 129 &&
    this.diastolic < 80
  ) {
    this.isHealthy = true; // Could be 'elevated' but still within a broader "not hypertensive crisis"
  } else {
    this.isHealthy = false; // Simplified, real logic would be more nuanced
  }
  next();
});

export default mongoose.model<IBloodPressureReading>(
  "BloodPressureReading",
  BloodPressureReadingSchema
);

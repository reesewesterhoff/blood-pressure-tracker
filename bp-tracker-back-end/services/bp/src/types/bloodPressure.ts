import { Document } from "mongoose";

export interface IBloodPressureReading extends Document {
  user: string;
  systolic: number;
  diastolic: number;
  recordedAt: Date;
  isHealthy?: boolean;
}

// Blood pressure calculation types
export interface BloodPressureStats {
  averageSystolic: number;
  averageDiastolic: number;
  count: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
}




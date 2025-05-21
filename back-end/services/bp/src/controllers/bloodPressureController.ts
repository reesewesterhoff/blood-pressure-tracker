// Description: Controllers for blood pressure reading operations.

import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import BloodPressureReadingModel from "../models/BloodPressureReading";
// import mongoose from 'mongoose'; // Already imported in User.ts and BloodPressureReading.ts

// @desc    Add a new blood pressure reading
// @route   POST /api/readings
// @access  Private
export const addReading = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { systolic, diastolic } = req.body;
    // Access user ID from req.user (populated by Passport)
    const userId = (req.user as any)?.id || (req.user as any)?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated for adding reading." });
    }

    if (!systolic || !diastolic) {
      return res
        .status(400)
        .json({ message: "Systolic and diastolic values are required" });
    }
    if (typeof systolic !== "number" || typeof diastolic !== "number") {
      return res
        .status(400)
        .json({ message: "Systolic and diastolic must be numbers." });
    }

    const newReading = new BloodPressureReadingModel({
      user: userId,
      systolic,
      diastolic,
    });

    const reading = await newReading.save();
    res.status(201).json(reading);
  } catch (err: any) {
    console.error("Error in addReading:", err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all blood pressure readings for the logged-in user
// @route   GET /api/readings
// @access  Private
export const getReadings = async (
  req: ExpressRequest,
  res: ExpressResponse
) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated for fetching readings." });
    }
    const readings = await BloodPressureReadingModel.find({
      user: userId,
    }).sort({ recordedAt: -1 });
    res.json(readings);
  } catch (err: any) {
    console.error("Error in getReadings:", err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get average blood pressure for the logged-in user
// @route   GET /api/readings/average
// @access  Private
export const getAverageBloodPressure = async (
  req: ExpressRequest,
  res: ExpressResponse
) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated for calculating average." });
    }

    const readings = await BloodPressureReadingModel.find({ user: userId });

    if (readings.length === 0) {
      return res.json({ averageSystolic: 0, averageDiastolic: 0, count: 0 });
    }

    const totalSystolic = readings.reduce(
      (acc, reading) => acc + reading.systolic,
      0
    );
    const totalDiastolic = readings.reduce(
      (acc, reading) => acc + reading.diastolic,
      0
    );

    res.json({
      averageSystolic: parseFloat((totalSystolic / readings.length).toFixed(2)),
      averageDiastolic: parseFloat(
        (totalDiastolic / readings.length).toFixed(2)
      ),
      count: readings.length,
    });
  } catch (err: any) {
    console.error("Error in getAverageBloodPressure:", err.message);
    res.status(500).send("Server Error");
  }
};

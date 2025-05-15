// Description: Controllers for blood pressure reading operations.

import { Request, Response } from "express";
import BloodPressureReading, {
  IBloodPressureReading,
} from "../models/BloodPressureReading";
import mongoose from "mongoose";

// @desc    Add a new blood pressure reading
// @route   POST /api/readings
// @access  Private
export const addReading = async (req: Request, res: Response) => {
  try {
    const { systolic, diastolic } = req.body;
    const userId = (req.user as any)?.id; // Assuming req.user is populated by auth middleware

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

    const newReading = new BloodPressureReading({
      user: userId,
      systolic,
      diastolic,
    });

    const reading = await newReading.save();
    res.status(201).json(reading);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all blood pressure readings for the logged-in user
// @route   GET /api/readings
// @access  Private
export const getReadings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated for fetching readings." });
    }
    const readings = await BloodPressureReading.find({ user: userId }).sort({
      recordedAt: -1,
    });
    res.json(readings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get average blood pressure for the logged-in user
// @route   GET /api/readings/average
// @access  Private
export const getAverageBloodPressure = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated for calculating average." });
    }

    const readings = await BloodPressureReading.find({ user: userId });

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
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

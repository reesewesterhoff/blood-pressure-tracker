// Description: Controllers for blood pressure reading operations.

import { Response } from "express";
import { BloodPressureReading } from "../models/BloodPressureReading";
import {
  ApiResponse,
  PaginatedResponse,
  BloodPressureStats,
  AuthenticatedRequest,
} from "../types";
import { parseQueryInt } from "../utils";

// @desc    Add a new blood pressure reading
// @route   POST /api/readings
// @access  Private
export const addReading = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
) => {
  try {
    const { systolic, diastolic } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated for adding reading.",
      });
    }

    // Input validation and sanitization
    if (!systolic || !diastolic) {
      return res.status(400).json({
        success: false,
        message: "Systolic and diastolic values are required",
      });
    }

    const systolicNum = Number(systolic);
    const diastolicNum = Number(diastolic);

    if (isNaN(systolicNum) || isNaN(diastolicNum)) {
      return res.status(400).json({
        success: false,
        message: "Systolic and diastolic must be valid numbers.",
      });
    }

    // Validate reasonable blood pressure ranges
    if (
      systolicNum < 50 ||
      systolicNum > 300 ||
      diastolicNum < 30 ||
      diastolicNum > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Blood pressure values are outside reasonable ranges.",
      });
    }

    const newReading = new BloodPressureReading({
      user: userId,
      systolic: systolicNum,
      diastolic: diastolicNum,
    });

    const reading = await newReading.save();
    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    console.error("Error in addReading:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all blood pressure readings for the logged-in user
// @route   GET /api/readings
// @access  Private
export const getReadings = async (
  req: AuthenticatedRequest,
  res: Response<PaginatedResponse<any>>
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated for fetching readings.",
      });
    }

    // Pagination parameters
    const page = parseQueryInt(req.query.page, 1);
    const limit = parseQueryInt(req.query.limit, 100);
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await BloodPressureReading.countDocuments({
      user: userId,
    });

    const readings = await BloodPressureReading.find({ user: userId })
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: readings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error in getReadings:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get average blood pressure for the logged-in user
// @route   GET /api/readings/average
// @access  Private
export const getAverageBloodPressure = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<BloodPressureStats>>
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated for calculating average.",
      });
    }

    // Use MongoDB aggregation pipeline for better performance
    const stats = await BloodPressureReading.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          averageSystolic: { $avg: "$systolic" },
          averageDiastolic: { $avg: "$diastolic" },
          minSystolic: { $min: "$systolic" },
          maxSystolic: { $max: "$systolic" },
          minDiastolic: { $min: "$diastolic" },
          maxDiastolic: { $max: "$diastolic" },
        },
      },
    ]);

    if (stats.length === 0) {
      const emptyStats: BloodPressureStats = {
        averageSystolic: 0,
        averageDiastolic: 0,
        count: 0,
        minSystolic: 0,
        maxSystolic: 0,
        minDiastolic: 0,
        maxDiastolic: 0,
      };
      return res.json({ success: true, data: emptyStats });
    }

    const result: BloodPressureStats = {
      averageSystolic: Math.round(stats[0].averageSystolic),
      averageDiastolic: Math.round(stats[0].averageDiastolic),
      count: stats[0].count,
      minSystolic: stats[0].minSystolic,
      maxSystolic: stats[0].maxSystolic,
      minDiastolic: stats[0].minDiastolic,
      maxDiastolic: stats[0].maxDiastolic,
    };

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getAverageBloodPressure:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

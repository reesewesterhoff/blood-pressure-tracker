// Tests for BloodPressureReading model

import mongoose from "mongoose";
import { BloodPressureReading } from "../../readings/models/BloodPressureReading";
import { User } from "../../auth/models/User";

describe("BloodPressureReading Model", () => {
  let testUser: any;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      email: "test@example.com",
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
    });
    await testUser.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await BloodPressureReading.deleteMany({});
  });

  test("should create a valid blood pressure reading", async () => {
    const readingData = {
      user: testUser._id,
      systolic: 120,
      diastolic: 80,
    };

    const reading = new BloodPressureReading(readingData);
    const savedReading = await reading.save();

    expect(savedReading._id).toBeDefined();
    expect(savedReading.user.toString()).toBe(testUser._id.toString());
    expect(savedReading.systolic).toBe(120);
    expect(savedReading.diastolic).toBe(80);
    expect(savedReading.recordedAt).toBeDefined();
    expect(savedReading.isHealthy).toBe(true); // Should be calculated by pre-save hook
  });

  test("should require user field", async () => {
    const readingData = {
      systolic: 120,
      diastolic: 80,
    };

    const reading = new BloodPressureReading(readingData);

    await expect(reading.save()).rejects.toThrow();
  });

  test("should require systolic field", async () => {
    const readingData = {
      user: testUser._id,
      diastolic: 80,
    };

    const reading = new BloodPressureReading(readingData);

    await expect(reading.save()).rejects.toThrow(
      "Systolic pressure is required"
    );
  });

  test("should require diastolic field", async () => {
    const readingData = {
      user: testUser._id,
      systolic: 120,
    };

    const reading = new BloodPressureReading(readingData);

    await expect(reading.save()).rejects.toThrow(
      "Diastolic pressure is required"
    );
  });

  test("should calculate isHealthy correctly for normal reading", async () => {
    const reading = new BloodPressureReading({
      user: testUser._id,
      systolic: 110,
      diastolic: 70,
    });

    await reading.save();
    expect(reading.isHealthy).toBe(true);
  });

  test("should calculate isHealthy correctly for elevated reading", async () => {
    const reading = new BloodPressureReading({
      user: testUser._id,
      systolic: 125,
      diastolic: 75,
    });

    await reading.save();
    expect(reading.isHealthy).toBe(true);
  });

  test("should calculate isHealthy correctly for high reading", async () => {
    const reading = new BloodPressureReading({
      user: testUser._id,
      systolic: 140,
      diastolic: 90,
    });

    await reading.save();
    expect(reading.isHealthy).toBe(false);
  });

  test("should set default recordedAt timestamp", async () => {
    const beforeSave = new Date();

    const reading = new BloodPressureReading({
      user: testUser._id,
      systolic: 120,
      diastolic: 80,
    });

    await reading.save();

    const afterSave = new Date();
    expect(reading.recordedAt.getTime()).toBeGreaterThanOrEqual(
      beforeSave.getTime()
    );
    expect(reading.recordedAt.getTime()).toBeLessThanOrEqual(
      afterSave.getTime()
    );
  });
});

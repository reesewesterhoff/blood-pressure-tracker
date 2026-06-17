// Unit tests for blood pressure reading controllers

import mongoose from "mongoose";
import { Request, Response } from "express";
import {
  addReading,
  getReadings,
  getAverageBloodPressure,
} from "../../../readings/controllers/bloodPressureController";
import { BloodPressureReading } from "../../../readings/models/BloodPressureReading";

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

function createMockResponse(): MockResponse {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    ...overrides,
  } as Request;
}

async function seedReadings(userId: mongoose.Types.ObjectId, count: number) {
  const docs = Array.from({ length: count }, (_, i) => ({
    user: userId,
    systolic: 110 + i,
    diastolic: 70 + i,
  }));
  await BloodPressureReading.insertMany(docs);
}

describe("bloodPressureController", () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
  });

  describe("addReading", () => {
    test("returns 401 when user is not authenticated", async () => {
      const req = createMockRequest({ body: { systolic: 120, diastolic: 80 } });
      const res = createMockResponse();

      await addReading(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("returns 400 when systolic or diastolic is missing", async () => {
      const req = createMockRequest({
        body: { systolic: 120 },
        user: { _id: userId } as any,
      });
      const res = createMockResponse();

      await addReading(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Systolic and diastolic values are required",
        })
      );
    });

    test("returns 400 when values are not valid numbers", async () => {
      const req = createMockRequest({
        body: { systolic: "abc", diastolic: "xyz" },
        user: { _id: userId } as any,
      });
      const res = createMockResponse();

      await addReading(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Systolic and diastolic must be valid numbers.",
        })
      );
    });

    test("returns 400 when values are outside reasonable ranges", async () => {
      const req = createMockRequest({
        body: { systolic: 400, diastolic: 250 },
        user: { _id: userId } as any,
      });
      const res = createMockResponse();

      await addReading(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Blood pressure values are outside reasonable ranges.",
        })
      );
    });

    test("creates and persists a reading on valid input", async () => {
      const req = createMockRequest({
        body: { systolic: 120, diastolic: 80 },
        user: { _id: userId } as any,
      });
      const res = createMockResponse();

      await addReading(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.systolic).toBe(120);
      expect(payload.data.diastolic).toBe(80);

      const stored = await BloodPressureReading.find({ user: userId });
      expect(stored).toHaveLength(1);
    });

    test("coerces numeric strings into numbers", async () => {
      const req = createMockRequest({
        body: { systolic: "120", diastolic: "80" },
        user: { _id: userId } as any,
      });
      const res = createMockResponse();

      await addReading(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const payload = res.json.mock.calls[0][0];
      expect(payload.data.systolic).toBe(120);
      expect(payload.data.diastolic).toBe(80);
    });
  });

  describe("getReadings", () => {
    test("returns 401 when user is not authenticated", async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await getReadings(req, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("returns the user's readings with pagination metadata", async () => {
      await seedReadings(userId, 3);
      const req = createMockRequest({ user: { _id: userId } as any });
      const res = createMockResponse();

      await getReadings(req, res as any);

      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data).toHaveLength(3);
      expect(payload.pagination).toEqual(
        expect.objectContaining({ page: 1, limit: 100, total: 3, totalPages: 1 })
      );
    });

    test("respects page and limit query parameters", async () => {
      await seedReadings(userId, 5);
      const req = createMockRequest({
        user: { _id: userId } as any,
        query: { page: "2", limit: "2" } as any,
      });
      const res = createMockResponse();

      await getReadings(req, res as any);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data).toHaveLength(2);
      expect(payload.pagination).toEqual(
        expect.objectContaining({ page: 2, limit: 2, total: 5, totalPages: 3 })
      );
    });

    test("does not return readings belonging to other users", async () => {
      await seedReadings(userId, 2);
      await seedReadings(new mongoose.Types.ObjectId(), 4);
      const req = createMockRequest({ user: { _id: userId } as any });
      const res = createMockResponse();

      await getReadings(req, res as any);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data).toHaveLength(2);
      expect(payload.pagination.total).toBe(2);
    });
  });

  describe("getAverageBloodPressure", () => {
    test("returns 401 when user is not authenticated", async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await getAverageBloodPressure(req, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("returns zeroed stats when the user has no readings", async () => {
      const req = createMockRequest({ user: { _id: userId } as any });
      const res = createMockResponse();

      await getAverageBloodPressure(req, res as any);

      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data).toEqual({
        averageSystolic: 0,
        averageDiastolic: 0,
        count: 0,
        minSystolic: 0,
        maxSystolic: 0,
        minDiastolic: 0,
        maxDiastolic: 0,
      });
    });

    test("computes aggregate statistics across the user's readings", async () => {
      await BloodPressureReading.insertMany([
        { user: userId, systolic: 110, diastolic: 70 },
        { user: userId, systolic: 130, diastolic: 90 },
      ]);
      const req = createMockRequest({ user: { _id: userId } as any });
      const res = createMockResponse();

      await getAverageBloodPressure(req, res as any);

      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data).toEqual({
        averageSystolic: 120,
        averageDiastolic: 80,
        count: 2,
        minSystolic: 110,
        maxSystolic: 130,
        minDiastolic: 70,
        maxDiastolic: 90,
      });
    });
  });
});

// Integration tests for /api/readings routes

import request from "supertest";
import express from "express";
import mongoose from "mongoose";

// Controllable auth state so we can exercise both authenticated and
// unauthenticated paths through the real router.
let mockUserId: mongoose.Types.ObjectId | null = null;

jest.mock("../../../shared/middleware", () => {
  const actual = jest.requireActual("../../../shared/middleware");
  return {
    ...actual,
    ensureAuth: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (!mockUserId) {
        return res
          .status(401)
          .json({ message: "User not authenticated. Please log in." });
      }
      req.user = { _id: mockUserId } as Express.User;
      next();
    },
  };
});

import { bloodPressureRoutes } from "../../../readings/routes/bloodPressureRoutes";
import { errorHandler } from "../../../shared/middleware";
import { BloodPressureReading } from "../../../readings/models/BloodPressureReading";

function createReadingsApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/readings", bloodPressureRoutes);
  app.use(errorHandler);
  return app;
}

describe("bloodPressureRoutes", () => {
  let app: express.Application;

  beforeAll(() => {
    app = createReadingsApp();
  });

  beforeEach(() => {
    mockUserId = new mongoose.Types.ObjectId();
  });

  afterEach(() => {
    mockUserId = null;
  });

  describe("POST /api/readings", () => {
    test("returns 401 when not authenticated", async () => {
      mockUserId = null;

      const res = await request(app)
        .post("/api/readings")
        .send({ systolic: 120, diastolic: 80 });

      expect(res.status).toBe(401);
    });

    test("returns 201 and persists the reading when authenticated", async () => {
      const res = await request(app)
        .post("/api/readings")
        .send({ systolic: 120, diastolic: 80 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.systolic).toBe(120);
      expect(res.body.data.diastolic).toBe(80);

      const stored = await BloodPressureReading.find({ user: mockUserId });
      expect(stored).toHaveLength(1);
    });

    test("returns 400 when required values are missing", async () => {
      const res = await request(app)
        .post("/api/readings")
        .send({ systolic: 120 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("returns 400 when values are outside reasonable ranges", async () => {
      const res = await request(app)
        .post("/api/readings")
        .send({ systolic: 400, diastolic: 250 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/readings", () => {
    test("returns 401 when not authenticated", async () => {
      mockUserId = null;

      const res = await request(app).get("/api/readings");

      expect(res.status).toBe(401);
    });

    test("returns the authenticated user's readings with pagination", async () => {
      await BloodPressureReading.insertMany([
        { user: mockUserId, systolic: 110, diastolic: 70 },
        { user: mockUserId, systolic: 120, diastolic: 80 },
      ]);

      const res = await request(app).get("/api/readings");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual(
        expect.objectContaining({ page: 1, total: 2, totalPages: 1 })
      );
    });
  });

  describe("GET /api/readings/average", () => {
    test("returns 401 when not authenticated", async () => {
      mockUserId = null;

      const res = await request(app).get("/api/readings/average");

      expect(res.status).toBe(401);
    });

    test("returns zeroed stats when there are no readings", async () => {
      const res = await request(app).get("/api/readings/average");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(0);
    });

    test("returns computed stats when readings exist", async () => {
      await BloodPressureReading.insertMany([
        { user: mockUserId, systolic: 110, diastolic: 70 },
        { user: mockUserId, systolic: 130, diastolic: 90 },
      ]);

      const res = await request(app).get("/api/readings/average");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          averageSystolic: 120,
          averageDiastolic: 80,
          count: 2,
        })
      );
    });
  });
});

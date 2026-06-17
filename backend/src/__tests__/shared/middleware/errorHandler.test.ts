// Tests for centralized error handling middleware

import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  CustomError,
  errorHandler,
  notFoundHandler,
} from "../../../shared/middleware/errorHandler";

function createMockResponse(): Response & { status: jest.Mock; json: jest.Mock } {
  const res = {} as Response & { status: jest.Mock; json: jest.Mock };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    url: "/test",
    originalUrl: "/test",
    method: "GET",
    ip: "127.0.0.1",
    get: jest.fn().mockReturnValue("jest-agent"),
    ...overrides,
  } as unknown as Request;
}

describe("CustomError", () => {
  test("defaults to status 500 and operational true", () => {
    const err = new CustomError("boom");
    expect(err.message).toBe("boom");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  test("respects explicit status code and operational flag", () => {
    const err = new CustomError("nope", 418, false);
    expect(err.statusCode).toBe(418);
    expect(err.isOperational).toBe(false);
  });
});

describe("errorHandler", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test("uses the error's statusCode and message", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    errorHandler(new CustomError("custom failure", 403), req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "custom failure" })
    );
  });

  test("falls back to 500 and a generic message for plain errors", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    const plain = new Error("");
    errorHandler(plain, req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Server Error" })
    );
  });

  test("maps Mongoose CastError to 400", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    const castError = new mongoose.Error.CastError("ObjectId", "bad", "_id");
    errorHandler(castError, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid ID format provided" })
    );
  });

  test("maps MongoDB driver duplicate key error (code 11000) to 400", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // A real duplicate-key error comes from the MongoDB driver, not Mongoose,
    // so it is NOT an instance of mongoose.Error.
    const dupError = new Error("E11000 duplicate key error") as Error & {
      code?: number;
    };
    dupError.name = "MongoServerError";
    dupError.code = 11000;
    errorHandler(dupError, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Duplicate field value entered" })
    );
  });

  test("maps Mongoose ValidationError to 400 with joined messages", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    const validationError = new mongoose.Error.ValidationError();
    validationError.errors = {
      systolic: { message: "Systolic is required" } as any,
      diastolic: { message: "Diastolic is required" } as any,
    };
    errorHandler(validationError, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toContain("Systolic is required");
    expect(payload.message).toContain("Diastolic is required");
  });

  test("maps authentication-related error names to 401", () => {
    const names = [
      "AuthenticationError",
      "JsonWebTokenError",
      "TokenExpiredError",
    ];

    names.forEach((name) => {
      const req = createMockRequest();
      const res = createMockResponse();
      const err = new Error("auth issue");
      err.name = name;

      errorHandler(err, req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  test("maps rate limit errors to 429", () => {
    const req = createMockRequest();
    const res = createMockResponse();

    errorHandler(new Error("Too many requests, slow down"), req, res);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  test("includes stack trace in development mode", () => {
    process.env.NODE_ENV = "development";
    const req = createMockRequest();
    const res = createMockResponse();

    errorHandler(new CustomError("dev failure", 500), req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.stack).toBeDefined();
  });

  test("omits stack trace outside development mode", () => {
    process.env.NODE_ENV = "production";
    const req = createMockRequest();
    const res = createMockResponse();

    errorHandler(new CustomError("prod failure", 500), req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.stack).toBeUndefined();
  });
});

describe("notFoundHandler", () => {
  test("responds with 404 and the requested route", () => {
    const req = createMockRequest({ originalUrl: "/missing" } as Partial<Request>);
    const res = createMockResponse();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Route /missing not found",
      })
    );
  });
});

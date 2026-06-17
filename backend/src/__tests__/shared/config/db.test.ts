// Tests for database configuration helpers and the connectDB bootstrap.

import mongoose from "mongoose";
import { parsePoolSize, connectDB } from "../../../shared/config/db";

describe("parsePoolSize", () => {
  test("returns the fallback when the value is undefined", () => {
    expect(parsePoolSize(undefined, 10)).toBe(10);
  });

  test("returns the fallback for an empty string", () => {
    expect(parsePoolSize("", 3)).toBe(3);
  });

  test("parses a valid numeric string", () => {
    expect(parsePoolSize("25", 10)).toBe(25);
  });

  test("parses zero", () => {
    expect(parsePoolSize("0", 10)).toBe(0);
  });

  test("returns the fallback for a non-numeric string", () => {
    expect(parsePoolSize("not-a-number", 7)).toBe(7);
  });
});

describe("connectDB", () => {
  const originalEnv = process.env;
  let connectSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    // Start from a clean slate so only the vars a test sets are present.
    process.env = {};

    // Avoid opening a real connection (the shared setup already owns one).
    connectSpy = jest
      .spyOn(mongoose, "connect")
      .mockResolvedValue(mongoose as never);

    exitSpy = jest.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`);
    }) as never);
  });

  afterEach(() => {
    process.env = originalEnv;
    connectSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test("connects using MONGO_URI and configured pool sizes", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/custom";
    process.env.MONGO_MAX_POOL_SIZE = "25";
    process.env.MONGO_MIN_POOL_SIZE = "5";

    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith(
      "mongodb://localhost:27017/custom",
      expect.objectContaining({ maxPoolSize: 25, minPoolSize: 5 })
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("falls back to default URI and pool sizes when env vars are unset", async () => {
    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith(
      "mongodb://localhost:27017/blood_pressure_tracker",
      expect.objectContaining({ maxPoolSize: 10, minPoolSize: 0 })
    );
  });

  test("exits the process when the connection fails", async () => {
    connectSpy.mockRejectedValue(new Error("connection refused"));

    await expect(connectDB()).rejects.toThrow("process.exit:1");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

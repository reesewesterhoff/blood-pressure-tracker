// Tests for environment configuration validation/loading

import { loadEnvironmentConfig } from "../../../shared/config/environment";

// Sets only the required environment variables (the minimum needed to pass
// validation). Optional vars with defaults (NODE_ENV, PORT, FRONTEND_URL) are
// set per-test only when a test asserts on them.
function applyRequiredEnv() {
  process.env.MONGO_URI = "mongodb://localhost:27017/app";
  process.env.SESSION_SECRET = "a".repeat(32);
  process.env.GOOGLE_CLIENT_ID = "google-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "redis-token";
}

describe("loadEnvironmentConfig", () => {
  const originalEnv = process.env;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    // Start each test from a clean slate so only the values a test sets are present.
    process.env = {};

    // Make process.exit observable instead of killing the test runner
    exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(((code?: number) => {
        throw new Error(`process.exit:${code}`);
      }) as never);
  });

  afterEach(() => {
    process.env = originalEnv;
    exitSpy.mockRestore();
  });

  test("returns a populated config when all variables are valid", () => {
    applyRequiredEnv();
    process.env.NODE_ENV = "test";
    process.env.PORT = "4000";
    process.env.FRONTEND_URL = "https://app.example.com";

    const config = loadEnvironmentConfig();

    expect(config).toEqual({
      NODE_ENV: "test",
      PORT: 4000,
      MONGO_URI: "mongodb://localhost:27017/app",
      SESSION_SECRET: "a".repeat(32),
      FRONTEND_URL: "https://app.example.com",
      GOOGLE_CLIENT_ID: "google-client-id",
      GOOGLE_CLIENT_SECRET: "google-client-secret",
      UPSTASH_REDIS_REST_URL: "https://redis.example.com",
      UPSTASH_REDIS_REST_TOKEN: "redis-token",
    });
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("applies defaults for optional variables", () => {
    applyRequiredEnv();

    const config = loadEnvironmentConfig();

    expect(config.NODE_ENV).toBe("development");
    expect(config.PORT).toBe(3000);
    expect(config.FRONTEND_URL).toBe("http://localhost:8080");
  });

  test("supports mongodb+srv connection strings", () => {
    applyRequiredEnv();
    process.env.MONGO_URI = "mongodb+srv://user:pass@cluster.example.com/app";

    const config = loadEnvironmentConfig();

    expect(config.MONGO_URI).toBe(
      "mongodb+srv://user:pass@cluster.example.com/app"
    );
  });

  test("exits when a required variable is missing", () => {
    applyRequiredEnv();
    delete process.env.GOOGLE_CLIENT_ID;

    expect(() => loadEnvironmentConfig()).toThrow("process.exit:1");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("exits when MONGO_URI is not a valid connection string", () => {
    applyRequiredEnv();
    process.env.MONGO_URI = "postgres://localhost/app";

    expect(() => loadEnvironmentConfig()).toThrow("process.exit:1");
  });

  test("exits when SESSION_SECRET is too short", () => {
    applyRequiredEnv();
    process.env.SESSION_SECRET = "short-secret";

    expect(() => loadEnvironmentConfig()).toThrow("process.exit:1");
  });

  test("exits when PORT is outside the valid range", () => {
    applyRequiredEnv();
    process.env.PORT = "70000";

    expect(() => loadEnvironmentConfig()).toThrow("process.exit:1");
  });

  test("exits when PORT is not a number", () => {
    applyRequiredEnv();
    process.env.PORT = "not-a-port";

    expect(() => loadEnvironmentConfig()).toThrow("process.exit:1");
  });
});

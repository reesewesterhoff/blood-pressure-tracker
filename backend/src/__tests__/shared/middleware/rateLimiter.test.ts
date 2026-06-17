// Tests for the Upstash Redis-backed rate limiting middleware.
// The Redis client is mocked so no network access is required.

import { Request, Response, NextFunction } from "express";

const mockRedis = {
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  get: jest.fn(),
  ping: jest.fn().mockResolvedValue("PONG"),
};

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => mockRedis),
}));

import { createRateLimiter } from "../../../shared/middleware/rateLimiter";

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
  set: jest.Mock;
  on: jest.Mock;
};

function createMockResponse(): MockResponse {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.on = jest.fn().mockReturnValue(res);
  return res;
}

function createMockRequest(ip = "1.2.3.4"): Request {
  return { ip } as unknown as Request;
}

describe("createRateLimiter (standard mode)", () => {
  beforeEach(() => {
    mockRedis.incr.mockReset();
    mockRedis.expire.mockReset();
    mockRedis.ttl.mockReset();
    mockRedis.get.mockReset();
  });

  test("allows a request that is under the limit and sets headers", async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.ttl.mockResolvedValue(900);

    const limiter = createRateLimiter({ windowMs: 60000, max: 5 });
    const req = createMockRequest();
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    await limiter(req, res, next);

    expect(mockRedis.incr).toHaveBeenCalled();
    expect(mockRedis.expire).toHaveBeenCalled(); // first request sets expiry
    expect(res.set).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalledWith(429);
  });

  test("does not reset expiry on subsequent requests", async () => {
    mockRedis.incr.mockResolvedValue(2);
    mockRedis.ttl.mockResolvedValue(800);

    const limiter = createRateLimiter({ windowMs: 60000, max: 5 });
    const next = jest.fn() as NextFunction;

    await limiter(createMockRequest(), createMockResponse(), next);

    expect(mockRedis.expire).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("returns 429 when the limit is exceeded", async () => {
    mockRedis.incr.mockResolvedValue(6);
    mockRedis.ttl.mockResolvedValue(120);

    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 5,
      message: "slow down",
    });
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    await limiter(createMockRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "slow down",
        retryAfter: 120,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("fails open (calls next) when Redis throws", async () => {
    mockRedis.incr.mockRejectedValue(new Error("redis down"));

    const limiter = createRateLimiter({ windowMs: 60000, max: 5 });
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    await limiter(createMockRequest(), res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalledWith(429);
  });
});

describe("createRateLimiter (skipSuccessfulRequests mode)", () => {
  beforeEach(() => {
    mockRedis.incr.mockReset();
    mockRedis.expire.mockReset();
    mockRedis.ttl.mockReset();
    mockRedis.get.mockReset();
  });

  test("blocks immediately when the failure count is at the limit", async () => {
    mockRedis.get.mockResolvedValue(5);
    mockRedis.ttl.mockResolvedValue(300);

    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 5,
      skipSuccessfulRequests: true,
    });
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    await limiter(createMockRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ retryAfter: 300 })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("allows the request and registers a finish listener when under the limit", async () => {
    mockRedis.get.mockResolvedValue(0);

    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 5,
      skipSuccessfulRequests: true,
    });
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    await limiter(createMockRequest(), res, next);

    expect(res.set).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
    expect(next).toHaveBeenCalledTimes(1);
  });
});

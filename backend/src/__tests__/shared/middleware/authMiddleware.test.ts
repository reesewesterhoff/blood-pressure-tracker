// Tests for the ensureAuth route-protection middleware

import { Request, Response, NextFunction } from "express";
import { ensureAuth } from "../../../shared/middleware/authMiddleware";

function createMockResponse(): Response & { status: jest.Mock; json: jest.Mock } {
  const res = {} as Response & { status: jest.Mock; json: jest.Mock };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("ensureAuth", () => {
  test("calls next when the request is authenticated", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(true),
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    ensureAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("responds 401 when the request is not authenticated", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(false),
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    ensureAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authenticated. Please log in.",
    });
  });
});

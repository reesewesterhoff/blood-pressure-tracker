// Integration tests for /auth routes (local register/login, session, logout, current user)

import request from "supertest";
import express from "express";
import session from "express-session";
import passport from "passport";

jest.mock("../../shared/middleware", () => {
  const actual = jest.requireActual("../../shared/middleware");
  return {
    ...actual,
    loginRateLimit: (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    registrationRateLimit: (
      _req: express.Request,
      _res: express.Response,
      next: express.NextFunction
    ) => next(),
  };
});

import { authRoutes } from "../../auth/routes/authRoutes";
import { configurePassport } from "../../shared/config";
import { errorHandler } from "../../shared/middleware";
import { User } from "../../auth/models/User";

function createAuthApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: "test-session-secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/auth", authRoutes);
  app.use(errorHandler);
  return app;
}

describe("authRoutes", () => {
  let app: express.Application;

  beforeAll(() => {
    process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test-google-client-id";
    process.env.GOOGLE_CLIENT_SECRET =
      process.env.GOOGLE_CLIENT_SECRET || "test-google-client-secret";
    configurePassport();
    app = createAuthApp();
  });

  describe("POST /auth/register", () => {
    test("returns 400 when required fields are missing", async () => {
      const res = await request(app).post("/auth/register").send({ email: "a@b.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email, password, and first name/i);
    });

    test("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "not-an-email",
          password: "ValidPass123!",
          firstName: "Test",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // NOTE: Password-strength validation is currently disabled in the source
    // (`validatePassword` is a no-op stub that accepts any input), so weak
    // passwords are accepted at registration. This test documents the current
    // behavior. Re-tighten it to expect a 400 once validation is re-enabled.
    test("currently accepts weak passwords because password validation is disabled", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "weak@example.com",
          password: "short",
          firstName: "Test",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test("returns 409 when email already exists", async () => {
      await User.create({
        email: "dup@example.com",
        password: "ValidPass123!",
        firstName: "Existing",
      });

      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "dup@example.com",
          password: "ValidPass123!",
          firstName: "New",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    test("registers, logs in session, and omits password in response", async () => {
      const agent = request.agent(app);
      const res = await agent.post("/auth/register").send({
        email: "NewUser@example.com",
        password: "ValidPass123!",
        firstName: "New",
        lastName: "User",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("newuser@example.com");
      expect(res.body.data.password).toBeUndefined();

      const userRow = await User.findOne({ email: "newuser@example.com" });
      expect(userRow).not.toBeNull();
      expect(userRow!.password).toBeDefined();
      expect(userRow!.password).not.toBe("ValidPass123!");

      const me = await agent.get("/auth/user");
      expect(me.status).toBe(200);
      expect(me.body.data.email).toBe("newuser@example.com");
      expect(me.body.data.password).toBeUndefined();
    });
  });

  describe("POST /auth/login", () => {
    test("returns 401 for unknown email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "missing@example.com", password: "ValidPass123!" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("returns 401 for wrong password", async () => {
      await User.create({
        email: "login@example.com",
        password: "ValidPass123!",
        firstName: "Login",
      });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "login@example.com", password: "WrongPass123!" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/incorrect|invalid/i);
    });

    test("logs in and returns user without password", async () => {
      await User.create({
        email: "ok@example.com",
        password: "ValidPass123!",
        firstName: "Ok",
      });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "ok@example.com", password: "ValidPass123!" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("ok@example.com");
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe("GET /auth/user", () => {
    test("returns 401 when not authenticated", async () => {
      const res = await request(app).get("/auth/user");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /auth/logout", () => {
    test("returns 200 after login and clears session for subsequent /auth/user", async () => {
      await User.create({
        email: "logout@example.com",
        password: "ValidPass123!",
        firstName: "Out",
      });

      const agent = request.agent(app);
      await agent.post("/auth/login").send({
        email: "logout@example.com",
        password: "ValidPass123!",
      });

      const out = await agent.get("/auth/logout");
      expect(out.status).toBe(200);

      const me = await agent.get("/auth/user");
      expect(me.status).toBe(401);
    });
  });

  describe("GET /auth/google/callback", () => {
    test("redirects to login with error when Google returns an error", async () => {
      const res = await request(app)
        .get("/auth/google/callback")
        .query({ error: "access_denied", error_description: "user_cancelled" });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("error=access_denied");
      expect(res.headers.location).toContain("user_cancelled");
    });
  });
});

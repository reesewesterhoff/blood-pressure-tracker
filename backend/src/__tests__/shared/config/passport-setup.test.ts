// Tests for Passport strategy configuration (local + Google OAuth) and the
// serialize/deserialize hooks. The passport instance and the strategy
// constructors are mocked so we can capture and invoke the verify callbacks
// directly; the real User model + test DB back the lookups.

jest.mock("passport", () => ({
  __esModule: true,
  default: {
    use: jest.fn(),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
  },
}));

jest.mock("passport-local", () => ({
  Strategy: jest.fn(),
}));

jest.mock("passport-google-oauth20", () => ({
  Strategy: jest.fn(),
}));

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { configurePassport } from "../../../shared/config/passport-setup";
import { User } from "../../../auth/models/User";

type VerifyFn = (...args: any[]) => Promise<void> | void;

describe("configurePassport", () => {
  let localVerify: VerifyFn;
  let googleVerify: VerifyFn;
  let serializeUser: VerifyFn;
  let deserializeUser: VerifyFn;

  beforeAll(() => {
    configurePassport();

    localVerify = (LocalStrategy as unknown as jest.Mock).mock.calls[0][1];
    googleVerify = (GoogleStrategy as unknown as jest.Mock).mock.calls[0][1];
    serializeUser = (passport.serializeUser as unknown as jest.Mock).mock
      .calls[0][0];
    deserializeUser = (passport.deserializeUser as unknown as jest.Mock).mock
      .calls[0][0];
  });

  test("registers both strategies and the (de)serialize hooks", () => {
    expect((passport.use as jest.Mock)).toHaveBeenCalledTimes(2);
    expect(typeof localVerify).toBe("function");
    expect(typeof googleVerify).toBe("function");
    expect(typeof serializeUser).toBe("function");
    expect(typeof deserializeUser).toBe("function");
  });

  describe("local strategy verify", () => {
    test("authenticates a user with correct credentials (case-insensitive email)", async () => {
      await User.create({
        email: "local@example.com",
        password: "ValidPass123!",
        firstName: "Local",
      });
      const done = jest.fn();

      await localVerify("Local@Example.com", "ValidPass123!", done);

      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ email: "local@example.com" })
      );
    });

    test("rejects an unknown email", async () => {
      const done = jest.fn();

      await localVerify("missing@example.com", "whatever", done);

      expect(done).toHaveBeenCalledWith(null, false, {
        message: "Incorrect email or password.",
      });
    });

    test("rejects when the password is incorrect", async () => {
      await User.create({
        email: "wrongpass@example.com",
        password: "ValidPass123!",
        firstName: "Wrong",
      });
      const done = jest.fn();

      await localVerify("wrongpass@example.com", "BadPassword!", done);

      expect(done).toHaveBeenCalledWith(null, false, {
        message: "Incorrect email or password.",
      });
    });

    test("rejects a Google-only account that has no local password", async () => {
      await User.create({
        googleId: "google-only-1",
        email: "google-only@example.com",
        firstName: "GoogleOnly",
      });
      const done = jest.fn();

      await localVerify("google-only@example.com", "anything", done);

      expect(done).toHaveBeenCalledWith(
        null,
        false,
        expect.objectContaining({ message: expect.stringMatching(/Google/i) })
      );
    });

    test("passes unexpected errors to done", async () => {
      const findOneSpy = jest
        .spyOn(User, "findOne")
        .mockRejectedValueOnce(new Error("db down") as never);
      const done = jest.fn();

      await localVerify("err@example.com", "x", done);

      expect(done).toHaveBeenCalledWith(expect.any(Error));
      findOneSpy.mockRestore();
    });
  });

  describe("google strategy verify", () => {
    const baseProfile: any = {
      id: "google-id-1",
      displayName: "Test User",
      name: { givenName: "Test", familyName: "User" },
      emails: [{ value: "GoogleUser@Example.com" }],
      photos: [{ value: "http://img/p.png" }],
    };

    test("creates a new user when none exists", async () => {
      const done = jest.fn();

      await googleVerify("access", "refresh", baseProfile, done);

      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          googleId: "google-id-1",
          email: "googleuser@example.com",
        })
      );
    });

    test("returns the existing user matched by googleId", async () => {
      await User.create({
        googleId: "google-id-2",
        email: "existing@example.com",
        firstName: "Old",
      });
      const done = jest.fn();

      await googleVerify(
        "access",
        "refresh",
        { ...baseProfile, id: "google-id-2", emails: [{ value: "existing@example.com" }] },
        done
      );

      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ googleId: "google-id-2" })
      );
    });

    test("links a googleId to an existing account matched by email", async () => {
      await User.create({
        email: "link@example.com",
        password: "ValidPass123!",
        firstName: "Link",
      });
      const done = jest.fn();

      await googleVerify(
        "access",
        "refresh",
        { ...baseProfile, id: "new-google-id", emails: [{ value: "link@example.com" }] },
        done
      );

      const [, linkedUser] = done.mock.calls[0];
      expect(linkedUser.googleId).toBe("new-google-id");
      expect(linkedUser.email).toBe("link@example.com");
    });

    test("falls back to a username from the email when no given name is present", async () => {
      const done = jest.fn();

      await googleVerify(
        "access",
        "refresh",
        {
          id: "google-id-noname",
          name: undefined,
          emails: [{ value: "NoName@Example.com" }],
          photos: undefined,
        },
        done
      );

      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ firstName: "noname" })
      );
    });

    test("treats a duplicate-email write error as a failed login", async () => {
      const createSpy = jest.spyOn(User, "create").mockRejectedValueOnce(
        Object.assign(new Error("dup"), {
          code: 11000,
          keyPattern: { email: 1 },
        }) as never
      );
      const done = jest.fn();

      await googleVerify(
        "access",
        "refresh",
        { ...baseProfile, id: "dup-google-id", emails: [{ value: "brandnew@example.com" }] },
        done
      );

      expect(done).toHaveBeenCalledWith(
        null,
        false,
        expect.objectContaining({
          message: expect.stringMatching(/already exists/i),
        })
      );
      createSpy.mockRestore();
    });

    test("passes non-duplicate errors to done", async () => {
      const createSpy = jest
        .spyOn(User, "create")
        .mockRejectedValueOnce(new Error("unexpected") as never);
      const done = jest.fn();

      await googleVerify(
        "access",
        "refresh",
        { ...baseProfile, id: "err-google-id", emails: [{ value: "othernew@example.com" }] },
        done
      );

      expect(done).toHaveBeenCalledWith(expect.any(Error), undefined);
      createSpy.mockRestore();
    });
  });

  describe("serializeUser / deserializeUser", () => {
    test("serializes a user down to their id", () => {
      const done = jest.fn();

      serializeUser({ id: "abc123" }, done);

      expect(done).toHaveBeenCalledWith(null, "abc123");
    });

    test("deserializes a user by id", async () => {
      const user = await User.create({
        email: "deser@example.com",
        password: "ValidPass123!",
        firstName: "Deser",
      });
      const done = jest.fn();

      await deserializeUser(String(user.id), done);

      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ email: "deser@example.com" })
      );
    });

    test("passes lookup errors to done", async () => {
      const findByIdSpy = jest
        .spyOn(User, "findById")
        .mockRejectedValueOnce(new Error("boom") as never);
      const done = jest.fn();

      await deserializeUser("anything", done);

      expect(done).toHaveBeenCalledWith(expect.any(Error), null);
      findByIdSpy.mockRestore();
    });
  });
});

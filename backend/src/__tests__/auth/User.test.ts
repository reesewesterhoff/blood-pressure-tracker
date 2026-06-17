// Tests for User model (local + OAuth fields, password hashing, comparePassword, toJSON)

import bcrypt from "bcryptjs";
import { User } from "../../auth/models/User";

describe("User model", () => {
  test("hashes password on save for local users", async () => {
    const plain = "ValidPass123!";
    const user = new User({
      email: "hash@example.com",
      password: plain,
      firstName: "Hash",
    });
    await user.save();

    expect(user.password).toBeDefined();
    expect(user.password).not.toBe(plain);
    const ok = await bcrypt.compare(plain, user.password!);
    expect(ok).toBe(true);
  });

  test("comparePassword returns true for correct password", async () => {
    const plain = "ValidPass123!";
    const user = new User({
      email: "compare@example.com",
      password: plain,
      firstName: "Compare",
    });
    await user.save();

    await expect(user.comparePassword(plain)).resolves.toBe(true);
    await expect(user.comparePassword("WrongPass123!")).resolves.toBe(false);
  });

  test("comparePassword resolves false when no password is stored", async () => {
    const user = new User({
      googleId: "google-test-id",
      firstName: "OAuth",
      email: "oauth@example.com",
    });
    await user.save();

    await expect(user.comparePassword("anything")).resolves.toBe(false);
  });

  test("does not re-hash password when document is saved without password change", async () => {
    const user = new User({
      email: "stable@example.com",
      password: "ValidPass123!",
      firstName: "Stable",
    });
    await user.save();
    const hashAfterFirstSave = user.password;

    user.firstName = "Updated";
    await user.save();

    expect(user.password).toBe(hashAfterFirstSave);
  });

  test("toJSON omits password", async () => {
    const user = new User({
      email: "json@example.com",
      password: "ValidPass123!",
      firstName: "Json",
    });
    await user.save();

    const json = user.toJSON() as Record<string, unknown>;
    expect(json.password).toBeUndefined();
    expect(json.email).toBe("json@example.com");
  });

  test("rejects invalid email format for local users", async () => {
    const user = new User({
      email: "not-an-email",
      password: "ValidPass123!",
      firstName: "Bad",
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("persists Google OAuth user without local password", async () => {
    const user = new User({
      googleId: "gid-123",
      firstName: "Google",
      email: "google@example.com",
    });
    await user.save();

    const found = await User.findById(user._id).lean();
    expect(found).toBeDefined();
    expect(found!.googleId).toBe("gid-123");
    expect(found!.password).toBeUndefined();
  });
});

// Tests for password validation utility

import { validatePassword } from "../../shared/utils";

describe("validatePassword", () => {
  test("should validate strong passwords", () => {
    const strongPasswords = [
      "StrongPass123!",
      "MySecure2023@",
      "ComplexP@ssw0rd",
      "Test123456789!",
    ];

    strongPasswords.forEach((password) => {
      const result = validatePassword(password);
      expect(result.isValidPassword).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  test("should reject passwords that are too short", () => {
    const result = validatePassword("Short1!");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must be between 8 and 64 characters long."
    );
  });

  test("should reject passwords without uppercase letters", () => {
    const result = validatePassword("lowercase123!");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one uppercase letter (A-Z)."
    );
  });

  test("should reject passwords without lowercase letters", () => {
    const result = validatePassword("UPPERCASE123!");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one lowercase letter (a-z)."
    );
  });

  test("should reject passwords without numbers", () => {
    const result = validatePassword("NoNumbers!");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one number (0-9)."
    );
  });

  test("should reject passwords without special characters", () => {
    const result = validatePassword("NoSpecial123");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one special character (e.g., !@#$%^&*)."
    );
  });

  test("should reject common weak passwords", () => {
    // Use 8+ character passwords since shorter ones are caught by length check
    const weakPasswords = ["password", "123456789", "Password1"];

    weakPasswords.forEach((password) => {
      const result = validatePassword(password);
      expect(result.isValidPassword).toBe(false);
      expect(result.errors).toContain(
        "Password is too common or easily guessable."
      );
    });
  });

  test("should reject passwords with leading/trailing whitespace", () => {
    const result = validatePassword(" Password123! ");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must not contain leading or trailing whitespace."
    );
  });

  test("should handle empty password", () => {
    const result = validatePassword("");
    expect(result.isValidPassword).toBe(false);
    expect(result.errors).toContain(
      "Password must be between 8 and 64 characters long."
    );
  });
});

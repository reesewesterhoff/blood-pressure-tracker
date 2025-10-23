// Tests for email validation utility

import { validateEmail } from "../../utils";

describe("validateEmail", () => {
  test("should validate correct email addresses", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "user+tag@example.org",
      "test123@test-domain.com",
    ];

    validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValidEmail).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });

  test("should reject invalid email addresses", () => {
    const invalidEmails = [
      "invalid-email",
      "@example.com",
      "test@",
      "test.example.com",
      "",
      "test@.com",
      "test@domain.",
      "test..test@example.com",
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValidEmail).toBe(false);
      expect(result.message).toBe("Invalid email address format.");
    });
  });

  test("should handle edge cases", () => {
    // Test with undefined/null - should return invalid, not throw
    const undefinedResult = validateEmail(undefined as any);
    expect(undefinedResult.isValidEmail).toBe(false);

    const nullResult = validateEmail(null as any);
    expect(nullResult.isValidEmail).toBe(false);
  });
});

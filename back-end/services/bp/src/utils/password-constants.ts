/**
 * List of the most commonly used passwords (8+ characters only).
 * Shorter passwords are already caught by minimum length validation.
 * These passwords should be rejected during validation to improve security.
 *
 * Source: Compiled from various "most common passwords" lists including
 * NordPass, SplashData, and other security research.
 */
export const COMMON_PASSWORDS = [
  "password",
  "123456789",
  "12345678",
  "1234567890",
  "password1",
  "password123",
  "qwerty123",
  "12345678910",
  "baseball",
  "sunshine",
  "princess",
  "football",
  "iloveyou",
  "administrator",
  "trustno1",
  "barcelona",
  "passw0rd",
  "Password1",
  "Password123",
  "mypassword",
  "changeme",
  "whatever",
  "qwertyuiop",
  "starwars",
  "computer",
];

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;

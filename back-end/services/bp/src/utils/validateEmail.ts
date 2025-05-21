/**
 * Represents the result of an email validation.
 */
interface EmailValidationResult {
  isValidEmail: boolean;
  message?: string; // Optional message for invalid email
}

/**
 * Validates an email address based on a common regex pattern.
 *
 * @param email The email string to validate.
 * @returns An EmailValidationResult object.
 */
export function validateEmail(email: string): EmailValidationResult {
  // Regular expression for basic email validation
  // This regex is a common one, but email validation can be complex.
  // It checks for a general pattern: chars@chars.chars
  // For more robust validation, consider using a well-tested library.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(email)) {
    return { isValidEmail: true };
  } else {
    return { isValidEmail: false, message: "Invalid email address format." };
  }
}

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
  // Handle null/undefined - throw error for these
  if (email === null || email === undefined) {
    throw new Error("Email must be a non-empty string");
  }

  // Handle empty string and non-string types - return invalid
  if (!email || typeof email !== "string") {
    return { isValidEmail: false, message: "Invalid email address format." };
  }

  // Regular expression for email validation
  // Rejects consecutive dots, leading/trailing dots, and ensures proper structure
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Additional checks for consecutive dots and leading/trailing dots in local part
  const hasConsecutiveDots = /\.\./.test(email);
  const hasLeadingTrailingDots = /^\.|\.$|@\.|\.\@/.test(email);

  if (
    emailRegex.test(email) &&
    !hasConsecutiveDots &&
    !hasLeadingTrailingDots
  ) {
    return { isValidEmail: true };
  } else {
    return { isValidEmail: false, message: "Invalid email address format." };
  }
}

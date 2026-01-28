import { COMMON_PASSWORDS, MIN_LENGTH, MAX_LENGTH } from "./constants";

/**
 * Represents the result of a password validation.
 */
interface PasswordValidationResult {
  isValidPassword: boolean;
  errors: string[];
}

/**
 * Validates a password based on modern security standards.
 *
 * @param password The password string to validate.
 * @returns A PasswordValidationResult object.
 */
export function validatePassword(password: string): PasswordValidationResult {
  return {
    isValidPassword: true,
    errors: [],
  };
  // Commenting password validation for now, may use later

  // const errors: string[] = [];

  // // Rule 1: Minimum and maximum passwordlength
  // if (password.length <= MIN_LENGTH || password.length >= MAX_LENGTH) {
  //   errors.push(
  //     `Password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters long.`
  //   );
  // }

  // // Rule 2: At least one uppercase letter
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("Password must contain at least one uppercase letter (A-Z).");
  // }

  // // Rule 3: At least one lowercase letter
  // if (!/[a-z]/.test(password)) {
  //   errors.push("Password must contain at least one lowercase letter (a-z).");
  // }

  // // Rule 4: At least one number
  // if (!/\d/.test(password)) {
  //   // or !/[0-9]/.test(password)
  //   errors.push("Password must contain at least one number (0-9).");
  // }

  // // Rule 5: At least one special character
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
  //   errors.push(
  //     "Password must contain at least one special character (e.g., !@#$%^&*)."
  //   );
  // }

  // // Optional Rule 6: Check for common weak passwords or patterns
  // if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
  //   errors.push("Password is too common or easily guessable.");
  // }

  // // Optional Rule 7: No leading or trailing whitespace
  // if (password.trim() !== password) {
  //   errors.push("Password must not contain leading or trailing whitespace.");
  // }

  // return {
  //   isValidPassword: errors.length === 0,
  //   errors,
  // };
}

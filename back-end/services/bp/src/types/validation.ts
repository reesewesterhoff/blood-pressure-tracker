// Validation types
export interface EmailValidationResult {
  isValidEmail: boolean;
  message?: string;
}

export interface PasswordValidationResult {
  isValidPassword: boolean;
  errors: string[];
}




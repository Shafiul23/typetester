import { useState } from "react";

export const useValidation = () => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateInputs = (
    username: string,
    password: string,
    confirmPassword: string
  ): boolean => {
    setValidationError(null);

    if (username.trim().length < 3) {
      setValidationError("Username must be at least 3 characters long.");
      return false;
    }
    if (username.trim().length > 20) {
      setValidationError("Username must not exceed 20 characters.");
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setValidationError("Username can only contain letters and numbers.");
      return false;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setValidationError(
        "Password must contain at least one lowercase letter."
      );
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setValidationError("Password must contain at least one digit.");
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match!");
      return false;
    }

    return true;
  };

  return { validationError, validateInputs };
};

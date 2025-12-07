/**
 * Validation utilities for input data
 */

/**
 * Validates password strength
 * Password must:
 * - Be at least 8 characters long
 * - Contain at least one uppercase letter
 * - Contain at least one lowercase letter
 * - Contain at least one number
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  return { valid: true };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates nickname format
 * Nickname must:
 * - Be at least 3 characters long
 * - Contain only alphanumeric characters and underscores
 */
export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (nickname.length < 3) {
    return { valid: false, error: 'Nickname must be at least 3 characters long' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
    return { valid: false, error: 'Nickname can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}

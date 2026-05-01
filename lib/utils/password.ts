import crypto from 'crypto';

/**
 * Generates a secure random password with 12 characters
 * Contains uppercase, lowercase, numbers, and special characters
 * Format: RvU@4729#Exam or Test@1842#Pwd
 */
export function generateSecurePassword(): string {
  const length = 12; // Fixed length for consistency
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*!';
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each required character type
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];
  password += special[crypto.randomInt(0, special.length)];
  
  // Fill remaining characters randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Shuffles a string randomly using Fisher-Yates algorithm
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Validates password strength for user-provided passwords
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@#$%&*!)
 */
export function isValidPassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%&*!]/.test(password);
  
  console.log('Password validation:', {
    password,
    length: password.length,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    isValid: hasUppercase && hasLowercase && hasNumber && hasSpecial
  });
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

/**
 * Get detailed password validation errors
 * Returns array of error messages
 */
export function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@#$%&*!]/.test(password)) {
    errors.push('Password must contain at least one special character (@#$%&*!)');
  }
  
  return errors;
}

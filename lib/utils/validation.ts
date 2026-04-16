/**
 * Validation utilities for student registration form inputs
 * Requirements: 1.2, 1.4
 */

/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns true if password meets minimum requirements (8+ characters), false otherwise
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  return password.length >= 8;
}

/**
 * Validates Indian phone number format
 * @param phone - Phone number to validate
 * @returns true if phone number is a valid 10-digit Indian number, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove any whitespace
  const cleanPhone = phone.trim().replace(/\s/g, '');

  // Check if it's exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Validates school selection for student registration
 * @param selectedSchools - Array of school selections with schoolId and programIds
 * @returns true if at least one school and one program are selected, false otherwise
 */
export function validateSchoolSelection(
  selectedSchools: Array<{ schoolId: string; programIds: string[] }>
): boolean {
  if (!Array.isArray(selectedSchools) || selectedSchools.length === 0) {
    return false;
  }

  // Check that at least one school has at least one program selected
  return selectedSchools.some(
    (school) =>
      school.schoolId &&
      Array.isArray(school.programIds) &&
      school.programIds.length > 0
  );
}

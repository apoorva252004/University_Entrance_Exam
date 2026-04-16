/**
 * Unit tests for validation utilities
 */

import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  validateSchoolSelection,
} from './validation';

describe('isValidEmail', () => {
  test('validates correct email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co.in')).toBe(true);
    expect(isValidEmail('student123@rvu.edu.in')).toBe(true);
    expect(isValidEmail('name+tag@example.org')).toBe(true);
  });

  test('rejects invalid email formats', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('noatsign.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });

  test('handles edge cases', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });

  test('trims whitespace before validation', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });
});

describe('isValidPassword', () => {
  test('accepts passwords with 8 or more characters', () => {
    expect(isValidPassword('password')).toBe(true);
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('verylongpassword123')).toBe(true);
    expect(isValidPassword('Pass@123')).toBe(true);
  });

  test('rejects passwords with less than 8 characters', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('Pass@12')).toBe(false);
  });

  test('handles edge cases', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword('       ')).toBe(false);
    expect(isValidPassword(null as any)).toBe(false);
    expect(isValidPassword(undefined as any)).toBe(false);
  });
});

describe('isValidPhone', () => {
  test('validates 10-digit Indian phone numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('8123456789')).toBe(true);
    expect(isValidPhone('7000000000')).toBe(true);
  });

  test('rejects invalid phone number formats', () => {
    expect(isValidPhone('123456789')).toBe(false); // 9 digits
    expect(isValidPhone('12345678901')).toBe(false); // 11 digits
    expect(isValidPhone('abcd123456')).toBe(false); // contains letters
    expect(isValidPhone('98765-43210')).toBe(false); // contains hyphen
    expect(isValidPhone('+919876543210')).toBe(false); // contains country code
  });

  test('handles whitespace in phone numbers', () => {
    expect(isValidPhone('9876 543 210')).toBe(true);
    expect(isValidPhone('  9876543210  ')).toBe(true);
  });

  test('handles edge cases', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('   ')).toBe(false);
    expect(isValidPhone(null as any)).toBe(false);
    expect(isValidPhone(undefined as any)).toBe(false);
  });
});

describe('validateSchoolSelection', () => {
  test('validates selection with at least one school and program', () => {
    expect(
      validateSchoolSelection([
        { schoolId: 'school1', programIds: ['prog1'] },
      ])
    ).toBe(true);

    expect(
      validateSchoolSelection([
        { schoolId: 'school1', programIds: ['prog1', 'prog2'] },
      ])
    ).toBe(true);

    expect(
      validateSchoolSelection([
        { schoolId: 'school1', programIds: ['prog1'] },
        { schoolId: 'school2', programIds: ['prog2'] },
      ])
    ).toBe(true);
  });

  test('rejects empty selections', () => {
    expect(validateSchoolSelection([])).toBe(false);
  });

  test('rejects schools without programs', () => {
    expect(
      validateSchoolSelection([{ schoolId: 'school1', programIds: [] }])
    ).toBe(false);
  });

  test('accepts mixed selections if at least one school has programs', () => {
    expect(
      validateSchoolSelection([
        { schoolId: 'school1', programIds: [] },
        { schoolId: 'school2', programIds: ['prog1'] },
      ])
    ).toBe(true);
  });

  test('handles edge cases', () => {
    expect(validateSchoolSelection(null as any)).toBe(false);
    expect(validateSchoolSelection(undefined as any)).toBe(false);
    expect(
      validateSchoolSelection([
        { schoolId: '', programIds: ['prog1'] },
      ])
    ).toBe(false);
  });
});

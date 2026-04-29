import { prisma } from '../prisma';

/**
 * Generates a unique username from a full name
 * Format: firstname + 3-digit random number (e.g., "apoorva123")
 * Retries on collision up to maxAttempts times
 */
export async function generateUsername(
  fullName: string,
  maxAttempts: number = 10
): Promise<string> {
  const firstName = extractFirstName(fullName);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomNum = generateRandomThreeDigit();
    const username = `${firstName}${randomNum}`;
    
    if (await isUsernameUnique(username)) {
      return username;
    }
  }
  
  throw new Error('Unable to generate unique username after maximum attempts');
}

/**
 * Extracts the first name from a full name and converts to lowercase
 * Handles multiple spaces and special characters
 */
export function extractFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0].toLowerCase();
}

/**
 * Generates a random 3-digit number between 100 and 999
 */
export function generateRandomThreeDigit(): number {
  return Math.floor(Math.random() * 900) + 100;
}

/**
 * Checks if a username is unique in the database
 */
export async function isUsernameUnique(username: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });
  return existingUser === null;
}

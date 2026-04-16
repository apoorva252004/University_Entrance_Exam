// Mock for next-auth
export class CredentialsSignin extends Error {
  code = "credentials";
}

export default function NextAuth() {
  return {
    handlers: {},
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  };
}

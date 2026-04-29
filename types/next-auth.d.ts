import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      status: string;
      isFirstLogin: boolean;
      selectedSchools?: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: string;
    status: string;
    isFirstLogin: boolean;
    selectedSchools?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    status: string;
    isFirstLogin: boolean;
    selectedSchools?: string;
  }
}

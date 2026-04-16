import { DefaultSession } from "next-auth";
import { Role, ApplicationStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: ApplicationStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: ApplicationStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: ApplicationStatus;
  }
}

import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";

// Custom error for pending approval
class PendingApprovalError extends CredentialsSignin {
  code = "PENDING_APPROVAL";
}

// Custom error for rejected application
class ApplicationRejectedError extends CredentialsSignin {
  code = "APPLICATION_REJECTED";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // User not found
        if (!user) {
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        // Check student status
        if (user.role === "STUDENT") {
          if (user.status === "PENDING") {
            throw new PendingApprovalError("Waiting for admin approval");
          }
          if (user.status === "REJECTED") {
            throw new ApplicationRejectedError("Your application has been rejected");
          }
        }

        // Return user object with required fields
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          selectedSchools: user.selectedSchools || null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
        token.status = (user as User).status;
        token.selectedSchools = (user as User).selectedSchools;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.selectedSchools = token.selectedSchools as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

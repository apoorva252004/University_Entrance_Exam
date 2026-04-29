import NextAuth, { CredentialsSignin, NextAuthConfig } from "next-auth";
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

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username },
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

        // Check if student with pending status
        if (user.role === "STUDENT" && user.status === "PENDING") {
          throw new PendingApprovalError("Waiting for admin approval");
        }

        // Check if student with rejected status
        if (user.role === "STUDENT" && user.status === "REJECTED") {
          throw new ApplicationRejectedError("Your application has been rejected");
        }

        // Return user object with required fields
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          isFirstLogin: user.isFirstLogin,
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
        token.username = (user as User).username;
        token.role = (user as User).role;
        token.status = (user as User).status;
        token.isFirstLogin = (user as User).isFirstLogin;
        token.selectedSchools = (user as User).selectedSchools;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.isFirstLogin = token.isFirstLogin as boolean;
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);


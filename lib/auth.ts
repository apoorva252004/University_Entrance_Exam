import NextAuth, { CredentialsSignin, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { checkRateLimit, resetRateLimit } from "@/lib/utils/rate-limit";
import { logAuditEvent } from "@/lib/utils/audit-log";

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

        // Check rate limit for this username
        const rateLimit = checkRateLimit(username);
        if (!rateLimit.allowed) {
          logAuditEvent({
            eventType: 'ACCOUNT_LOCKED',
            username,
            success: false,
            details: { reason: 'Too many failed attempts', lockedUntil: rateLimit.lockedUntil },
          });
          throw new CredentialsSignin("Too many failed attempts. Account temporarily locked.");
        }

        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username },
        });

        // User not found - use generic error message
        if (!user) {
          logAuditEvent({
            eventType: 'LOGIN_FAILURE',
            username,
            success: false,
            details: { reason: 'Invalid credentials' },
          });
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          logAuditEvent({
            eventType: 'LOGIN_FAILURE',
            userId: user.id,
            username,
            success: false,
            details: { reason: 'Invalid credentials' },
          });
          return null;
        }

        // Successful login - reset rate limit
        resetRateLimit(username);
        
        logAuditEvent({
          eventType: 'LOGIN_SUCCESS',
          userId: user.id,
          username,
          success: true,
          details: { role: user.role },
        });

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


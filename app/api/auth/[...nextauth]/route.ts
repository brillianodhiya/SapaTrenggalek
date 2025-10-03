import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User } from "next-auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Demo credentials check (remove in production)
          if (
            credentials.email === "admin@trenggalek.go.id" &&
            credentials.password === "admin123"
          ) {
            return {
              id: "1",
              email: "admin@trenggalek.go.id",
              name: "Administrator",
              role: "admin",
            } as User;
          }

          // Get user from database (for production)
          const { data: user, error } = await supabaseAdmin
            .from("admin_users")
            .select("*")
            .eq("email", credentials.email)
            .eq("is_active", true)
            .single();

          if (error || !user) {
            return null;
          }

          // Check password hash
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash || ""
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          } as User;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role || "admin";
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

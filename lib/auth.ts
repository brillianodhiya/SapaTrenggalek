import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const authOptions: NextAuthOptions = {
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
          // Get user from database
          const { data: user, error } = await supabaseAdmin
            .from("admin_users")
            .select("*")
            .eq("email", credentials.email)
            .eq("is_active", true)
            .single();

          if (error || !user) {
            return null;
          }

          // Check password (for demo, we'll create a default admin)
          if (
            credentials.email === "admin@trenggalek.go.id" &&
            credentials.password === "admin123"
          ) {
            return {
              id: "1",
              email: "admin@trenggalek.go.id",
              name: "Administrator",
              role: "admin",
            };
          }

          return null;
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
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);

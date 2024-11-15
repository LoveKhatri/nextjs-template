import GitHub from "next-auth/providers/github";
import LinkedIn from "next-auth/providers/linkedin";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import redis from "@/lib/redis";
import { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/types/schemas";
import { verifyPassword } from "@/utils/crypto";

const requiredEnvVars = [
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
    "AUTH_GITHUB_ID",
    "AUTH_GITHUB_SECRET",
    "AUTH_DISCORD_ID",
    "AUTH_DISCORD_SECRET",
    "AUTH_LINKEDIN_ID",
    "AUTH_LINKEDIN_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing Environment Variables!!!\n${missingEnvVars.join("\n- ")}`);
}

export default {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET
        }),
        Discord({
            clientId: process.env.AUTH_DISCORD_ID,
            clientSecret: process.env.AUTH_DISCORD_SECRET
        }),
        LinkedIn({
            clientId: process.env.AUTH_LINKEDIN_ID,
            clientSecret: process.env.AUTH_LINKEDIN_SECRET
        }),
        Credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials)

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;

                    let user: User | null = await redis.json.get(`user:${email}`);

                    if (!user) {
                        user = await prisma.user.findUnique({ where: { email } })
                    }

                    if (!user || !user.password) return null;

                    const passwordsMatch = await verifyPassword(password, user.password)

                    if (passwordsMatch) return user;
                }

                return null;
            }
        })
    ]
} satisfies NextAuthConfig
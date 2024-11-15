import { PrismaClient } from "@prisma/client"

if (!process.env.DATABASE_URL) {
    throw new Error("Missing Environment Variable!!!\n- DATABASE_URL")
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
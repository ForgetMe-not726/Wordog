import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const dbUrl = process.env.DATABASE_URL!;
const isCloud = dbUrl.includes("supabase") || dbUrl.includes("neon") || dbUrl.includes("aws");

const pool = new Pool({
  connectionString: dbUrl,
  ...(isCloud ? { ssl: { rejectUnauthorized: false } } : {}),
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

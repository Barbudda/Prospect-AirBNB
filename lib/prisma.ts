import { PrismaClient } from "@prisma/client";

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("file:") || url === "") {
    // Local SQLite — used for development/preview
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const path = require("path");
    const dbPath = url.startsWith("file:")
      ? url.slice(5).replace(/^\.\//, path.resolve(process.cwd()) + "/")
      : path.resolve(process.cwd(), "dev.db");
    const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath.replace(/\\/g, "/") });
    return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  // PostgreSQL — Supabase (or any other Postgres)
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

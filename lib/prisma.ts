import { PrismaClient } from "@prisma/client";

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("file:") || url === "") {
    // Local SQLite — development only, better-sqlite3 is optional
    try {
      const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
      const path = require("path");
      const dbPath = url.startsWith("file:")
        ? url.slice(5).replace(/^\.\//, path.resolve(process.cwd()) + "/")
        : path.resolve(process.cwd(), "dev.db");
      const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath.replace(/\\/g, "/") });
      return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
    } catch {
      throw new Error(
        "SQLite adapter not available. Set DATABASE_URL to a PostgreSQL connection string or install better-sqlite3."
      );
    }
  }

  // PostgreSQL — Supabase (strip pgbouncer hint before passing to pg.Pool)
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");
  const cleanUrl = url.replace(/[?&]pgbouncer=true/i, "").replace(/[?&]pgbouncer=false/i, "");
  const pool = new Pool({ connectionString: cleanUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

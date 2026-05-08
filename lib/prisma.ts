import { PrismaClient } from "@prisma/client";

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (!url || url.startsWith("file:")) {
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
        "No DATABASE_URL set and better-sqlite3 is unavailable. Add DATABASE_URL to your environment variables."
      );
    }
  }

  // PostgreSQL — Supabase (strip pgbouncer hint before passing to pg.Pool)
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");
  const cleanUrl = url.replace(/[?&]pgbouncer=(true|false)/gi, "").replace(/[?&]$/, "");
  const pool = new Pool({ connectionString: cleanUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

// Lazy singleton — createClient() runs on first property access, NOT at module load time.
// This prevents Vercel build-time failures when DATABASE_URL isn't available during static analysis.
let _client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (!_client) {
    const g = globalThis as unknown as { prisma?: PrismaClient };
    _client = g.prisma ?? createClient();
    if (process.env.NODE_ENV !== "production") g.prisma = _client;
  }
  return _client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return (getClient() as any)[prop as string];
  },
});

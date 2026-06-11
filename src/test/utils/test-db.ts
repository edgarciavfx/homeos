import { PrismaClient } from "@prisma/client";

export function createTestDb() {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/homeos_test",
      },
    },
  });
}

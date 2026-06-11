import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";

describe("Auth API Integration", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("creates a user in the database", async () => {
    const user = await createTestUser(prisma);

    const found = await prisma.user.findUnique({ where: { id: user.id } });
    expect(found).not.toBeNull();
    expect(found?.email).toBe(user.email);
  });

  it("stores a session for a user", async () => {
    const user = await createTestUser(prisma);

    const session = await prisma.session.create({
      data: {
        sessionToken: `sess-${Date.now()}`,
        userId: user.id,
        expires: new Date(Date.now() + 86400000),
      },
    });

    expect(session.userId).toBe(user.id);

    const found = await prisma.session.findUnique({
      where: { sessionToken: session.sessionToken },
      include: { user: true },
    });
    expect(found).not.toBeNull();
    expect(found?.user.email).toBe(user.email);
  });

  it("finds a user by email", async () => {
    const email = `find-${Date.now()}@homeos.dev`;
    await createTestUser(prisma, { email });

    const found = await prisma.user.findUnique({ where: { email } });
    expect(found).not.toBeNull();
    expect(found?.email).toBe(email);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});

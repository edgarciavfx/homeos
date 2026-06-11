import { PrismaClient, User } from "@prisma/client";

let userCounter = 0;

export async function createTestUser(prisma: PrismaClient, overrides?: Partial<User>) {
  userCounter++;
  return prisma.user.create({
    data: {
      email:
        overrides?.email ?? `test-${Date.now()}-${userCounter}-${crypto.randomUUID()}@homeos.dev`,
      name: overrides?.name ?? "Test User",
    },
  });
}

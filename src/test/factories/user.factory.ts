import { PrismaClient, User } from "@prisma/client";

export async function createTestUser(prisma: PrismaClient, overrides?: Partial<User>) {
  return prisma.user.create({
    data: {
      email: overrides?.email ?? `test-${Date.now()}@homeos.dev`,
      name: overrides?.name ?? "Test User",
    },
  });
}

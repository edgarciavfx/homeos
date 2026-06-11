import { PrismaClient } from "@prisma/client";
import { createTestUser } from "./user.factory";

export async function createTestHousehold(prisma: PrismaClient, overrides?: { name?: string; ownerId?: string }) {
  const ownerId = overrides?.ownerId ?? (await createTestUser(prisma)).id;

  const household = await prisma.household.create({
    data: {
      name: overrides?.name ?? "Test Home",
      ownerId,
    },
  });

  await prisma.householdMember.create({
    data: {
      householdId: household.id,
      userId: ownerId,
      role: "OWNER",
    },
  });

  return { household, ownerId };
}

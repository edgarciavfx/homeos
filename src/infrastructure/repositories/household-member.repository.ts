import { HouseholdRole, Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class HouseholdMemberRepository {
  async findById(id: string) {
    return prisma.householdMember.findUnique({ where: { id } });
  }

  async findByHousehold(householdId: string) {
    return prisma.householdMember.findMany({
      where: { householdId },
      include: { user: true },
    });
  }

  async findByUserAndHousehold(userId: string, householdId: string) {
    return prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });
  }

  async create(data: { householdId: string; userId: string; role: HouseholdRole }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.householdMember.create({ data });
  }

  async findByHouseholdAndEmail(householdId: string, email: string) {
    return prisma.householdMember.findFirst({
      where: { householdId, user: { email } },
    });
  }

  async countByHousehold(householdId: string) {
    return prisma.householdMember.count({ where: { householdId } });
  }
}

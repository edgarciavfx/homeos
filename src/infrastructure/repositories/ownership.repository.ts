import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class OwnershipRepository {
  async findByHousehold(householdId: string) {
    return prisma.ownershipAssignment.findMany({
      where: { householdId },
      include: { owner: true },
    });
  }

  async create(data: { householdId: string; areaName: string; ownerId: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.ownershipAssignment.create({ data });
  }

  async update(id: string, data: { ownerId: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.ownershipAssignment.update({ where: { id }, data });
  }

  async findUnassigned(householdId: string) {
    return prisma.ownershipAssignment.findMany({
      where: { householdId },
      include: { owner: true },
    });
  }
}

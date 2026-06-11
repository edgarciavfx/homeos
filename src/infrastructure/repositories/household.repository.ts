import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class HouseholdRepository {
  async findById(id: string) {
    return prisma.household.findFirst({ where: { id, deletedAt: null } });
  }

  async findByOwnerId(ownerId: string) {
    return prisma.household.findMany({ where: { ownerId, deletedAt: null } });
  }

  async findMembership(userId: string) {
    return prisma.householdMember.findMany({
      where: { userId },
      include: { household: true },
    });
  }

  async create(data: { id?: string; name: string; ownerId: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.household.create({ data: { name: data.name, ownerId: data.ownerId } });
  }

  async update(id: string, data: { name?: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.household.update({ where: { id }, data });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.household.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

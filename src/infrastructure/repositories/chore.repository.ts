import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class ChoreRepository {
  async findById(id: string) {
    return prisma.chore.findFirst({
      where: { id, deletedAt: null },
      include: { occurrences: true },
    });
  }

  async findByHousehold(householdId: string) {
    return prisma.chore.findMany({
      where: { householdId, deletedAt: null },
      include: { occurrences: { orderBy: { dueDate: "desc" }, take: 5 } },
    });
  }

  async create(data: {
    householdId: string;
    name: string;
    frequency: any;
    active?: boolean;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.chore.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    frequency?: any;
    active?: boolean;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.chore.update({ where: { id }, data });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.chore.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

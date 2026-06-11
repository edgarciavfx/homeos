import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class BudgetRepository {
  async findById(id: string) {
    return prisma.budget.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByHouseholdAndMonth(householdId: string, month: number, year: number) {
    return prisma.budget.findUnique({
      where: { householdId_month_year: { householdId, month, year } },
      include: { purchases: true },
    });
  }

  async findCurrent(householdId: string) {
    const now = new Date();
    return prisma.budget.findFirst({
      where: {
        householdId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        deletedAt: null,
      },
      include: { purchases: true },
    });
  }

  async create(data: {
    householdId: string;
    month: number;
    year: number;
    amount: number;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.budget.create({ data });
  }

  async update(id: string, data: { amount: number }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.budget.update({ where: { id }, data });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.budget.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

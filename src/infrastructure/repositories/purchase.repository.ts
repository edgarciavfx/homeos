import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class PurchaseRepository {
  async findById(id: string) {
    return prisma.purchase.findUnique({ where: { id } });
  }

  async findByBudget(budgetId: string) {
    return prisma.purchase.findMany({
      where: { budgetId },
      orderBy: { purchaseDate: "desc" },
    });
  }

  async findByHousehold(householdId: string, options?: { page?: number; pageSize?: number }) {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { householdId },
        orderBy: { purchaseDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.purchase.count({ where: { householdId } }),
    ]);

    return { purchases, total, page, pageSize };
  }

  async create(data: {
    householdId: string;
    budgetId: string;
    amount: number;
    purchaseDate: Date;
    notes?: string;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.purchase.create({ data });
  }

  async sumByBudget(budgetId: string): Promise<number> {
    const result = await prisma.purchase.aggregate({
      where: { budgetId },
      _sum: { amount: true },
    });
    return result._sum.amount?.toNumber() ?? 0;
  }

  async sumByHouseholdAndPeriod(householdId: string, start: Date, end: Date): Promise<number> {
    const result = await prisma.purchase.aggregate({
      where: {
        householdId,
        purchaseDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    return result._sum.amount?.toNumber() ?? 0;
  }
}

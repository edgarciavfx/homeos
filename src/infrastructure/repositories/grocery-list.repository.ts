import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class GroceryListRepository {
  async findById(id: string) {
    return prisma.groceryList.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByWeeklyPlan(weeklyPlanId: string) {
    return prisma.groceryList.findUnique({
      where: { weeklyPlanId },
      include: { items: true },
    });
  }

  async findCurrentByHousehold(householdId: string) {
    return prisma.groceryList.findFirst({
      where: { householdId },
      include: { items: true },
      orderBy: { generatedAt: "desc" },
    });
  }

  async create(data: { householdId: string; weeklyPlanId: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryList.create({ data, include: { items: true } });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryList.delete({ where: { id } });
  }
}

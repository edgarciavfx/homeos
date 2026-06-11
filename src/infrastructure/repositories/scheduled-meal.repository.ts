import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class ScheduledMealRepository {
  async findById(id: string) {
    return prisma.scheduledMeal.findUnique({ where: { id }, include: { meal: true } });
  }

  async findByWeeklyPlan(weeklyPlanId: string) {
    return prisma.scheduledMeal.findMany({
      where: { weeklyPlanId },
      include: { meal: { include: { ingredients: true } } },
      orderBy: { scheduledDate: "asc" },
    });
  }

  async create(data: { weeklyPlanId: string; mealId: string; scheduledDate: Date }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.scheduledMeal.create({ data, include: { meal: { include: { ingredients: true } } } });
  }

  async update(id: string, data: { scheduledDate?: Date; mealId?: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.scheduledMeal.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.scheduledMeal.delete({ where: { id } });
  }
}

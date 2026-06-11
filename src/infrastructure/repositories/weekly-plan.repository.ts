import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class WeeklyPlanRepository {
  async findById(id: string) {
    return prisma.weeklyPlan.findFirst({
      where: { id, deletedAt: null },
      include: { priorities: true, scheduledMeals: { include: { meal: true } } },
    });
  }

  async findByHouseholdAndWeek(householdId: string, weekStartDate: Date) {
    return prisma.weeklyPlan.findFirst({
      where: { householdId, weekStartDate, deletedAt: null },
      include: { priorities: true, scheduledMeals: { include: { meal: true } } },
    });
  }

  async findCurrent(householdId: string) {
    return prisma.weeklyPlan.findFirst({
      where: { householdId, deletedAt: null },
      orderBy: { weekStartDate: "desc" },
      include: { priorities: true, scheduledMeals: { include: { meal: true } } },
    });
  }

  async create(data: { householdId: string; weekStartDate: Date; status?: any }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.weeklyPlan.create({
      data,
      include: { priorities: true, scheduledMeals: { include: { meal: true } } },
    });
  }

  async updateStatus(id: string, status: any, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.weeklyPlan.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.weeklyPlan.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

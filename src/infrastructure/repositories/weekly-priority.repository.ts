import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class WeeklyPriorityRepository {
  async findById(id: string) {
    return prisma.weeklyPriority.findUnique({ where: { id } });
  }

  async findByWeeklyPlan(weeklyPlanId: string) {
    return prisma.weeklyPriority.findMany({
      where: { weeklyPlanId },
      include: { owner: true },
    });
  }

  async create(data: {
    weeklyPlanId: string;
    title: string;
    description?: string;
    ownerId?: string;
    targetDate?: Date;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.weeklyPriority.create({ data });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    ownerId?: string;
    targetDate?: Date;
    completed?: boolean;
    completedAt?: Date | null;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.weeklyPriority.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.weeklyPriority.delete({ where: { id } });
  }
}

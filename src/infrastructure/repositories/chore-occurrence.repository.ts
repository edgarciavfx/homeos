import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class ChoreOccurrenceRepository {
  async findById(id: string) {
    return prisma.choreOccurrence.findUnique({ where: { id } });
  }

  async findByChore(choreId: string) {
    return prisma.choreOccurrence.findMany({
      where: { choreId },
      orderBy: { dueDate: "desc" },
    });
  }

  async findOverdue(householdId: string) {
    return prisma.choreOccurrence.findMany({
      where: {
        completedAt: null,
        dueDate: { lt: new Date() },
        chore: { householdId, deletedAt: null },
      },
      include: { chore: true, completedByUser: true },
      orderBy: { dueDate: "asc" },
    });
  }

  async findUpcoming(householdId: string, days: number) {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return prisma.choreOccurrence.findMany({
      where: {
        completedAt: null,
        dueDate: { gte: new Date(), lte: future },
        chore: { householdId, deletedAt: null },
      },
      include: { chore: true, completedByUser: true },
      orderBy: { dueDate: "asc" },
    });
  }

  async create(data: {
    choreId: string;
    dueDate: Date;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.choreOccurrence.create({ data });
  }

  async complete(id: string, completedBy: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.choreOccurrence.update({
      where: { id },
      data: { completedAt: new Date(), completedBy },
    });
  }
}

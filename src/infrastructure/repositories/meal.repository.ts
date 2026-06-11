import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class MealRepository {
  async findById(id: string) {
    return prisma.meal.findFirst({
      where: { id, deletedAt: null },
      include: { ingredients: true },
    });
  }

  async findByHousehold(householdId: string, options?: { archived?: boolean; page?: number; pageSize?: number }) {
    const where = { householdId, deletedAt: null } as any;
    if (options?.archived !== undefined) where.archived = options.archived;

    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        include: { ingredients: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.meal.count({ where }),
    ]);

    return { meals, total, page, pageSize };
  }

  async create(data: { householdId: string; name: string; preparationMinutes: number }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.meal.create({ data, include: { ingredients: true } });
  }

  async update(id: string, data: { name?: string; preparationMinutes?: number }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.meal.update({ where: { id }, data, include: { ingredients: true } });
  }

  async archive(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.meal.update({ where: { id }, data: { archived: true } });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.meal.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

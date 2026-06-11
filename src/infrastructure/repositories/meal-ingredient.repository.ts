import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class MealIngredientRepository {
  async findById(id: string) {
    return prisma.mealIngredient.findUnique({ where: { id } });
  }

  async findByMeal(mealId: string) {
    return prisma.mealIngredient.findMany({ where: { mealId } });
  }

  async create(data: { mealId: string; name: string; quantity: number; unit: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.mealIngredient.create({ data });
  }

  async update(id: string, data: { name?: string; quantity?: number; unit?: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.mealIngredient.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.mealIngredient.delete({ where: { id } });
  }

  async deleteByMeal(mealId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.mealIngredient.deleteMany({ where: { mealId } });
  }
}

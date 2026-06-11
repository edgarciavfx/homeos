import { GroceryItemSource, Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class GroceryItemRepository {
  async findById(id: string) {
    return prisma.groceryItem.findUnique({ where: { id } });
  }

  async findByGroceryList(groceryListId: string) {
    return prisma.groceryItem.findMany({
      where: { groceryListId },
      orderBy: { createdAt: "asc" },
    });
  }

  async createMany(data: {
    groceryListId: string;
    name: string;
    quantity?: number;
    unit?: string;
    category?: string;
    source: GroceryItemSource;
  }[], tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryItem.createMany({ data });
  }

  async create(data: {
    groceryListId: string;
    name: string;
    quantity?: number;
    category?: string;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryItem.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    quantity?: number;
    completed?: boolean;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryItem.update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryItem.delete({ where: { id } });
  }

  async deleteGeneratedByList(groceryListId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.groceryItem.deleteMany({
      where: { groceryListId, source: "GENERATED" },
    });
  }

  async findByListAndSource(groceryListId: string, source: GroceryItemSource) {
    return prisma.groceryItem.findMany({
      where: { groceryListId, source },
    });
  }
}

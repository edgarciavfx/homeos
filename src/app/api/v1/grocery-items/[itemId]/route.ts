import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { GroceryItemRepository } from "@/infrastructure/repositories/grocery-item.repository";

export const PATCH = protectedRoute(async (req, { params }) => {
  const { itemId } = await params;
  const body = await req.json();
  const repo = new GroceryItemRepository();
  const result = await repo.update(itemId, {
    name: body.name,
    quantity: body.quantity,
    completed: body.completed,
  });
  return ok(result);
});

export const DELETE = protectedRoute(async (_req, { params }) => {
  const { itemId } = await params;
  const repo = new GroceryItemRepository();
  await repo.delete(itemId);
  return ok({ deleted: true });
});

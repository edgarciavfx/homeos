import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { GroceryItemRepository } from "@/infrastructure/repositories/grocery-item.repository";
import { AddGroceryItemSchema } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/api/api-error";

export const POST = protectedRoute(async (req, { params }) => {
  const { listId } = await params;
  const body = await req.json();

  const parsed = AddGroceryItemSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const repo = new GroceryItemRepository();
  const item = await repo.create({
    groceryListId: listId,
    name: body.name,
    quantity: body.quantity,
    category: body.category,
  });
  return created(item);
});

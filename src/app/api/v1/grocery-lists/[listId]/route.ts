import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";

export const GET = protectedRoute(async (_req, { params }) => {
  const { listId } = await params;
  const repo = new GroceryListRepository();
  const list = await repo.findById(listId);
  return ok(list);
});

import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { GetCurrentGroceryListQuery } from "@/application/queries/groceries/get-current-grocery-list.query";

const query = new GetCurrentGroceryListQuery(new GroceryListRepository());

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const result = await query.execute(householdId);
  return ok(result);
});

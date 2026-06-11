import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { CreateMealService } from "@/application/meals/create-meal.service";

const createMealService = new CreateMealService(
  new MealRepository(),
  new HouseholdMemberRepository(),
);

export const GET = protectedRoute(async (req, { params }) => {
  const { householdId } = await params;
  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived") === "true" ? true : undefined;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const repo = new MealRepository();
  const result = await repo.findByHousehold(householdId, { archived, page, pageSize });
  return ok(result);
});

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await createMealService.execute({
    householdId,
    userId,
    name: body.name,
    preparationMinutes: body.preparationMinutes,
  });
  return created(result);
});

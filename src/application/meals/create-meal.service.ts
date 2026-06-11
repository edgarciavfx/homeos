import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { CreateMealSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";

export interface CreateMealInput {
  householdId: string;
  userId: string;
  name: string;
  preparationMinutes: number;
}

export interface CreateMealOutput {
  id: string;
  name: string;
  preparationMinutes: number;
  archived: boolean;
}

export class CreateMealService {
  constructor(
    private mealRepository: MealRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: CreateMealInput): Promise<CreateMealOutput> {
    const parsed = CreateMealSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    return transaction(async (tx) => {
      const meal = await this.mealRepository.create(
        {
          householdId: input.householdId,
          name: input.name,
          preparationMinutes: input.preparationMinutes,
        },
        tx,
      );

      return {
        id: meal.id,
        name: meal.name,
        preparationMinutes: meal.preparationMinutes,
        archived: meal.archived,
      };
    });
  }
}

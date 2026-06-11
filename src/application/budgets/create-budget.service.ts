import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { CreateBudgetSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";
import { authorize } from "@/lib/permissions/authorize";
import { Permission } from "@/lib/permissions/permission.enum";
import { HouseholdRole } from "@prisma/client";

export interface CreateBudgetInput {
  householdId: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
}

export class CreateBudgetService {
  constructor(
    private budgetRepository: BudgetRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: CreateBudgetInput) {
    const parsed = CreateBudgetSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    authorize(membership.role as HouseholdRole, Permission.BUDGET_MANAGE);

    return transaction(async (tx) => {
      return this.budgetRepository.create(
        {
          householdId: input.householdId,
          month: input.month,
          year: input.year,
          amount: input.amount,
        },
        tx,
      );
    });
  }
}

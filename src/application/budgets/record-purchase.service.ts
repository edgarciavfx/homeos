import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { RecordPurchaseSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError, NotFoundError } from "@/lib/api/api-error";
import { parseDate } from "@/lib/dates/date-utils";

export interface RecordPurchaseInput {
  budgetId: string;
  userId: string;
  amount: number;
  purchaseDate: string;
  notes?: string;
}

export class RecordPurchaseService {
  constructor(
    private purchaseRepository: PurchaseRepository,
    private budgetRepository: BudgetRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: RecordPurchaseInput) {
    const parsed = RecordPurchaseSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const budget = await this.budgetRepository.findById(input.budgetId);
    if (!budget) throw new NotFoundError("Budget not found");

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      budget.householdId,
    );
    if (!membership) throw new ForbiddenError();

    return transaction(async (tx) => {
      return this.purchaseRepository.create(
        {
          householdId: budget.householdId,
          budgetId: input.budgetId,
          amount: input.amount,
          purchaseDate: parseDate(input.purchaseDate),
          notes: input.notes,
        },
        tx,
      );
    });
  }
}

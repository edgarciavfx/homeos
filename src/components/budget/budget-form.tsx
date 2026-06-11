"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBudget } from "@/hooks/use-budgets";

const CreateBudgetFormSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2025),
  amount: z.coerce.number().positive(),
});

type CreateBudgetFormValues = z.infer<typeof CreateBudgetFormSchema>;

interface BudgetFormProps {
  householdId: string;
}

export function BudgetForm({ householdId }: BudgetFormProps) {
  const createBudget = useCreateBudget();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(CreateBudgetFormSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
    },
  });

  const onSubmit = async (values: CreateBudgetFormValues) => {
    await createBudget.mutateAsync({
      householdId,
      month: values.month,
      year: values.year,
      amount: values.amount,
    });
    reset();
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 font-medium">Set Monthly Budget</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-neutral-500">Month</label>
          <select
            {...register("month")}
            className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="mt-0.5 text-xs text-red-600">{errors.month.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Year</label>
          <input
            {...register("year")}
            type="number"
            className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
          />
          {errors.year && (
            <p className="mt-0.5 text-xs text-red-600">{errors.year.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Budget Amount ($)</label>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
          />
          {errors.amount && (
            <p className="mt-0.5 text-xs text-red-600">{errors.amount.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Create Budget"}
        </button>
        {createBudget.isError && (
          <p className="text-xs text-red-600">
            {createBudget.error instanceof Error
              ? createBudget.error.message
              : "Failed to create budget"}
          </p>
        )}
      </form>
    </div>
  );
}

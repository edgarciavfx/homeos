"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRecordPurchase } from "@/hooks/use-budgets";

const RecordPurchaseFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  notes: z.string().optional(),
});

type RecordPurchaseFormValues = z.infer<typeof RecordPurchaseFormSchema>;

interface PurchaseFormProps {
  budgetId: string;
}

export function PurchaseForm({ budgetId }: PurchaseFormProps) {
  const recordPurchase = useRecordPurchase();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordPurchaseFormValues>({
    resolver: zodResolver(RecordPurchaseFormSchema),
    defaultValues: {
      purchaseDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: RecordPurchaseFormValues) => {
    await recordPurchase.mutateAsync({
      budgetId,
      amount: values.amount,
      purchaseDate: values.purchaseDate,
      notes: values.notes || undefined,
    });
    reset();
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 font-medium">Record Purchase</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-neutral-500">Amount ($)</label>
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
        <div>
          <label className="text-xs font-medium text-neutral-500">Date</label>
          <input
            {...register("purchaseDate")}
            type="date"
            className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
          />
          {errors.purchaseDate && (
            <p className="mt-0.5 text-xs text-red-600">{errors.purchaseDate.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Notes (optional)</label>
          <input
            {...register("notes")}
            className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "Recording..." : "Record Purchase"}
        </button>
        {recordPurchase.isError && (
          <p className="text-xs text-red-600">
            {recordPurchase.error instanceof Error
              ? recordPurchase.error.message
              : "Failed to record purchase"}
          </p>
        )}
      </form>
    </div>
  );
}

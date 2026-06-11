"use client";

import { usePurchases } from "@/hooks/use-budgets";

interface PurchaseTableProps {
  budgetId: string;
}

export function PurchaseTable({ budgetId }: PurchaseTableProps) {
  const { data, isLoading } = usePurchases(budgetId);

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="font-medium">Purchases</h3>
      </div>
      {!data || data.length === 0 ? (
        <div className="p-4 text-center text-sm text-neutral-500">
          No purchases recorded yet.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-neutral-500">
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {data.map((purchase: any) => (
              <tr key={purchase.id} className="border-b last:border-0">
                <td className="px-4 py-2">
                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 font-medium">
                  ${Number(purchase.amount).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-neutral-600">
                  {purchase.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

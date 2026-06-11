"use client";

interface ShoppingProgressBarProps {
  completed: number;
  total: number;
}

export function ShoppingProgressBar({ completed, total }: ShoppingProgressBarProps) {
  if (total === 0) return null;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const barColor =
    percentage >= 75 ? "bg-green-500" : percentage >= 25 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">Shopping Progress</span>
        <span className="font-medium text-neutral-800">
          {completed} of {total} items
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-right text-xs text-neutral-500">{percentage}% complete</p>
    </div>
  );
}

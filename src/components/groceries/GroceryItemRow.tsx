"use client";

import type { GroceryItemView } from "@/types/views/grocery.view";

interface GroceryItemRowProps {
  item: GroceryItemView;
  onToggle: (itemId: string, completed: boolean) => void;
  onDelete: (itemId: string) => void;
  isPending: boolean;
}

export function GroceryItemRow({ item, onToggle, onDelete, isPending }: GroceryItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded border px-3 py-2">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggle(item.id, !item.completed)}
        disabled={isPending}
        className="h-4 w-4 rounded border-neutral-300 disabled:opacity-50"
      />
      <div className="min-w-0 flex-1">
        <span className={item.completed ? "text-sm text-neutral-400 line-through" : "text-sm"}>
          {item.name}
        </span>
        {(item.quantity || item.unit) && (
          <span className="ml-1 text-xs text-neutral-500">
            {item.quantity && <>{item.quantity} </>}
            {item.unit && <>{item.unit}</>}
          </span>
        )}
        {item.category && (
          <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
            {item.category}
          </span>
        )}
      </div>
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
          item.source === "GENERATED" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
        }`}
      >
        {item.source === "GENERATED" ? "Auto" : "Manual"}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        disabled={isPending}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

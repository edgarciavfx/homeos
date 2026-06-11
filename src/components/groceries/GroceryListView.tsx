"use client";

import { useState } from "react";
import type { GroceryListView as GroceryListViewType } from "@/types/views/grocery.view";
import {
  useGenerateGroceryList,
  useAddGroceryItem,
  useUpdateGroceryItem,
  useDeleteGroceryItem,
} from "@/hooks/use-groceries";
import { GroceryItemRow } from "./GroceryItemRow";
import { ShoppingProgressBar } from "./ShoppingProgressBar";
import { AddManualItemDialog } from "./AddManualItemDialog";

interface GroceryListViewProps {
  list: GroceryListViewType;
  weeklyPlanId: string;
}

export function GroceryListView({ list, weeklyPlanId }: GroceryListViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const generateList = useGenerateGroceryList();
  const addItem = useAddGroceryItem();
  const updateItem = useUpdateGroceryItem();
  const deleteItem = useDeleteGroceryItem();

  const allItems = [...list.generatedItems, ...list.manualItems];
  const completedCount = allItems.filter((i) => i.completed).length;

  const handleToggle = async (itemId: string, completed: boolean) => {
    await updateItem.mutateAsync({ itemId, completed });
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem.mutateAsync(itemId);
  };

  const handleGenerate = async () => {
    await generateList.mutateAsync(weeklyPlanId);
  };

  const handleAddItem = async (name: string, quantity?: number, category?: string) => {
    await addItem.mutateAsync({
      groceryListId: list.id,
      name,
      quantity,
      category,
    });
    setShowAddDialog(false);
  };

  const isPending =
    updateItem.isPending || deleteItem.isPending || generateList.isPending || addItem.isPending;

  return (
    <div className="space-y-4">
      <ShoppingProgressBar completed={completedCount} total={allItems.length} />

      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={generateList.isPending}
          className="rounded border bg-white px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
        >
          {generateList.isPending ? "Regenerating..." : "Regenerate from Meals"}
        </button>
        <button
          onClick={() => setShowAddDialog(true)}
          disabled={addItem.isPending}
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Add Manual Item
        </button>
      </div>

      {list.generatedItems.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
            From Meal Plan
          </h3>
          <div className="space-y-1">
            {list.generatedItems.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {list.manualItems.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
            Manual Items
          </h3>
          <div className="space-y-1">
            {list.manualItems.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {allItems.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-neutral-500">
            No items yet. Generate from your meal plan or add items manually.
          </p>
        </div>
      )}

      {showAddDialog && (
        <AddManualItemDialog
          onAdd={handleAddItem}
          onClose={() => setShowAddDialog(false)}
          isPending={addItem.isPending}
        />
      )}
    </div>
  );
}

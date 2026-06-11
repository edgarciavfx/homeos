"use client";

import { useState } from "react";
import { useAddIngredient, useUpdateIngredient, useDeleteIngredient } from "@/hooks/use-ingredients";
import type { IngredientView } from "@/types/views/meal.view";

interface IngredientEditorProps {
  mealId: string;
  ingredients: IngredientView[];
}

export function IngredientEditor({ mealId, ingredients }: IngredientEditorProps) {
  const addIngredient = useAddIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quantity || !unit.trim()) return;
    await addIngredient.mutateAsync({
      mealId,
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
    });
    setName("");
    setQuantity("");
    setUnit("");
  };

  const startEditing = (ingredient: IngredientView) => {
    setEditingId(ingredient.id);
    setEditName(ingredient.name);
    setEditQuantity(String(ingredient.quantity));
    setEditUnit(ingredient.unit);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim() || !editQuantity || !editUnit.trim()) return;
    await updateIngredient.mutateAsync({
      ingredientId: editingId,
      name: editName.trim(),
      quantity: Number(editQuantity),
      unit: editUnit.trim(),
    });
    setEditingId(null);
  };

  const handleDelete = async (ingredientId: string) => {
    if (confirm("Remove this ingredient?")) {
      await deleteIngredient.mutateAsync({ ingredientId, mealId });
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Ingredients</h3>

      {ingredients.length === 0 ? (
        <p className="text-sm text-neutral-500">No ingredients added yet.</p>
      ) : (
        <div className="space-y-1">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              {editingId === ingredient.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-28 rounded border px-2 py-1 text-sm"
                  />
                  <span className="text-neutral-400">x</span>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-20 rounded border px-2 py-1 text-sm"
                    step="0.25"
                    min="0.01"
                  />
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-20 rounded border px-2 py-1 text-sm"
                  />
                </div>
              ) : (
                <span>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    editingId === ingredient.id
                      ? handleSaveEdit()
                      : startEditing(ingredient)
                  }
                  className="text-xs text-neutral-600 hover:text-neutral-900"
                >
                  {editingId === ingredient.id ? "Done" : "Edit"}
                </button>
                <button
                  onClick={() => handleDelete(ingredient.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2 border-t pt-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingredient name"
          required
          className="flex-1 rounded border px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          required
          step="0.25"
          min="0.01"
          className="w-20 rounded border px-2 py-1.5 text-sm"
        />
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit"
          required
          className="w-20 rounded border px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={addIngredient.isPending || !name.trim() || !quantity || !unit.trim()}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {addIngredient.isPending ? "..." : "Add"}
        </button>
      </form>
    </div>
  );
}

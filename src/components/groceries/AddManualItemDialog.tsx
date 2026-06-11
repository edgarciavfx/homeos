"use client";

import { useState } from "react";

interface AddManualItemDialogProps {
  onAdd: (name: string, quantity?: number, category?: string) => Promise<void>;
  onClose: () => void;
  isPending: boolean;
}

export function AddManualItemDialog({ onAdd, onClose, isPending }: AddManualItemDialogProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    await onAdd(name.trim(), quantity ? Number(quantity) : undefined, category.trim() || undefined);
    setName("");
    setQuantity("");
    setCategory("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Add Item</h2>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-700">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="e.g. Milk"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Quantity</label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="e.g. 2"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="e.g. Dairy"
              disabled={isPending}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add Item"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded border px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

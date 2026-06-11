export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

export interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export function aggregateIngredients(inputs: IngredientInput[]): AggregatedIngredient[] {
  const groups = new Map<string, { name: string; quantity: number; unit: string }>();

  for (const input of inputs) {
    const key = `${input.name.toLowerCase()}|${input.unit.toLowerCase()}`;
    const existing = groups.get(key);

    if (existing) {
      existing.quantity += input.quantity;
    } else {
      groups.set(key, {
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
      });
    }
  }

  return Array.from(groups.values());
}

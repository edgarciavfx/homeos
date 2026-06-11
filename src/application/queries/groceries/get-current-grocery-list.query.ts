import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";

export interface GroceryItemView {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  completed: boolean;
  source: string;
}

export interface GroceryListView {
  id: string;
  generatedItems: GroceryItemView[];
  manualItems: GroceryItemView[];
  completionPercentage: number;
}

export class GetCurrentGroceryListQuery {
  constructor(private groceryListRepository: GroceryListRepository) {}

  async execute(householdId: string): Promise<GroceryListView | null> {
    const list = await this.groceryListRepository.findCurrentByHousehold(householdId);
    if (!list) return null;

    const items = list.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity ? Number(i.quantity) : null,
      unit: i.unit,
      category: i.category,
      completed: i.completed,
      source: i.source,
    }));

    const total = items.length;
    const completed = items.filter((i) => i.completed).length;

    return {
      id: list.id,
      generatedItems: items.filter((i) => i.source === "GENERATED"),
      manualItems: items.filter((i) => i.source === "MANUAL"),
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}

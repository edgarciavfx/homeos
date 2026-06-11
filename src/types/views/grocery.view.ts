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

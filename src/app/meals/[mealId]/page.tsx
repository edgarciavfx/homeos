export default async function MealDetailPage({ params }: { params: Promise<{ mealId: string }> }) {
  const { mealId } = await params;
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Meal</h1>
      <p className="text-sm text-neutral-500">Meal ID: {mealId}</p>
    </div>
  );
}

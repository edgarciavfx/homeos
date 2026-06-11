export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-neutral-500">Welcome to HomeOS</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Weekly Plan</h2>
          <p className="text-sm text-neutral-500">No active plan</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Upcoming Meals</h2>
          <p className="text-sm text-neutral-500">No meals scheduled</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Grocery Progress</h2>
          <p className="text-sm text-neutral-500">No grocery list</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Overdue Chores</h2>
          <p className="text-sm text-neutral-500">No overdue chores</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Budget</h2>
          <p className="text-sm text-neutral-500">No budget set</p>
        </div>
      </div>
    </div>
  );
}

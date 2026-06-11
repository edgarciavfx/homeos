export type ChoreFrequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export function computeNextDueDate(frequency: ChoreFrequency, fromDate: Date = new Date()): Date {
  const due = new Date(fromDate);
  due.setHours(0, 0, 0, 0);

  switch (frequency) {
    case "DAILY":
      due.setDate(due.getDate() + 1);
      break;
    case "WEEKLY":
      due.setDate(due.getDate() + 7);
      break;
    case "BIWEEKLY":
      due.setDate(due.getDate() + 14);
      break;
    case "MONTHLY":
      due.setMonth(due.getMonth() + 1);
      break;
  }

  return due;
}

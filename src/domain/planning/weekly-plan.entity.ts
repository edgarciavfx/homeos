export function isWithinWeek(date: Date, weekStartDate: Date): boolean {
  const start = new Date(weekStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
}

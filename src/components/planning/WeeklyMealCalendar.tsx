"use client";

import { useState } from "react";
import {
  useScheduleMeal,
  useUnscheduledMeal,
  useMealRecommendations,
  useGenerateMealRecommendations,
} from "@/hooks/use-planning";
import { MealPickerDialog } from "./MealPickerDialog";

interface ScheduledMeal {
  id: string;
  mealId: string;
  mealName: string;
  scheduledDate: Date;
}

interface WeeklyMealCalendarProps {
  planId: string;
  weekStartDate: Date;
  meals: ScheduledMeal[];
  householdId: string;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayDates(weekStart: Date): Date[] {
  const start = new Date(weekStart);
  return DAY_NAMES.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function dateToDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function WeeklyMealCalendar({
  planId,
  weekStartDate,
  meals,
  householdId,
}: WeeklyMealCalendarProps) {
  const scheduleMeal = useScheduleMeal(planId);
  const unscheduledMeal = useUnscheduledMeal();
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [showRecs, setShowRecs] = useState(false);

  const { data: recommendations } = useMealRecommendations(showRecs ? planId : null);
  const generateRecs = useGenerateMealRecommendations();

  const dayDates = getDayDates(weekStartDate);

  const getMealsForDay = (date: Date) =>
    meals.filter((m) => dateToDateString(new Date(m.scheduledDate)) === dateToDateString(date));

  const handleSchedule = async (mealId: string, dayStr: string) => {
    await scheduleMeal.mutateAsync({ mealId, scheduledDate: dayStr });
    setPickerDay(null);
  };

  const handleUnschedule = async (scheduledMealId: string) => {
    if (confirm("Remove this scheduled meal?")) {
      await unscheduledMeal.mutateAsync(scheduledMealId);
    }
  };

  const handleGenerateRecs = async () => {
    await generateRecs.mutateAsync(planId);
    setShowRecs(true);
  };

  const isPending = scheduleMeal.isPending || unscheduledMeal.isPending;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">Meal Calendar</h2>
        <button
          onClick={handleGenerateRecs}
          disabled={generateRecs.isPending}
          className="rounded border px-3 py-1 text-xs"
        >
          {generateRecs.isPending ? "Generating..." : "Get Recommendations"}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayDates.map((date) => {
          const dayStr = dateToDateString(date);
          const dayMeals = getMealsForDay(date);
          return (
            <div key={dayStr} className="rounded border p-2">
              <div className="mb-1 text-center text-xs font-medium text-neutral-600">
                {formatDayHeader(date)}
              </div>

              <div className="min-h-[80px] space-y-1">
                {dayMeals.length === 0 ? (
                  <p className="text-center text-[10px] text-neutral-400">Empty</p>
                ) : (
                  dayMeals.map((sm) => (
                    <div
                      key={sm.id}
                      className="flex items-center justify-between rounded bg-neutral-100 px-1.5 py-1"
                    >
                      <span className="text-[11px]">{sm.mealName}</span>
                      <button
                        onClick={() => handleUnschedule(sm.id)}
                        disabled={isPending}
                        className="text-[10px] text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setPickerDay(dayStr)}
                disabled={isPending}
                className="mt-1 w-full rounded border border-dashed px-1 py-0.5 text-[10px] text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
              >
                + Add Meal
              </button>
            </div>
          );
        })}
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="mt-3 rounded border bg-neutral-50 p-3">
          <h3 className="mb-1 text-xs font-medium text-neutral-700">Recommended Meals</h3>
          <div className="flex flex-wrap gap-1">
            {recommendations.map((rec) => (
              <span
                key={rec.mealId}
                className="rounded bg-white px-2 py-0.5 text-xs text-neutral-600"
              >
                {rec.mealName} <span className="text-neutral-400">({rec.score.toFixed(1)})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {pickerDay && (
        <MealPickerDialog
          householdId={householdId}
          onSelect={(mealId) => handleSchedule(mealId, pickerDay)}
          onClose={() => setPickerDay(null)}
        />
      )}
    </div>
  );
}

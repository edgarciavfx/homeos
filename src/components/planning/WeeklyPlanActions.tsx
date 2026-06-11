"use client";

import { useUpdatePlanStatus, useDeletePlan } from "@/hooks/use-planning";

interface WeeklyPlanActionsProps {
  planId: string;
  status: string;
  householdId: string;
}

export function WeeklyPlanActions({ planId, status, householdId }: WeeklyPlanActionsProps) {
  const updateStatus = useUpdatePlanStatus();
  const deletePlan = useDeletePlan();

  const handleApprove = async () => {
    await updateStatus.mutateAsync({ planId, status: "APPROVED" });
  };

  const handleUnapprove = async () => {
    await updateStatus.mutateAsync({ planId, status: "DRAFT" });
  };

  const handleDelete = async () => {
    if (confirm("Delete this weekly plan? This action cannot be undone.")) {
      await deletePlan.mutateAsync(planId);
    }
  };

  const isPending = updateStatus.isPending || deletePlan.isPending;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-medium">Plan Status</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status === "DRAFT" ? (
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="rounded bg-green-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              Approve Plan
            </button>
          ) : (
            <button
              onClick={handleUnapprove}
              disabled={isPending}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Set to Draft
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete Plan
          </button>
        </div>
      </div>

      {(updateStatus.isError || deletePlan.isError) && (
        <p className="mt-2 text-sm text-red-600">Failed to update plan status</p>
      )}
    </div>
  );
}

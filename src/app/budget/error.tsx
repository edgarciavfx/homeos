"use client";

import { PageError } from "@/components/page-error";

export default function BudgetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="Failed to load budget" />;
}

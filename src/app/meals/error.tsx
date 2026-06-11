"use client";

import { PageError } from "@/components/page-error";

export default function MealsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="Failed to load meals" />;
}

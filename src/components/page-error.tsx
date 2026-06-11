"use client";

import { useEffect } from "react";
import Link from "next/link";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function PageError({ error, reset, title = "Something went wrong" }: PageErrorProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <svg
          className="h-6 w-6 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      <p className="max-w-md text-sm text-neutral-500">{error.message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

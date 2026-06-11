import { auth } from "@/infrastructure/auth/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">HomeOS</h1>
        <p className="text-sm text-muted-foreground">Sign in to your household</p>
        <form action="/api/v1/auth/signin/email" method="POST">
          <div className="space-y-2">
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Sign in with Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

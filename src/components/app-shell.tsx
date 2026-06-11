import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold">
              HomeOS
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link href="/planning" className="text-sm text-neutral-600 hover:text-neutral-900">
                Planning
              </Link>
              <Link href="/meals" className="text-sm text-neutral-600 hover:text-neutral-900">
                Meals
              </Link>
              <Link href="/groceries" className="text-sm text-neutral-600 hover:text-neutral-900">
                Groceries
              </Link>
              <Link href="/settings" className="text-sm text-neutral-600 hover:text-neutral-900">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

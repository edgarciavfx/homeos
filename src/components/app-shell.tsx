interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-14 items-center px-4">
          <span className="font-semibold">HomeOS</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

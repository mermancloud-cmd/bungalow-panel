"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

interface MobileShellProps {
  children: React.ReactNode;
  notificationCount?: number;
}

export function MobileShell({
  children,
  notificationCount = 0,
}: MobileShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header notificationCount={notificationCount} />

      <main className="flex-1 overflow-y-auto pb-safe-nav">
        <div className="mx-auto w-full max-w-lg px-4 py-4 page-transition">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ClipboardList, ShieldAlert } from "lucide-react";
import { useOnboardingGate } from "@/hooks/use-onboarding-gate";

interface OnboardingGateProps {
  children: React.ReactNode;
}

// Protected paths that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/reservations",
  "/payments",
  "/messages",
  "/settings",
  "/analytics",
  "/ai",
  "/subscription",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Binary Gate wrapper component.
 * Wraps protected app content and enforces:
 * 1. Authentication — redirects to /login if not authenticated on protected paths
 * 2. Onboarding completion — redirects to /onboarding if wizard not finished
 *
 * Model: Elif AI is INACTIVE until onboarding_completed = true.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated, onboardingCompleted } = useOnboardingGate();

  // Redirect unauthenticated users on protected paths to login
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedPath(pathname)) {
      router.replace(`/login?reason=unauthorized&redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // While loading, show a skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  // Not authenticated on a protected path — show security screen while redirecting
  if (!isAuthenticated && isProtectedPath(pathname)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldAlert className="size-8 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Giriş Gerekli</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Bu sayfaya erişmek için giriş yapmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz…
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Yönlendiriliyor…</span>
        </div>
      </div>
    );
  }

  // Not authenticated but on a public path (e.g., root /) — render normally
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated but onboarding not complete — show gate message
  if (!onboardingCompleted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <ClipboardList className="size-8 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Kurulum Gerekli</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Elif AI&apos;ı kullanmaya başlamak için önce işletme kurulumunuzu tamamlamanız gerekiyor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Kurulum sayfasına yönlendiriliyorsunuz…</span>
        </div>
      </div>
    );
  }

  // Fully onboarded — render the app
  return <>{children}</>;
}

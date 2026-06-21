"use client";

import * as React from "react";
import { Loader2, ClipboardList } from "lucide-react";
import { useOnboardingGate } from "@/hooks/use-onboarding-gate";

interface OnboardingGateProps {
  children: React.ReactNode;
}

/**
 * Binary Gate wrapper component.
 * Wraps protected app content and enforces the onboarding wizard completion
 * before allowing access to any other page.
 *
 * Model: Elif AI is INACTIVE until onboarding_completed = true.
 * No scoring, no partial activation.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLoading, isAuthenticated, onboardingCompleted } = useOnboardingGate();

  // While loading, show a skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  // Not authenticated — let the auth layer handle redirect to /login
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated but onboarding not complete — show gate message
  // (the hook already redirected to /onboarding, but show a loading state
  // in case the redirect hasn't processed yet)
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

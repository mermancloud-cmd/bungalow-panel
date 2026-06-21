"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Binary Gate: Elif AI is INACTIVE until onboarding_completed = true.
 * This hook checks the user's onboarding status and redirects to /onboarding
 * if they haven't completed the mandatory wizard.
 *
 * Allowed paths even without onboarding: /onboarding, /login, /auth
 */

const PUBLIC_PATHS = ["/login", "/auth", "/onboarding"];
const PUBLIC_PREFIXES = ["/_next", "/api/health", "/manifest"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // Static assets
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/.test(pathname)) return true;
  return false;
}

interface OnboardingGateState {
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  tenantId: string | null;
}

export function useOnboardingGate(): OnboardingGateState {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = React.useState<OnboardingGateState>({
    isLoading: true,
    isAuthenticated: false,
    onboardingCompleted: false,
    tenantId: null,
  });

  React.useEffect(() => {
    // Skip gate for public paths
    if (isPublicPath(pathname)) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let cancelled = false;

    async function checkOnboarding() {
      try {
        const supabase = createClient();

        // Check auth
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setState({
              isLoading: false,
              isAuthenticated: false,
              onboardingCompleted: false,
              tenantId: null,
            });
          }
          return;
        }

        // Check onboarding status from tenants table
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id, onboarding_completed")
          .eq("owner_id", user.id)
          .single();

        // Also check businesses table as fallback (legacy)
        let onboardingCompleted = tenant?.onboarding_completed ?? false;
        const tenantId = tenant?.id ?? null;

        if (!tenant) {
          // Try businesses table as fallback
          const { data: business } = await supabase
            .from("businesses")
            .select("id, onboarding_completed")
            .eq("owner_id", user.id)
            .single();

          if (business) {
            onboardingCompleted = business.onboarding_completed ?? false;
          }
        }

        if (cancelled) return;

        setState({
          isLoading: false,
          isAuthenticated: true,
          onboardingCompleted,
          tenantId,
        });

        // BINARY GATE: Redirect to onboarding if not completed
        if (!onboardingCompleted && pathname !== "/onboarding") {
          router.replace("/onboarding");
        }
      } catch (err) {
        console.error("[OnboardingGate] Error checking status:", err);
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return state;
}

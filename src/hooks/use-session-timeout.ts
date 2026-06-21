"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AUTH_CONSTANTS } from "@/lib/auth-utils";

/**
 * Hook: Detects user inactivity and auto-logs out after timeout.
 * Ported from Flask's 1-hour session lifetime.
 */
export function useSessionTimeout(
  timeoutMs: number = AUTH_CONSTANTS.SESSION_INACTIVITY_TIMEOUT_MS
) {
  const router = useRouter();
  const supabase = createClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore errors during signout
    }
    router.push("/login?reason=session_expired");
  }, [router, supabase]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(handleLogout, timeoutMs);
  }, [handleLogout, timeoutMs]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    const onActivity = () => resetTimer();
    events.forEach((event) => {
      document.addEventListener(event, onActivity, { passive: true });
    });

    resetTimer();

    // Warn user 5 minutes before timeout
    const warningMs = Math.max(timeoutMs - 5 * 60 * 1000, timeoutMs * 0.9);
    const warningTimer = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= warningMs && elapsed < timeoutMs) {
        window.dispatchEvent(
          new CustomEvent("session-timeout-warning", {
            detail: { remainingMs: timeoutMs - elapsed, timeoutMs },
          })
        );
      }
    }, 30_000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(warningTimer);
      events.forEach((event) => {
        document.removeEventListener(event, onActivity);
      });
    };
  }, [resetTimer, timeoutMs]);

  return { resetTimer, handleLogout };
}
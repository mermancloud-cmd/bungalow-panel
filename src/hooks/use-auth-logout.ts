"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook: Provides a hardened logout function.
 * Clears Supabase session, all auth cookies, and redirects to login.
 */
export function useAuthLogout() {
  const router = useRouter();
  const supabase = createClient();

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Proceed with cleanup even if signOut fails
    }

    // Clear any remaining auth cookies client-side
    const authCookies = ["sb-access-token", "sb-refresh-token", "__csrf_token"];
    authCookies.forEach((name) => {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });

    router.push("/login");
  }, [router, supabase]);

  return logout;
}
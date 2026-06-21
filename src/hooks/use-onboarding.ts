"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { OnboardingStepStatus } from "@/lib/onboarding/types";

const supabase = createClient();

interface UseOnboardingReturn {
  stepStatuses: OnboardingStepStatus[];
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  completedCount: number;
  allComplete: boolean;
  businessId: string | null;
  initOnboarding: () => Promise<void>;
  completeStep: (stepNumber: number, stepData: Record<string, unknown>) => Promise<boolean>;
  checkComplete: () => Promise<boolean>;
  activateBusiness: () => Promise<boolean>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [stepStatuses, setStepStatuses] = React.useState<OnboardingStepStatus[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [businessId, setBusinessId] = React.useState<string | null>(null);

  const completedCount = React.useMemo(
    () => stepStatuses.filter((s) => s.completed).length,
    [stepStatuses]
  );

  const allComplete = completedCount === 12;

  // Get business ID from the current user session
  const getBusinessId = React.useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get the user's business
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      return business?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  // Initialize onboarding steps via RPC
  const initOnboarding = React.useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const bizId = await getBusinessId();
      if (!bizId) {
        setError("İşletme bulunamadı. Lütfen önce giriş yapın.");
        return;
      }
      setBusinessId(bizId);

      const { data, error: rpcError } = await supabase.rpc(
        "init_onboarding_steps",
        { p_business_id: bizId }
      );

      if (rpcError) {
        // If RPC doesn't exist yet, fall back to local state
        console.warn("init_onboarding_steps RPC not available:", rpcError.message);
        const fallbackStatuses: OnboardingStepStatus[] = Array.from(
          { length: 12 },
          (_, i) => ({
            stepNumber: i + 1,
            label: "",
            completed: false,
            completedAt: null,
          })
        );
        setStepStatuses(fallbackStatuses);
        return;
      }

      if (Array.isArray(data)) {
        setStepStatuses(
          data.map((row: { step_number: number; is_completed: boolean; completed_at: string | null }) => ({
            stepNumber: row.step_number,
            label: "",
            completed: row.is_completed,
            completedAt: row.completed_at,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to init onboarding:", err);
      // Fall back to local state
      const fallbackStatuses: OnboardingStepStatus[] = Array.from(
        { length: 12 },
        (_, i) => ({
          stepNumber: i + 1,
          label: "",
          completed: false,
          completedAt: null,
        })
      );
      setStepStatuses(fallbackStatuses);
    } finally {
      setIsInitializing(false);
    }
  }, [getBusinessId]);

  // Complete a single step via RPC
  const completeStep = React.useCallback(
    async (stepNumber: number, stepData: Record<string, unknown>): Promise<boolean> => {
      if (!businessId) return false;

      setIsLoading(true);
      setError(null);

      try {
        const { error: rpcError } = await supabase.rpc("complete_onboarding_step", {
          p_business_id: businessId,
          p_step_number: stepNumber,
          p_step_data: stepData,
        });

        if (rpcError) {
          console.warn("complete_onboarding_step RPC not available:", rpcError.message);
        }

        // Update local state regardless (works even if RPC isn't deployed yet)
        setStepStatuses((prev) =>
          prev.map((s) =>
            s.stepNumber === stepNumber
              ? { ...s, completed: true, completedAt: new Date().toISOString() }
              : s
          )
        );

        return true;
      } catch (err) {
        console.error("Failed to complete step:", err);
        setError(`Adım ${stepNumber} kaydedilemedi.`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [businessId]
  );

  // Check if all steps are complete
  const checkComplete = React.useCallback(async (): Promise<boolean> => {
    if (!businessId) return false;

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "check_onboarding_complete",
        { p_business_id: businessId }
      );

      if (rpcError) {
        // Fall back to local state check
        return completedCount === 12;
      }

      return data === true;
    } catch {
      return completedCount === 12;
    }
  }, [businessId, completedCount]);

  // Activate the business (final binary gate)
  // Sets onboarding_completed = true and activates WF02 for this tenant
  const activateBusiness = React.useCallback(async (): Promise<boolean> => {
    if (!businessId || !allComplete) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Try the dedicated RPC first
      const { error: rpcError } = await supabase.rpc("activate_business", {
        p_business_id: businessId,
      });

      if (rpcError) {
        console.warn("activate_business RPC not available:", rpcError.message);

        // Fallback: directly update the tenant/business record
        // Set onboarding_completed = true + timestamp
        const { error: updateError } = await supabase
          .from("tenants")
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", businessId);

        if (updateError) {
          // Try businesses table as fallback
          await supabase
            .from("businesses")
            .update({
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", businessId);
        }
      }

      // Trigger WF02 activation for this tenant
      // WF02 = Elif AI conversation workflow for the tenant
      try {
        const { error: wfError } = await supabase.rpc("activate_wf02", {
          p_tenant_id: businessId,
        });

        if (wfError) {
          console.warn("activate_wf02 RPC not available:", wfError.message);
          // Fallback: update tenant settings to enable AI
          await supabase
            .from("tenant_settings")
            .update({ ai_enabled: true, updated_at: new Date().toISOString() })
            .eq("tenant_id", businessId);
        }
      } catch (wfErr) {
        console.warn("WF02 activation fallback failed:", wfErr);
      }

      return true;
    } catch (err) {
      console.error("Failed to activate:", err);
      setError("İşletme aktifleştirilemedi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [businessId, allComplete]);

  // Auto-init on mount
  React.useEffect(() => {
    initOnboarding();
  }, [initOnboarding]);

  return {
    stepStatuses,
    isLoading,
    isInitializing,
    error,
    completedCount,
    allComplete,
    businessId,
    initOnboarding,
    completeStep,
    checkComplete,
    activateBusiness,
  };
}

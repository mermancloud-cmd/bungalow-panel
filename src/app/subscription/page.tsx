"use client";

import * as React from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PlanSelector } from "@/components/subscription/plan-selector";
import { CheckoutForm, type BuyerInfo } from "@/components/subscription/checkout-form";
import { SubscriptionStatusCard } from "@/components/subscription/subscription-status";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getPlanById } from "@/lib/subscription/plans";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Gift,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { SubscriptionPlanId } from "@/lib/iyzico/types";

type FlowStep = "status" | "plans" | "checkout" | "trial";

export default function SubscriptionPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  const [step, setStep] = React.useState<FlowStep>("status");
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlanId | null>(null);
  const [subStatus, setSubStatus] = React.useState<{
    status: string;
    plan?: string;
    trialEnd?: string;
    currentPeriodEnd?: string;
    message?: string;
    _mock?: boolean;
  } | null>(null);
  const [statusLoading, setStatusLoading] = React.useState(true);

  // Checkout state
  const [checkoutContent, setCheckoutContent] = React.useState<string | null>(null);
  const [paymentPageUrl, setPaymentPageUrl] = React.useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  // Trial state
  const [trialCode, setTrialCode] = React.useState("");
  const [trialLoading, setTrialLoading] = React.useState(false);
  const [trialMessage, setTrialMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payment result from URL params
  const [paymentResult, setPaymentResult] = React.useState<{ status: string; plan?: string; error?: string } | null>(null);

  React.useEffect(() => {
    if (!isMounted) return;

    // Check URL params for payment result
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment) {
      setPaymentResult({
        status: payment,
        plan: params.get("plan") ?? undefined,
        error: params.get("error") ?? undefined,
      });
      // Clean URL
      window.history.replaceState({}, "", "/subscription");
    }

    // Fetch current subscription status
    fetchStatus();
  }, [isMounted]);

  async function fetchStatus() {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/subscription/status?tenant_id=demo-tenant");
      if (res.ok) {
        const data = await res.json();
        setSubStatus(data);
      }
    } catch {
      // Graceful degradation
      setSubStatus({
        status: "trial",
        plan: "pro",
        trialEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
        message: "Deneme sürümü aktif.",
        _mock: true,
      });
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleInitializeCheckout(buyer: BuyerInfo) {
    if (!selectedPlan) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/subscription/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: selectedPlan,
          tenant_id: "demo-tenant", // In production, use actual tenant ID from auth
          buyer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutError(data.error ?? "Ödeme başlatılamadı.");
        return;
      }

      setCheckoutContent(data.checkoutFormContent);
      setPaymentPageUrl(data.paymentPageUrl);
    } catch {
      setCheckoutError("Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleTrialActivation() {
    if (!trialCode.trim()) return;

    setTrialLoading(true);
    setTrialMessage(null);

    try {
      // For demo purposes, simulate trial activation
      // In production, this would call the activateTrial function
      await new Promise((r) => setTimeout(r, 1500));

      if (trialCode.toUpperCase() === "BUNGALOV14") {
        setTrialMessage({
          type: "success",
          text: "🎉 Deneme süresi aktif edildi! 14 gün boyunca Profesyonel planın tüm özelliklerini ücretsiz kullanabilirsiniz.",
        });
        setSubStatus({
          status: "trial",
          plan: "pro",
          trialEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
          message: "Deneme sürümü aktif.",
          _mock: true,
        });
      } else {
        setTrialMessage({
          type: "error",
          text: "Geçersiz veya kullanılmış davet kodu. Lütfen kontrol edip tekrar deneyin.",
        });
      }
    } catch {
      setTrialMessage({
        type: "error",
        text: "Sistem hatası. Lütfen tekrar deneyin.",
      });
    } finally {
      setTrialLoading(false);
    }
  }

  if (!isMounted) return null;

  const selectedPlanData = selectedPlan ? getPlanById(selectedPlan) : null;

  return (
    <MobileShell>
      <div className="flex flex-col gap-4 pb-4">
        {/* Page header */}
        <div className="flex items-center gap-2">
          {step !== "status" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => {
                setStep("status");
                setSelectedPlan(null);
                setCheckoutContent(null);
                setPaymentPageUrl(null);
                setCheckoutError(null);
              }}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <Shield className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Abonelik</h2>
            <p className="text-xs text-muted-foreground">
              Bungalov AI yapay zeka hizmeti aboneliği
            </p>
          </div>
        </div>

        {/* Payment result banner */}
        {paymentResult && (
          <Card
            size="sm"
            className={cn(
              "ring-1",
              paymentResult.status === "success"
                ? "ring-emerald-200 dark:ring-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                : "ring-red-200 dark:ring-red-800 bg-red-50 dark:bg-red-900/20"
            )}
          >
            <CardContent>
              <div className="flex items-start gap-2">
                {paymentResult.status === "success" ? (
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {paymentResult.status === "success"
                      ? "Ödeme başarılı!"
                      : "Ödeme başarısız"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {paymentResult.status === "success"
                      ? `${paymentResult.plan} planı aktifleştirildi. İyi kullanımlar!`
                      : paymentResult.error ?? "Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Status Overview */}
        {step === "status" && (
          <>
            {/* Current subscription status */}
            {statusLoading ? (
              <Card size="sm" className="animate-pulse">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2.5 w-36 rounded bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : subStatus ? (
              <SubscriptionStatusCard
                status={subStatus.status as "none" | "trial" | "active" | "past_due" | "cancelled" | "expired"}
                planId={subStatus.plan}
                trialEnd={subStatus.trialEnd}
                currentPeriodEnd={subStatus.currentPeriodEnd}
                isMock={subStatus._mock}
              />
            ) : null}

            {/* Action cards */}
            <div className="grid gap-3">
              {/* Change/view plans */}
              <Card
                size="sm"
                className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
                onClick={() => setStep("plans")}
              >
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="size-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Planları Görüntüle</p>
                        <p className="text-[10px] text-muted-foreground">
                          Starter, Pro ve Kurumsal planları karşılaştırın
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="size-4 text-muted-foreground rotate-180" />
                  </div>
                </CardContent>
              </Card>

              {/* Trial activation */}
              <Card
                size="sm"
                className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
                onClick={() => setStep("trial")}
              >
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <Gift className="size-4.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Davet Kodu Kullan</p>
                        <p className="text-[10px] text-muted-foreground">
                          Ücretsiz deneme süresi için davet kodunuzu girin
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="size-4 text-muted-foreground rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1.5">
                <Shield className="size-3" />
                <span className="font-medium text-foreground">Abonelik Bilgisi</span>
              </p>
              <p>
                Bungalov AI yapay zeka hizmeti aylık abonelik ile çalışır.
                Ödemeler İYZİCO güvencesiyle güvenli şekilde işlenir.
              </p>
              <p className="mt-1">
                <strong>Not:</strong> Misafir rezervasyon ödemeleri IBAN/havale ile yapılır.
                Bu sayfa yalnızca AI hizmet aboneliği içindir.
              </p>
            </div>
          </>
        )}

        {/* Step: Plan Selection */}
        {step === "plans" && (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Plan Seçimi</h3>
              <p className="text-xs text-muted-foreground">
                İşletmenize uygun planı seçin. Her plan ücretsiz deneme ile başlar.
              </p>
            </div>

            <PlanSelector
              selectedPlan={selectedPlan}
              onSelect={(id) => {
                setSelectedPlan(id);
              }}
            />

            {selectedPlan && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep("checkout")}
              >
                <Shield className="size-4" />
                {selectedPlanData?.name} Plan ile Devam Et
              </Button>
            )}
          </>
        )}

        {/* Step: Checkout */}
        {step === "checkout" && selectedPlanData && (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Ödeme</h3>
              <p className="text-xs text-muted-foreground">
                {selectedPlanData.name} Plan — ₺{selectedPlanData.price.toLocaleString("tr-TR")}/ay
              </p>
            </div>

            <CheckoutForm
              planName={selectedPlanData.name}
              planPrice={selectedPlanData.price}
              checkoutFormContent={checkoutContent ?? undefined}
              paymentPageUrl={paymentPageUrl ?? undefined}
              isLoading={checkoutLoading}
              error={checkoutError}
              onInitialize={handleInitializeCheckout}
            />
          </>
        )}

        {/* Step: Trial Activation */}
        {step === "trial" && (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Gift className="size-4 text-amber-600" />
                Davet Kodu ile Deneme
              </h3>
              <p className="text-xs text-muted-foreground">
                Satış ekibimizden aldığınız davet kodunu girerek ücretsiz deneme
                sürenizi başlatın. Deneme süresi sonunda otomatik olarak ücret
                alınmaz.
              </p>
            </div>

            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                  <Sparkles className="size-5 text-blue-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-blue-800 dark:text-blue-400">
                      Davet kodu ile başlatın
                    </p>
                    <p className="text-blue-700 dark:text-blue-500 mt-0.5">
                      Deneme süresi yalnızca geçerli bir davet kodu ile aktifleştirilir.
                      Kodunuzu satış temsilcinizden alabilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trial-code" className="text-xs">Davet Kodu</Label>
                  <Input
                    id="trial-code"
                    value={trialCode}
                    onChange={(e) => setTrialCode(e.target.value.toUpperCase())}
                    placeholder="örn: BUNGALOV14"
                    className="font-mono text-center tracking-widest uppercase"
                    maxLength={20}
                  />
                </div>

                {trialMessage && (
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-lg p-3 text-xs",
                      trialMessage.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    )}
                  >
                    {trialMessage.type === "success" ? (
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    )}
                    <p>{trialMessage.text}</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!trialCode.trim() || trialLoading}
                  onClick={handleTrialActivation}
                >
                  {trialLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Kontrol ediliyor…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Denemeyi Başlat
                    </>
                  )}
                </Button>

                {/* Demo hint */}
                <div className="text-center text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[9px]">Demo</Badge>
                  <span className="ml-1.5">
                    Test için &quot;BUNGALOV14&quot; kodunu kullanabilirsiniz
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MobileShell>
  );
}

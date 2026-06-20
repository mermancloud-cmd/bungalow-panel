"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PartyPopper,
  Sparkles,
  Building2,
  MessageCircle,
  Home,
  Banknote,
  Loader2,
  LayoutDashboard,
} from "lucide-react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { StepBusinessInfo } from "@/components/onboarding/step-business-info";
import { StepWhatsApp } from "@/components/onboarding/step-whatsapp";
import { StepUnits } from "@/components/onboarding/step-units";
import { StepPricing } from "@/components/onboarding/step-pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ONBOARDING_DATA,
  type OnboardingData,
  type BusinessInfoData,
  type WhatsAppData,
  type UnitData,
  type PricingData,
} from "@/lib/onboarding/types";

const TOTAL_STEPS = 4;
const STEP_ICONS = [Building2, MessageCircle, Home, Banknote];

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = React.useState(false);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isComplete, setIsComplete] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);

  const [data, setData] = React.useState<OnboardingData>(() => ({
    ...DEFAULT_ONBOARDING_DATA,
    business: { ...DEFAULT_ONBOARDING_DATA.business },
    whatsapp: { ...DEFAULT_ONBOARDING_DATA.whatsapp },
    units: DEFAULT_ONBOARDING_DATA.units.map((u) => ({ ...u, amenities: [...u.amenities] })),
    pricing: { ...DEFAULT_ONBOARDING_DATA.pricing },
  }));

  React.useEffect(() => {
    setIsMounted(true);
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setPaymentSuccess(true);
      window.history.replaceState({}, "", "/onboarding");
    }
  }, [searchParams]);

  function handleBusinessChange(business: BusinessInfoData) {
    setData((prev) => ({ ...prev, business }));
  }

  function handleWhatsAppChange(whatsapp: WhatsAppData) {
    setData((prev) => ({ ...prev, whatsapp }));
  }

  function handleUnitsChange(units: UnitData[]) {
    setData((prev) => ({ ...prev, units }));
  }

  function handlePricingChange(pricing: PricingData) {
    setData((prev) => ({ ...prev, pricing }));
  }

  function goNext() {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleComplete();
    }
  }

  function goBack() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleComplete() {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsComplete(true);
    setCurrentStep(5);
  }

  if (!isMounted) return null;

  if (isComplete) {
    return (
      <MobileShell hideNav>
        <div className="flex flex-col gap-5 pb-8">
          <div className="flex flex-col items-center text-center py-6 space-y-3">
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
                <PartyPopper className="size-8 text-primary" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 size-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{"Kurulum Tamamland\u0131!"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {"\u0130\u015fletmeniz ba\u015far\u0131yla yap\u0131land\u0131r\u0131ld\u0131. Art\u0131k rezervasyon almaya haz\u0131rs\u0131n\u0131z."}
              </p>
            </div>
          </div>

          {paymentSuccess && (
            <Card size="sm" className="bg-emerald-50 dark:bg-emerald-950/20 ring-emerald-200 dark:ring-emerald-800">
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {"Abonelik \u00f6demesi ba\u015far\u0131yla tamamland\u0131."}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{"Kurulum \u00d6zeti"}</h3>

            <Card size="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{data.business.businessName || "\u2014"}</p>
                    <p className="text-[11px] text-muted-foreground">{data.business.city} \u00b7 {data.business.businessType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {data.whatsapp.phoneNumber ? `+90 ${data.whatsapp.phoneNumber}` : "Atland\u0131"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{data.whatsapp.instanceName || "Instance ad\u0131 belirtilmedi"}</p>
                  </div>
                  {data.whatsapp.connectionTested && (
                    <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {"Ba\u011fl\u0131"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Home className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{data.units.length} Birim</p>
                    <p className="text-[11px] text-muted-foreground">
                      {data.units.map((u) => u.name || "\u0130simsiz").join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Banknote className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{data.pricing.currency} \u00b7 %{data.pricing.depositPercentage} {"\u00f6n \u00f6deme"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Min. {data.pricing.minimumStayNights} gece {"\u00b7"} {"Giri\u015f"} {data.pricing.checkInTime} / {"\u00c7\u0131k\u0131\u015f"} {data.pricing.checkOutTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <Button size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
            <LayoutDashboard className="size-4" />
            {"G\u00f6sterge Paneline Git"}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            {"T\u00fcm ayarlar\u0131 daha sonra Ayarlar sayfas\u0131ndan de\u011fi\u015ftirebilirsiniz."}
          </p>
        </div>
      </MobileShell>
    );
  }

  const StepIcon = STEP_ICONS[currentStep - 1];

  return (
    <MobileShell hideNav>
      <div className="flex flex-col gap-5 pb-8">
        {paymentSuccess && currentStep === 1 && (
          <Card size="sm" className="bg-emerald-50 dark:bg-emerald-950/20 ring-emerald-200 dark:ring-emerald-800">
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {"\u00d6deme ba\u015far\u0131l\u0131! \u015eimdi i\u015fletmenizi yap\u0131land\u0131ral\u0131m."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <OnboardingProgress currentStep={currentStep} />

        <div className="min-h-[400px]">
          {currentStep === 1 && <StepBusinessInfo data={data.business} onChange={handleBusinessChange} />}
          {currentStep === 2 && <StepWhatsApp data={data.whatsapp} onChange={handleWhatsAppChange} />}
          {currentStep === 3 && <StepUnits data={data.units} onChange={handleUnitsChange} />}
          {currentStep === 4 && <StepPricing data={data.pricing} onChange={handlePricingChange} />}
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={goBack}
            disabled={currentStep === 1}
            className={cn(currentStep === 1 && "invisible")}
          >
            <ArrowLeft className="size-4" />
            Geri
          </Button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i + 1 === currentStep
                    ? "w-6 bg-primary"
                    : i + 1 < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          <Button size="lg" onClick={goNext} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="size-4 animate-spin" />{"Kaydediliyor..."}</>
            ) : currentStep === TOTAL_STEPS ? (
              <><CheckCircle2 className="size-4" />Tamamla</>
            ) : (
              <>{"\u0130leri"}<ArrowRight className="size-4" /></>
            )}
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Adim {currentStep} / {TOTAL_STEPS}
          {StepIcon && (
            <span className="ml-1 inline-flex items-center">
              (<StepIcon className="size-3 inline mx-0.5" />{" "}
              {["\u0130\u015fletme Bilgileri", "WhatsApp Entegrasyonu", "Konaklama Birimleri", "Fiyatland\u0131rma"][currentStep - 1]}
              )
            </span>
          )}
        </p>
      </div>
    </MobileShell>
  );
}

export default function OnboardingPage() {
  return (
    <React.Suspense
      fallback={
        <MobileShell hideNav>
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{"Y\u00fckleniyor\u2026"}</p>
          </div>
        </MobileShell>
      }
    >
      <OnboardingWizard />
    </React.Suspense>
  );
}

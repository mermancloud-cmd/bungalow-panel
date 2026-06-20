"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Clock,
  CalendarDays,
  ShieldCheck,
  Percent,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PricingData, Currency } from "@/lib/onboarding/types";

const pricingSchema = z.object({
  currency: z.enum(["TRY", "EUR", "USD"], { error: "Para birimi seçiniz" }),
  depositPercentage: z.number().min(0).max(100),
  cancellationPolicy: z.string(),
  minimumStayNights: z.number().min(1, "En az 1 gece").max(30, "En fazla 30 gece"),
  checkInTime: z.string().min(1, "Giriş saati gerekli"),
  checkOutTime: z.string().min(1, "Çıkış saati gerekli"),
});

type PricingForm = z.infer<typeof pricingSchema>;

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "TRY", label: "Türk Lirası", symbol: "₺" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "USD", label: "Amerikan Doları", symbol: "$" },
];

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

interface StepPricingProps {
  data: PricingData;
  onChange: (data: PricingData) => void;
}

export function StepPricing({ data, onChange }: StepPricingProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: data,
    mode: "onBlur",
  });

  const depositValue = watch("depositPercentage") ?? data.depositPercentage;
  const selectedCurrency = watch("currency") ?? data.currency;

  // Sync parent
  React.useEffect(() => {
    const subscription = watch((values) => {
      onChange(values as PricingData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Fiyatlandırma Kuralları</h3>
        <p className="text-xs text-muted-foreground">
          Tüm birimleriniz için geçerli olacak genel fiyatlandırma ve rezervasyon
          kurallarını belirleyin.
        </p>
      </div>

      {/* Currency selector */}
      <div className="space-y-1.5">
        <Label>Para Birimi *</Label>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCIES.map((cur) => {
            const isSelected = selectedCurrency === cur.value;
            return (
              <button
                key={cur.value}
                type="button"
                onClick={() =>
                  setValue("currency", cur.value, { shouldValidate: true })
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-2.5 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                <Banknote
                  className={cn(
                    "size-5",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {cur.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {cur.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deposit percentage slider */}
      <Card size="sm">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-primary" />
              <Label>Ön Ödeme Oranı</Label>
            </div>
            <Badge className="bg-primary/10 text-primary font-semibold text-sm px-2.5 py-0.5">
              %{depositValue}
            </Badge>
          </div>

          <Slider
            value={[depositValue]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              setValue("depositPercentage", v, { shouldValidate: true });
            }}
            min={0}
            max={100}
            step={5}
          />

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>%0 (Ön ödemesiz)</span>
            <span>%50</span>
            <span>%100 (Tam ödeme)</span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Rezervasyon sırasında misafirden alınacak ön ödeme oranı. Geri kalan
            tutar check-in sırasında tahsil edilir.
          </p>
        </CardContent>
      </Card>

      {/* Cancellation policy */}
      <div className="space-y-1.5">
        <Label htmlFor="cancellationPolicy">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            İptal Politikası
          </div>
        </Label>
        <Textarea
          id="cancellationPolicy"
          placeholder="örn: 7 gün öncesine kadar ücretsiz iptal. 3-7 gün arası %50 iade. 3 günden az süre kala iade yapılmaz."
          className="min-h-[100px]"
          {...register("cancellationPolicy")}
        />
        <p className="text-[11px] text-muted-foreground">
          Bu metin rezervasyon sayfasında misafirlere gösterilir.
        </p>
      </div>

      {/* Minimum stay */}
      <div className="space-y-1.5">
        <Label htmlFor="minimumStayNights">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            Minimum Konaklama Süresi
          </div>
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            type="button"
            onClick={() => {
              const current = watch("minimumStayNights") ?? 1;
              if (current > 1)
                setValue("minimumStayNights", current - 1, {
                  shouldValidate: true,
                });
            }}
          >
            -
          </Button>
          <Input
            id="minimumStayNights"
            type="number"
            min={1}
            max={30}
            className="w-20 text-center"
            {...register("minimumStayNights", { valueAsNumber: true })}
            aria-invalid={!!errors.minimumStayNights}
          />
          <Button
            variant="outline"
            size="icon-sm"
            type="button"
            onClick={() => {
              const current = watch("minimumStayNights") ?? 1;
              if (current < 30)
                setValue("minimumStayNights", current + 1, {
                  shouldValidate: true,
                });
            }}
          >
            +
          </Button>
          <span className="text-xs text-muted-foreground">gece</span>
        </div>
        {errors.minimumStayNights && (
          <p className="text-xs text-destructive">
            {errors.minimumStayNights.message}
          </p>
        )}
      </div>

      {/* Check-in / Check-out times */}
      <Card size="sm">
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="checkInTime">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Giriş Saati
                </div>
              </Label>
              <select
                id="checkInTime"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                {...register("checkInTime")}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkOutTime">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Çıkış Saati
                </div>
              </Label>
              <select
                id="checkOutTime"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                {...register("checkOutTime")}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


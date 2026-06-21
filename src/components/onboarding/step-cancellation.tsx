"use client";

import * as React from "react";
import { ShieldCheck, CalendarX, Percent, FileText } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CancellationData } from "@/lib/onboarding/types";

interface StepCancellationProps {
  data: CancellationData;
  onChange: (data: CancellationData) => void;
}

const POLICY_TYPES = [
  {
    value: "flexible" as const,
    label: "Esnek",
    desc: "3 gün öncesine kadar tam iade",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  {
    value: "moderate" as const,
    label: "Orta",
    desc: "7 gün öncesine kadar tam iade",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    value: "strict" as const,
    label: "Sıkı",
    desc: "14 gün öncesine kadar tam iade",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  {
    value: "custom" as const,
    label: "Özel",
    desc: "Kuralları kendiniz belirleyin",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  },
];

export function StepCancellation({ data, onChange }: StepCancellationProps) {
  function updateField<K extends keyof CancellationData>(key: K, value: CancellationData[K]) {
    onChange({ ...data, [key]: value });
  }

  function selectPolicy(type: CancellationData["policyType"]) {
    const presets: Record<string, { days: number; rules: CancellationData["refundPercentages"] }> = {
      flexible: { days: 3, rules: [{ daysBefore: 3, refundPercentage: 100 }, { daysBefore: 0, refundPercentage: 0 }] },
      moderate: { days: 7, rules: [{ daysBefore: 7, refundPercentage: 100 }, { daysBefore: 3, refundPercentage: 50 }, { daysBefore: 0, refundPercentage: 0 }] },
      strict: { days: 14, rules: [{ daysBefore: 14, refundPercentage: 100 }, { daysBefore: 7, refundPercentage: 50 }, { daysBefore: 0, refundPercentage: 0 }] },
      custom: { days: data.freeCancellationDays, rules: data.refundPercentages },
    };
    const preset = presets[type];
    onChange({
      ...data,
      policyType: type,
      freeCancellationDays: preset.days,
      refundPercentages: preset.rules,
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">İptal Politikası</h3>
        <p className="text-xs text-muted-foreground">
          Misafirlerin iptal durumunda uygulanacak iade kurallarını belirleyin.
        </p>
      </div>

      {/* Policy type selection */}
      <div className="grid grid-cols-2 gap-2">
        {POLICY_TYPES.map((type) => {
          const isSelected = data.policyType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => selectPolicy(type.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              )}
            >
              <ShieldCheck className={cn(
                "size-5",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-semibold",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {type.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {type.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Free cancellation days */}
      {data.policyType !== "custom" && (
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarX className="size-4 text-primary" />
                <Label>Ücretsiz İptal Süresi</Label>
              </div>
              <Badge className="bg-primary/10 text-primary font-semibold text-sm px-2.5 py-0.5">
                {data.freeCancellationDays} gün
              </Badge>
            </div>

            <Slider
              value={[data.freeCancellationDays]}
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val[0] : val;
                updateField("freeCancellationDays", v);
              }}
              min={1}
              max={30}
              step={1}
            />

            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 gün</span>
              <span>15 gün</span>
              <span>30 gün</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund rules table */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Percent className="size-4 text-primary" />
          <Label>İade Kuralları</Label>
        </div>

        <div className="space-y-1.5">
          {data.refundPercentages.map((rule, index) => (
            <Card key={index} size="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      {rule.daysBefore > 0
                        ? `${rule.daysBefore} gün öncesine kadar`
                        : "Son gün"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold",
                      rule.refundPercentage === 100 && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                      rule.refundPercentage === 0 && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    %{rule.refundPercentage} iade
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom policy text */}
      <div className="space-y-1.5">
        <Label htmlFor="customPolicy">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            Ek Açıklama
          </div>
        </Label>
        <Textarea
          id="customPolicy"
          placeholder="örn: Mücbir sebeplerde (doğal afet, pandemi) tam iade yapılır..."
          className="min-h-[60px]"
          value={data.customPolicy}
          onChange={(e) => updateField("customPolicy", e.target.value)}
        />
      </div>
    </div>
  );
}

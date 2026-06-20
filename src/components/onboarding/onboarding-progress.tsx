"use client";

import * as React from "react";
import {
  Building2,
  MessageCircle,
  Home,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number; // 1-4, or 5 for complete
}

const STEPS = [
  { number: 1, label: "İşletme", icon: Building2 },
  { number: 2, label: "WhatsApp", icon: MessageCircle },
  { number: 3, label: "Birimler", icon: Home },
  { number: 4, label: "Fiyatlandırma", icon: Banknote },
];

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const isComplete = currentStep >= 5;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number || isComplete;
          const isCurrent = currentStep === step.number;
          const isLast = index === STEPS.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/10"
                        : "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight max-w-[60px]",
                    isCompleted
                      ? "text-primary"
                      : isCurrent
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 mb-5 rounded-full transition-colors",
                    currentStep > step.number || isComplete
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

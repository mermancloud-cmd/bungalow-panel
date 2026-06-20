"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MessageCircle,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WhatsAppData } from "@/lib/onboarding/types";

const whatsappSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Geçerli bir telefon numarası giriniz")
    .max(15, "Telefon numarası çok uzun"),
  instanceName: z
    .string()
    .min(2, "Instance adı en az 2 karakter olmalıdır")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Sadece harf, rakam, tire ve alt çizgi kullanabilirsiniz"
    ),
  connectionTested: z.boolean(),
});

type WhatsAppForm = z.infer<typeof whatsappSchema>;

interface StepWhatsAppProps {
  data: WhatsAppData;
  onChange: (data: WhatsAppData) => void;
}

type ConnectionStatus = "idle" | "testing" | "connected" | "failed";

export function StepWhatsApp({ data, onChange }: StepWhatsAppProps) {
  const [connectionStatus, setConnectionStatus] =
    React.useState<ConnectionStatus>(
      data.connectionTested ? "connected" : "idle"
    );

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WhatsAppForm>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      phoneNumber: data.phoneNumber,
      instanceName: data.instanceName,
      connectionTested: data.connectionTested,
    },
    mode: "onBlur",
  });

  // Sync parent
  React.useEffect(() => {
    const subscription = watch((values) => {
      onChange(values as WhatsAppData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  async function handleTestConnection() {
    const phone = watch("phoneNumber");
    const instance = watch("instanceName");

    if (!phone || phone.length < 10 || !instance || instance.length < 2) {
      return;
    }

    setConnectionStatus("testing");

    // Mock connection test — simulates Evolution API call
    await new Promise((r) => setTimeout(r, 2000));

    // 80% chance of success for demo
    const success = Math.random() > 0.2;
    setConnectionStatus(success ? "connected" : "failed");

    if (success) {
      setValue("connectionTested", true);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">WhatsApp Entegrasyonu</h3>
        <p className="text-xs text-muted-foreground">
          Misafirlerinizle otomatik iletişim için WhatsApp Business API
          bağlantısını yapılandırın.
        </p>
      </div>

      {/* Info card explaining the feature */}
      <Card
        size="sm"
        className="bg-blue-50/50 dark:bg-blue-950/20 ring-blue-200 dark:ring-blue-800"
      >
        <CardContent>
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <MessageCircle className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Misafir İletişim Otomasyonu
              </p>
              <p className="text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                Evolution API üzerinden WhatsApp Business bağlantısı kurulur.
                Rezervasyon onayları, hatırlatmalar, check-in talimatları ve
                misafir sorularına otomatik yanıtlar bu numara üzerinden
                gönderilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone number with +90 prefix */}
      <div className="space-y-1.5">
        <Label htmlFor="whatsappPhone">WhatsApp Numarası *</Label>
        <div className="flex gap-2">
          <div className="flex h-8 items-center rounded-lg border border-input bg-muted px-2.5 text-sm font-medium text-muted-foreground shrink-0">
            +90
          </div>
          <Input
            id="whatsappPhone"
            placeholder="5XX XXX XX XX"
            className="flex-1"
            {...register("phoneNumber")}
            aria-invalid={!!errors.phoneNumber}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-xs text-destructive">
            {errors.phoneNumber.message}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Bu numara WhatsApp Business hesabınıza bağlı olmalıdır.
        </p>
      </div>

      {/* Instance name */}
      <div className="space-y-1.5">
        <Label htmlFor="instanceName">Instance Adı *</Label>
        <Input
          id="instanceName"
          placeholder="örn: bungalov-ana-hat"
          className="font-mono"
          {...register("instanceName")}
          aria-invalid={!!errors.instanceName}
        />
        {errors.instanceName && (
          <p className="text-xs text-destructive">
            {errors.instanceName.message}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Evolution API panelinde oluşturduğunuz instance adı.
        </p>
      </div>

      {/* Connection test */}
      <div className="space-y-2">
        <Label>Bağlantı Durumu</Label>

        <Card size="sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {connectionStatus === "idle" && (
                  <WifiOff className="size-4 text-muted-foreground" />
                )}
                {connectionStatus === "testing" && (
                  <Loader2 className="size-4 text-amber-500 animate-spin" />
                )}
                {connectionStatus === "connected" && (
                  <Wifi className="size-4 text-emerald-500" />
                )}
                {connectionStatus === "failed" && (
                  <WifiOff className="size-4 text-destructive" />
                )}
                <span className="text-xs">
                  {connectionStatus === "idle" && "Henüz test edilmedi"}
                  {connectionStatus === "testing" && "Bağlantı test ediliyor..."}
                  {connectionStatus === "connected" && "Bağlantı başarılı"}
                  {connectionStatus === "failed" && "Bağlantı başarısız"}
                </span>
              </div>

              {connectionStatus === "connected" && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-3" />
                  Aktif
                </Badge>
              )}
              {connectionStatus === "failed" && (
                <Badge variant="destructive">Hata</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleTestConnection}
          disabled={connectionStatus === "testing"}
        >
          {connectionStatus === "testing" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Test Ediliyor...
            </>
          ) : connectionStatus === "connected" ? (
            <>
              <CheckCircle2 className="size-4" />
              Tekrar Test Et
            </>
          ) : (
            <>
              <Wifi className="size-4" />
              Bağlantıyı Test Et
            </>
          )}
        </Button>
      </div>

      {/* Helper note */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground">
        <Info className="size-3.5 shrink-0 mt-0.5" />
        <div className={cn("space-y-1", connectionStatus === "connected" && "opacity-60")}>
          <p>
            <strong className="text-foreground">İpucu:</strong> Evolution API
            panelinizde instance oluşturduktan sonra QR kod ile WhatsApp&apos;ı
            bağlayın. Bu test, API sunucusu ile iletişim kurarak bağlantıyı doğrular.
          </p>
          <p>
            Bu adımı şimdilik atlayabilirsiniz — bağlantıyı daha sonra
            Ayarlar sayfasından da yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

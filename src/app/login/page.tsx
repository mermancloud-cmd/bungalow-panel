"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, ArrowRight, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isValidPhone, isValidOTP, sanitizePhone, sanitizeOTP } from "@/lib/auth-utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Show session expired message
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      setError("Oturumunuz sona erdi. L\u00fctfen tekrar giri\u015f yap\u0131n.");
    }
  }, [searchParams]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          setRateLimited(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  function formatRetryAfter(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
  }

  // ─── Step 1: Send OTP ────────────────────────────────────────────────────

  async function handleSendOTP(e: FormEvent) {
    e.preventDefault();
    setError("");

    const fullPhone = phone.startsWith("+") ? phone : `+90${phone}`;

    if (fullPhone.replace(/\D/g, "").length < 11) {
      setError("Lütfen geçerli bir telefon numarası girin.");
      return;
    }

    setLoading(true);
    try {
      const { error: supaError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (supaError) throw supaError;
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kod gönderilemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────────

  async function handleVerifyOTP(e: FormEvent) {
    e.preventDefault();
    setError("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Lütfen 6 haneli kodu girin.");
      return;
    }

    const fullPhone = phone.startsWith("+") ? phone : `+90${phone}`;

    setLoading(true);
    try {
      const { error: supaError } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: sanitizeOTP(code),
        type: "sms",
      });

      if (supaError) throw supaError;
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Doğrulama başarısız oldu."
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── OTP input handlers ──────────────────────────────────────────────────

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <span className="text-2xl font-bold">B</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bungalov
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yönetim Paneli
        </p>
      </div>

      {/* Rate Limit Banner */}
      {rateLimited && (
        <div className="mb-4 flex w-full max-w-sm items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{"\u00c7ok fazla deneme. Tekrar deneyin: "}{formatRetryAfter(retryAfter)}</span>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        {step === "phone" ? (
          <>
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Giriş Yap
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Telefon numaranızı girin, doğrulama kodu gönderelim.
            </p>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Telefon Numarası
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex h-10 items-center rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground">
                    +90
                  </span>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="5XX XXX XX XX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      }}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                      disabled={rateLimited}
                      maxLength={10}
                      autoComplete="tel-national"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || phone.length < 10 || rateLimited}
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 size-4" />
                )}
                Kod Gönder
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Doğrulama Kodu
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">0{phone}</span>{" "}
              numarasına gönderilen 6 haneli kodu girin.
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-lg border bg-background text-center text-lg font-semibold text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring",
                      digit ? "border-primary" : "border-border"
                    )}
                    aria-label={`Kod hanesi ${i + 1}`}
                    disabled={rateLimited}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || otp.join("").length < 6 || rateLimited}
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 size-4" />
                )}
                Doğrula ve Giriş Yap
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Numarayı değiştir
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Giriş yaparak{" "}
        <span className="underline">kullanım koşullarını</span> kabul etmiş
        olursunuz.
      </p>
    </div>
  );
}
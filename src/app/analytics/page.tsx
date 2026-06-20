"use client";
import * as React from "react";


import { MobileShell } from "@/components/layout/mobile-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Clock,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  MessageSquare,
  Users,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockAnalytics } from "@/lib/mock-data";

// ─── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "primary",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  accent?: "primary" | "amber" | "emerald" | "violet";
}) {
  const accentColors = {
    primary: "bg-teal-50 dark:bg-teal-900/20 text-teal-600",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-600",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("rounded-lg p-2", accentColors[accent])}>
            <Icon className="size-4" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.positive ? (
              <ArrowUpRight className="size-3 text-emerald-500" />
            ) : (
              <ArrowDownRight className="size-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              geçen haftaya göre
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────

function MiniBarChart({
  data,
  labelKey,
  valueKey,
  maxBars = 12,
  color = "bg-teal-500",
}: {
  data: { [key: string]: string | number }[];
  labelKey: string;
  valueKey: string;
  maxBars?: number;
  color?: string;
}) {
  const sliced = data.slice(-maxBars);
  const max = Math.max(...sliced.map((d) => Number(d[valueKey])));

  return (
    <div className="flex items-end gap-1 h-16">
      {sliced.map((d, i) => {
        const height = max > 0 ? (Number(d[valueKey]) / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={cn("w-full rounded-sm transition-all", color)}
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className="text-[8px] text-muted-foreground leading-none">
              {String(d[labelKey]).slice(0, 4)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Satisfaction Distribution ─────────────────────────────────────────────────

function SatisfactionDistribution({
  distribution,
}: {
  distribution: { stars: number; count: number }[];
}) {
  const total = distribution.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col gap-1.5">
      {distribution.map((d) => {
        const pct = total > 0 ? (d.count / total) * 100 : 0;
        return (
          <div key={d.stars} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-right text-muted-foreground shrink-0">
              {d.stars}★
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 text-right text-muted-foreground shrink-0">
              {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Conversion Funnel ─────────────────────────────────────────────────────────

function ConversionFunnel({
  funnel,
}: {
  funnel: { stage: string; count: number; rate: number }[];
}) {
  const maxCount = funnel[0]?.count ?? 1;

  return (
    <div className="flex flex-col gap-2">
      {funnel.map((step, i) => {
        const widthPct = (step.count / maxCount) * 100;
        const isLast = i === funnel.length - 1;

        return (
          <div key={i} className="relative">
            <div className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-right">
                <p className="text-[11px] font-medium truncate">{step.stage}</p>
              </div>
              <div className="flex-1">
                <div className="h-6 rounded bg-muted overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded transition-all flex items-center px-2",
                      isLast
                        ? "bg-emerald-500 dark:bg-emerald-600"
                        : "bg-teal-500/70 dark:bg-teal-600/70"
                    )}
                    style={{ width: `${Math.max(widthPct, 8)}%` }}
                  >
                    <span className="text-[10px] font-medium text-white whitespace-nowrap">
                      {step.count} ({step.rate}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;
  const data = mockAnalytics;

  return (
    <MobileShell>
      <div className="flex flex-col gap-4 pb-4">
        {/* Page header */}
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Analitik</h2>
            <p className="text-xs text-muted-foreground">
              AI performansı ve dönüşüm metrikleri
            </p>
          </div>
        </div>

        {/* Top metrics — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Ort. Yanıt Süresi"
            value={`${data.responseTime.avg_seconds}s`}
            subtitle={`P50: ${data.responseTime.p50_seconds}s · P95: ${data.responseTime.p95_seconds}s`}
            icon={Clock}
            trend={{ value: 8.3, positive: true }}
            accent="primary"
          />
          <MetricCard
            title="Memnuniyet Skoru"
            value={`${data.satisfaction.avg_score}`}
            subtitle={`${data.satisfaction.total_responses} yanıt`}
            icon={Star}
            trend={{ value: 4.2, positive: true }}
            accent="amber"
          />
          <MetricCard
            title="Dönüşüm Oranı"
            value={`${data.conversion.rate}%`}
            subtitle={`${data.conversion.converted}/${data.conversion.total_conversations}`}
            icon={TrendingUp}
            trend={{ value: 12.1, positive: true }}
            accent="emerald"
          />
          <MetricCard
            title="Toplam Konuşma"
            value={data.conversion.total_conversations.toString()}
            subtitle="Bu ay"
            icon={MessageSquare}
            trend={{ value: 15.4, positive: true }}
            accent="violet"
          />
        </div>

        <Separator />

        {/* Response Time Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4 text-primary" />
              Yanıt Süresi (24 Saat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={data.responseTime.trend}
              labelKey="hour"
              valueKey="seconds"
              maxBars={12}
              color="bg-teal-500 dark:bg-teal-400"
            />
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>En hızlı: {data.responseTime.p50_seconds}s</span>
              <span>En yavaş: {data.responseTime.p95_seconds}s</span>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-4 text-amber-500" />
              Memnuniyet Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {data.satisfaction.avg_score}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 5.0</p>
              </div>
              <div className="flex-1">
                <SatisfactionDistribution
                  distribution={data.satisfaction.distribution}
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Haftalık Trend
              </p>
              <MiniBarChart
                data={data.satisfaction.trend}
                labelKey="week"
                valueKey="score"
                color="bg-amber-500 dark:bg-amber-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-emerald-600" />
              Dönüşüm Hunisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionFunnel funnel={data.conversion.funnel} />
          </CardContent>
        </Card>

        {/* Conversion Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              Dönüşüm Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={data.conversion.trend}
              labelKey="week"
              valueKey="rate"
              color="bg-emerald-500 dark:bg-emerald-400"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Son 4 hafta · %12.1 artış
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  );
}

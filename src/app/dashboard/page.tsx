"use client";
import * as React from "react";


import { MobileShell } from "@/components/layout/mobile-shell";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AIStatusCard } from "@/components/dashboard/ai-status-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SubscriptionStatusCard } from "@/components/subscription/subscription-status";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, CreditCard, BarChart3, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);
  const { data } = useDashboardStats();

  // Fetch subscription status
  const [subStatus, setSubStatus] = React.useState<{
    status: string;
    plan?: string;
    trialEnd?: string;
    currentPeriodEnd?: string;
    _mock?: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (!isMounted) return;
    fetch("/api/subscription/status?tenant_id=demo-tenant")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) setSubStatus(d);
        else {
          // Graceful fallback for dev
          setSubStatus({
            status: "trial",
            plan: "pro",
            trialEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
            _mock: true,
          });
        }
      })
      .catch(() => {
        setSubStatus({
          status: "trial",
          plan: "pro",
          trialEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
          _mock: true,
        });
      });
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <MobileShell notificationCount={data?.pending_actions ?? 0}>
      <div className="flex flex-col gap-4 pb-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Gösterge</h2>
            <p className="text-xs text-muted-foreground">
              Tesislerinizin anlık durumu
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 px-2.5 py-1.5 ring-1 ring-teal-200 dark:ring-teal-800">
              <Banknote className="size-3.5 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                ₺{(data.revenue_today ?? 0).toLocaleString("tr-TR")}
              </span>
            </div>
          )}
        </div>

        {/* Summary cards — 2x2 grid */}
        <SummaryCards />

        {/* Subscription status */}
        {subStatus && (
          <SubscriptionStatusCard
            status={subStatus.status as "none" | "trial" | "active" | "past_due" | "cancelled" | "expired"}
            planId={subStatus.plan}
            trialEnd={subStatus.trialEnd}
            currentPeriodEnd={subStatus.currentPeriodEnd}
            isMock={subStatus._mock}
          />
        )}

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/payments">
            <Card size="sm" className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <CreditCard className="size-4 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium">Ödemeler</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/analytics">
            <Card size="sm" className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <BarChart3 className="size-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium">Analitik</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/subscription">
            <Card size="sm" className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/20">
                    <Shield className="size-4 text-teal-600" />
                  </div>
                  <span className="text-xs font-medium">Abonelik</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Revenue chart */}
        <RevenueChart />

        {/* AI Status + Recent Activity */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AIStatusCard />
          <RecentActivity />
        </div>
      </div>
    </MobileShell>
  );
}

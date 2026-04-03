"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversionFunnel, type FunnelDataItem } from "@/components/charts/conversion-funnel";
import { MonthlyTrends, type MonthlyTrendItem } from "@/components/charts/monthly-trends";
import { SourceAnalysis, type SourceDataItem } from "@/components/charts/source-analysis";
import { DropoffBreakdown, type DropoffDataItem } from "@/components/charts/dropoff-breakdown";
import { StaffPerformance, type StaffDataItem } from "@/components/charts/staff-performance";
import { StatusDonut, type StatusDonutItem } from "@/components/charts/status-donut";

interface AnalyticsState {
  funnel: FunnelDataItem[] | null;
  trends: MonthlyTrendItem[] | null;
  sources: SourceDataItem[] | null;
  dropoff: DropoffDataItem[] | null;
  staff: StaffDataItem[] | null;
  statusDonut: StatusDonutItem[] | null;
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] rounded bg-muted/50 animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [state, setState] = useState<AnalyticsState>({
    funnel: null,
    trends: null,
    sources: null,
    dropoff: null,
    staff: null,
    statusDonut: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [funnelRes, trendsRes, sourcesRes, dropoffRes, staffRes, dashboardRes] =
          await Promise.all([
            fetch("/api/analytics/funnel").then((r) => r.json()),
            fetch("/api/analytics/trends").then((r) => r.json()),
            fetch("/api/analytics/sources").then((r) => r.json()),
            fetch("/api/analytics/dropoff").then((r) => r.json()),
            fetch("/api/analytics/staff").then((r) => r.json()),
            fetch("/api/dashboard").then((r) => r.json()),
          ]);

        // Map funnel API -> FunnelDataItem[]
        const funnelData: FunnelDataItem[] = Array.isArray(funnelRes)
          ? funnelRes.map((s: { status: string; label: string; count: number }) => ({
              status: s.status,
              label: s.label,
              count: s.count,
            }))
          : (funnelRes.stages ?? []).map(
              (s: { status: string; label: string; currentCount?: number; count?: number }) => ({
                status: s.status,
                label: s.label,
                count: s.count ?? s.currentCount ?? 0,
              }),
            );

        // Map trends API -> MonthlyTrendItem[]
        const trendsRaw = Array.isArray(trendsRes) ? trendsRes : (trendsRes.months ?? []);
        const trendsData: MonthlyTrendItem[] = trendsRaw.map(
          (m: { month: string; newLeads?: number; newInquiries?: number; registered: number; dropped: number }) => ({
            month: m.month,
            newLeads: m.newLeads ?? m.newInquiries ?? 0,
            registered: m.registered,
            dropped: m.dropped,
          }),
        );

        // Map sources API -> SourceDataItem[]
        const sourcesData: SourceDataItem[] = (sourcesRes.sources ?? []).map(
          (s: { source: string; label: string; total: number; registered: number; conversionRate: number }) => ({
            source: s.source,
            label: s.label,
            total: s.total,
            registered: s.registered,
            conversionRate: s.conversionRate,
          }),
        );

        // Map dropoff API -> DropoffDataItem[]
        const dropoffData: DropoffDataItem[] = (dropoffRes.reasons ?? []).map(
          (r: { code?: string; reason?: string; label: string; count: number }) => ({
            reason: r.reason ?? r.code ?? "",
            label: r.label,
            count: r.count,
          }),
        );

        // Map staff API -> StaffDataItem[]
        const staffRaw = staffRes.staff ?? [];
        const staffData: StaffDataItem[] = staffRaw.map(
          (s: {
            id: string;
            name: string;
            leadsManaged?: number;
            totalLeads?: number;
            registered?: number;
            dropped?: number;
            consultationsDone?: number;
            tasksCompleted?: number;
          }) => {
            const totalLeads = s.totalLeads ?? s.leadsManaged ?? 0;
            const registered = s.registered ?? 0;
            const dropped = s.dropped ?? 0;
            const conversionRate = totalLeads > 0 ? Math.round((registered / totalLeads) * 100) : 0;
            return {
              userId: s.id,
              name: s.name,
              totalLeads,
              registered,
              dropped,
              conversionRate,
            };
          },
        );

        // Map dashboard statusCounts -> StatusDonutItem[]
        const statusLabels: Record<string, string> = {
          NEW_INQUIRY: "신규문의",
          INITIAL_CONSULT: "초기상담",
          CONSULTING: "상담중",
          IN_PROGRESS: "상담진행",
          TRIAL_BOOKED: "체험예약",
          TRIAL_DONE: "체험완료",
          REGISTERED: "등록완료",
          DROPPED: "이탈",
          ON_HOLD: "보류",
        };
        const statusCounts: Record<string, number> = dashboardRes.statusCounts ?? {};
        const statusDonutData: StatusDonutItem[] = Object.entries(statusCounts).map(
          ([status, count]) => ({
            status,
            label: statusLabels[status] ?? status,
            count: count as number,
          }),
        );

        setState({
          funnel: funnelData,
          trends: trendsData,
          sources: sourcesData,
          dropoff: dropoffData,
          staff: staffData,
          statusDonut: statusDonutData,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">분석 대시보드</h1>
        <p className="text-muted-foreground text-sm">
          전환 퍼널, 트렌드, 경로 분석으로 데이터 기반 의사결정
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Conversion Funnel */}
        {loading || !state.funnel ? (
          <SkeletonCard />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">전환 퍼널</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversionFunnel data={state.funnel} />
            </CardContent>
          </Card>
        )}

        {/* 2. Monthly Trends */}
        {loading || !state.trends ? (
          <SkeletonCard />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">월별 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrends data={state.trends} />
            </CardContent>
          </Card>
        )}

        {/* 3. Source Analysis */}
        {loading || !state.sources ? (
          <SkeletonCard />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">문의 경로 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <SourceAnalysis data={state.sources} />
            </CardContent>
          </Card>
        )}

        {/* 4. Dropoff Breakdown */}
        {loading || !state.dropoff ? (
          <SkeletonCard />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">이탈 사유 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <DropoffBreakdown data={state.dropoff} />
            </CardContent>
          </Card>
        )}

        {/* 5. Staff Performance */}
        {loading || !state.staff ? (
          <SkeletonCard />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">직원별 성과</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffPerformance data={state.staff} />
            </CardContent>
          </Card>
        )}

        {/* 6. Status Donut */}
        {loading || !state.statusDonut ? (
          <SkeletonCard />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">상태 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDonut data={state.statusDonut} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

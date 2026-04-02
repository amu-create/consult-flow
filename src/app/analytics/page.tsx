"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversionFunnel } from "@/components/charts/conversion-funnel";
import { MonthlyTrends } from "@/components/charts/monthly-trends";
import { SourceAnalysis } from "@/components/charts/source-analysis";
import { DropoffBreakdown } from "@/components/charts/dropoff-breakdown";
import { StaffPerformance } from "@/components/charts/staff-performance";
import { StatusDonut } from "@/components/charts/status-donut";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Clock, Target, Users, Download, Calendar } from "lucide-react";

interface AnalyticsData {
  funnel: { stages: Array<{ status: string; label: string; currentCount: number; totalReached: number }> };
  trends: { months: Array<{ month: string; label: string; newInquiries: number; registered: number; dropped: number }> };
  sources: { sources: Array<{ source: string; label: string; total: number; registered: number; conversionRate: number }> };
  dropoff: { reasons: Array<{ code: string; label: string; count: number }>; totalDropped: number };
  staff: { staff: Array<{ id: string; name: string; role: string; leadsManaged: number; tasksCompleted: number; consultationsDone: number }> };
  conversionTime: { averageDays: number; medianDays: number; fastest: number; slowest: number; count: number };
  statusCounts: Record<string, number>;
}

function getDefaultDates() {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - 5, 1);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

const PRESETS = [
  { label: "최근 1개월", months: 1 },
  { label: "최근 3개월", months: 3 },
  { label: "최근 6개월", months: 6 },
  { label: "전체", months: 0 },
];

export default function AnalyticsPage() {
  const defaults = getDefaultDates();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);

  const fetchData = useCallback((from: string, to: string) => {
    const qs = from && to ? `?from=${from}&to=${to}` : "";
    Promise.all([
      fetch(`/api/analytics/funnel${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/trends${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/sources${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/dropoff${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/staff${qs}`).then((r) => r.json()),
      fetch(`/api/analytics/conversion-time${qs}`).then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]).then(([funnel, trends, sources, dropoff, staff, conversionTime, dashboard]) => {
      setData({
        funnel,
        trends,
        sources,
        dropoff,
        staff,
        conversionTime,
        statusCounts: dashboard.statusCounts,
      });
    });
  }, []);

  useEffect(() => {
    fetchData(fromDate, toDate);
  }, [fetchData, fromDate, toDate]);

  function applyPreset(months: number) {
    if (months === 0) {
      setFromDate("");
      setToDate("");
      fetchData("", "");
      return;
    }
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - months + 1, 1);
    const f = from.toISOString().split("T")[0];
    const t = to.toISOString().split("T")[0];
    setFromDate(f);
    setToDate(t);
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">분석</h1>
          <p className="text-muted-foreground text-sm">
            전환 퍼널, 트렌드, 경로 분석으로 데이터 기반 의사결정
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export/leads" download>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              리드 CSV
            </Button>
          </a>
          <a href="/api/export/consultations" download>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              상담 CSV
            </Button>
          </a>
        </div>
      </div>

      {/* Date filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">기간</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <span className="text-muted-foreground text-sm">~</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-36 h-8 text-sm"
              />
            </div>
            <div className="flex gap-1">
              {PRESETS.map((p) => (
                <Button
                  key={p.months}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => applyPreset(p.months)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">평균 전환 소요일</p>
                <p className="text-2xl font-bold">{data.conversionTime.averageDays}일</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">중간값 전환일</p>
                <p className="text-2xl font-bold">{data.conversionTime.medianDays}일</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">최단 전환</p>
                <p className="text-2xl font-bold">{data.conversionTime.fastest}일</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">전환 완료</p>
                <p className="text-2xl font-bold">{data.conversionTime.count}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">전환 퍼널</CardTitle></CardHeader>
          <CardContent><ConversionFunnel stages={data.funnel.stages} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">월별 트렌드</CardTitle></CardHeader>
          <CardContent><MonthlyTrends months={data.trends.months} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">문의 경로 분석</CardTitle></CardHeader>
          <CardContent><SourceAnalysis sources={data.sources.sources} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">이탈 사유 분석</CardTitle></CardHeader>
          <CardContent><DropoffBreakdown reasons={data.dropoff.reasons} totalDropped={data.dropoff.totalDropped} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">직원별 성과</CardTitle></CardHeader>
          <CardContent><StaffPerformance staff={data.staff.staff} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">상태 분포</CardTitle></CardHeader>
          <CardContent>
            <StatusDonut statusCounts={data.statusCounts} />
            <div className="grid grid-cols-2 gap-1 mt-3">
              {Object.entries(data.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-xs px-2 py-1">
                  <span className="text-muted-foreground">
                    {status === "NEW_INQUIRY" ? "신규문의" :
                     status === "INITIAL_CONSULT" ? "초기상담" :
                     status === "IN_PROGRESS" ? "상담진행" :
                     status === "TRIAL_BOOKED" ? "체험예약" :
                     status === "TRIAL_DONE" ? "체험완료" :
                     status === "REGISTERED" ? "등록완료" :
                     status === "DROPPED" ? "이탈" :
                     status === "ON_HOLD" ? "보류" : status}
                  </span>
                  <span className="font-medium">{count}명</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

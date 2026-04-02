"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { InterestBadge } from "@/components/interest-badge";
import { StatusDonut } from "@/components/charts/status-donut";
import { TASK_TYPES } from "@/lib/constants";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  AlertTriangle,
  Clock,
  Flame,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface DashboardData {
  summary: {
    totalLeads: number;
    newThisMonth: number;
    registeredThisMonth: number;
    droppedThisMonth: number;
    conversionRate: number;
    avgConversionDays: number;
    weeklyConsultations: number;
    weeklyTasksCompleted: number;
  };
  todayTasks: Array<{
    id: string;
    taskType: string;
    description: string;
    dueDate: string;
    lead: { id: string; studentName: string; status: string };
    assignee: { id: string; name: string };
  }>;
  overdueTasks: Array<{
    id: string;
    taskType: string;
    description: string;
    dueDate: string;
    lead: { id: string; studentName: string; status: string };
    assignee: { id: string; name: string };
  }>;
  neglectedLeads: Array<{
    id: string;
    studentName: string;
    status: string;
    updatedAt: string;
    assignedUser: { id: string; name: string } | null;
  }>;
  hotLeads: Array<{
    id: string;
    studentName: string;
    status: string;
    interestScore: number;
    assignedUser: { id: string; name: string } | null;
  }>;
  statusCounts: Record<string, number>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm">이번 달 상담 현황</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-50 p-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">전체 리드</p>
                <p className="text-xl font-bold">{summary.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-sky-50 p-2">
                <UserPlus className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">이번달 문의</p>
                <p className="text-xl font-bold">{summary.newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-green-50 p-2">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">등록</p>
                <p className="text-xl font-bold">{summary.registeredThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-50 p-2">
                <UserX className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">이탈</p>
                <p className="text-xl font-bold">{summary.droppedThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-emerald-50 p-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">전환율</p>
                <p className="text-xl font-bold">{summary.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Donut + Weekly Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">상태 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonut statusCounts={data.statusCounts} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">핵심 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">{summary.avgConversionDays}</p>
                <p className="text-xs text-blue-600 mt-1">평균 전환 소요일</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-3xl font-bold text-green-700">{summary.weeklyConsultations}</p>
                <p className="text-xs text-green-600 mt-1">이번 주 상담</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <p className="text-3xl font-bold text-orange-700">{summary.weeklyTasksCompleted}</p>
                <p className="text-xs text-orange-600 mt-1">이번 주 완료 태스크</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today Tasks + Overdue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              오늘 할 일
              {data.todayTasks.length > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {data.todayTasks.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.overdueTasks.length > 0 && (
              <div className="mb-3 rounded-md bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700 mb-2">
                  기한 초과 ({data.overdueTasks.length}건)
                </p>
                {data.overdueTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/leads/${task.lead.id}`}
                    className="flex items-center justify-between py-1 text-sm hover:underline"
                  >
                    <span className="text-red-800">
                      {task.lead.studentName} - {task.description}
                    </span>
                    <span className="text-xs text-red-500">
                      {formatDistanceToNow(new Date(task.dueDate), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {data.todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                오늘 예정된 할 일이 없습니다
              </p>
            ) : (
              data.todayTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/leads/${task.lead.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{task.lead.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {TASK_TYPES[task.taskType as keyof typeof TASK_TYPES] ?? task.taskType} -{" "}
                      {task.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.assignee.name}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Neglected Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              방치 리드
              {data.neglectedLeads.length > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {data.neglectedLeads.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.neglectedLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                방치된 리드가 없습니다
              </p>
            ) : (
              data.neglectedLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {lead.studentName}
                    </span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.updatedAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-red-500" />
              등록 임박 리드
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.hotLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                관심도 높은 리드가 없습니다
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {data.hotLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {lead.studentName}
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                    <InterestBadge score={lead.interestScore} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

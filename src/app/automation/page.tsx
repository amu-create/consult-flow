"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, AlertTriangle, Clock, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Reminder {
  leadId: string;
  studentName: string;
  parentPhone: string;
  trialDate: string;
  message: string;
}

interface UnattendedAlert {
  leadId: string;
  studentName: string;
  status: string;
  daysSinceContact: number;
  assignedTo: string | null;
}

interface SpecialDateAlert {
  leadId: string;
  studentName: string;
  alertType: string;
  message: string;
  daysSinceCreated: number;
}

const STATUS_LABELS: Record<string, string> = {
  NEW_INQUIRY: "신규문의",
  INITIAL_CONSULT: "초기상담",
  IN_PROGRESS: "상담진행",
  CONSULTING: "상담중",
  TRIAL_BOOKED: "체험예약",
  TRIAL_DONE: "체험완료",
  REGISTERED: "등록완료",
  DROPPED: "이탈",
  ON_HOLD: "보류",
};

function getDaysColor(days: number): string {
  if (days >= 7) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (days >= 5) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
}

export default function AutomationPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unattended, setUnattended] = useState<UnattendedAlert[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDateAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [remindersRes, unattendedRes, specialRes] = await Promise.all([
          fetch("/api/automation/reminders"),
          fetch("/api/automation/unattended"),
          fetch("/api/automation/special-dates"),
        ]);

        if (remindersRes.ok) {
          const data = await remindersRes.json();
          setReminders(data.reminders ?? []);
        }
        if (unattendedRes.ok) {
          const data = await unattendedRes.json();
          setUnattended(data.alerts ?? []);
        }
        if (specialRes.ok) {
          const data = await specialRes.json();
          setSpecialDates(data.alerts ?? []);
        }
      } catch {
        toast.error("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">자동화 &amp; 알림</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Trial Reminders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-500" />
              내일 체험 수업
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">없음</p>
            ) : (
              <ul className="space-y-3">
                {reminders.map((r) => (
                  <li key={r.leadId} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/leads/${r.leadId}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {r.studentName}
                      </Link>
                      <span className="text-xs text-muted-foreground">{r.parentPhone}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      체험일: {new Date(r.trialDate).toLocaleDateString("ko-KR")}
                    </p>
                    <button
                      onClick={() => toast.success(`${r.studentName} 학부모님께 문자 발송 예정`)}
                      className="w-full text-xs bg-primary text-primary-foreground rounded-md py-1.5 hover:bg-primary/90 transition-colors"
                    >
                      문자 발송
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Unattended Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              장기 미응대 리드
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unattended.length === 0 ? (
              <p className="text-sm text-muted-foreground">없음</p>
            ) : (
              <ul className="space-y-3">
                {unattended.map((a) => (
                  <li key={a.leadId} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/leads/${a.leadId}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {a.studentName}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {STATUS_LABELS[a.status] ?? a.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs border-0 ${getDaysColor(a.daysSinceContact)}`}>
                        {a.daysSinceContact}일 미응대
                      </Badge>
                      {a.assignedTo && (
                        <span className="text-xs text-muted-foreground">담당: {a.assignedTo}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Special Dates / Follow-up Needed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-purple-500" />
              관심 필요 리드
            </CardTitle>
          </CardHeader>
          <CardContent>
            {specialDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">없음</p>
            ) : (
              <ul className="space-y-3">
                {specialDates.map((s) => (
                  <li key={s.leadId} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/leads/${s.leadId}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {s.studentName}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {s.daysSinceCreated}일 경과
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

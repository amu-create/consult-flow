"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ReEnrollmentLead {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  parentPhone: string;
  registeredDate: string;
  daysSinceRegistration: number;
  assignedUser: { id: string; name: string } | null;
}

function urgencyColor(days: number): string {
  if (days >= 90) return "text-red-600 dark:text-red-400";
  if (days >= 60) return "text-orange-600 dark:text-orange-400";
  return "text-green-600 dark:text-green-400";
}

function urgencyBg(days: number): string {
  if (days >= 90) return "bg-red-50 dark:bg-red-950/30";
  if (days >= 60) return "bg-orange-50 dark:bg-orange-950/30";
  return "bg-green-50 dark:bg-green-950/30";
}

function maskPhone(phone: string): string {
  if (phone.length >= 8) {
    return phone.slice(0, phone.length - 4).replace(/./g, "*") + phone.slice(-4);
  }
  return phone;
}

export default function ReEnrollmentPage() {
  const [leads, setLeads] = useState<ReEnrollmentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads/re-enrollment")
      .then((r) => r.json())
      .then((data) => {
        setLeads(data.leads ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">재등록 관리</h1>
        <p className="text-muted-foreground text-sm">
          등록 후 60일 이상 경과한 학생 목록 (재등록 상담 필요)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            재등록 대상
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground">
                총 {leads.length}명
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              로딩 중...
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              현재 재등록 대상이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">학생명</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">학년</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">과목</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">연락처</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">등록일</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">경과일수</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">담당자</th>
                    <th className="pb-2 font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className={`border-b last:border-0 ${urgencyBg(lead.daysSinceRegistration)}`}>
                      <td className="py-3 pr-4 font-medium">{lead.studentName}</td>
                      <td className="py-3 pr-4">{lead.grade}</td>
                      <td className="py-3 pr-4">{lead.subject}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{maskPhone(lead.parentPhone)}</td>
                      <td className="py-3 pr-4">
                        {new Date(lead.registeredDate).toLocaleDateString("ko-KR")}
                      </td>
                      <td className={`py-3 pr-4 font-semibold ${urgencyColor(lead.daysSinceRegistration)}`}>
                        {lead.daysSinceRegistration}일
                      </td>
                      <td className="py-3 pr-4">
                        {lead.assignedUser?.name ?? "-"}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex items-center rounded-md bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                        >
                          재등록 상담
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

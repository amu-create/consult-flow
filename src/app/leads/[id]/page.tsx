"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { InterestBadge } from "@/components/interest-badge";
import { ConsultationForm } from "@/components/consultation-form";
import { ConsultationTimeline } from "@/components/consultation-timeline";
import { TaskList } from "@/components/task-list";
import { StatusChangeModal } from "@/components/status-change-modal";
import { DropOffModal } from "@/components/drop-off-modal";
import { LeadEditModal } from "@/components/lead-edit-modal";
import {
  CHANNELS,
  INQUIRY_SOURCES,
  DROP_OFF_REASONS,
  STATUS_LABELS,
  type LeadStatus,
} from "@/lib/constants";
import { getNextStatuses } from "@/lib/status-machine";
import { ArrowLeft, Edit2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface LeadDetail {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  parentName: string | null;
  parentPhone: string;
  parentRelation: string | null;
  inquirySource: string;
  status: string;
  interestScore: number;
  competitorInfo: string | null;
  currentLevel: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser: { id: string; name: string } | null;
  consultations: Array<{
    id: string;
    channel: string;
    content: string;
    interestSignals: string | null;
    createdAt: string;
    creator: { id: string; name: string };
    task: {
      id: string;
      taskType: string;
      description: string;
      dueDate: string;
      status: string;
    } | null;
  }>;
  tasks: Array<{
    id: string;
    taskType: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    completedAt: string | null;
    assignee: { id: string; name: string };
  }>;
  statusLogs: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    reason: string | null;
    createdAt: string;
    changer: { id: string; name: string };
  }>;
  dropOffReason: {
    reasons: string;
    detailMemo: string | null;
    canRetry: boolean;
  } | null;
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDropOff, setShowDropOff] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const fetchLead = useCallback(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then(setLead);
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(lead.status);
  const canDrop = nextStatuses.includes("DROPPED");
  const nonDropStatuses = nextStatuses.filter((s) => s !== "DROPPED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/leads"
            className="inline-flex items-center justify-center rounded-lg h-8 w-8 shrink-0 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold whitespace-nowrap">{lead.studentName}</h1>
              <StatusBadge status={lead.status} />
              <InterestBadge score={lead.interestScore} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {lead.grade} / {lead.subject} / 담당:{" "}
              {lead.assignedUser?.name ?? "미배정"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {nonDropStatuses.length > 0 && (
            <Button variant="outline" onClick={() => setShowStatusModal(true)}>
              상태 변경
            </Button>
          )}
          {canDrop && (
            <Button
              variant="destructive"
              onClick={() => setShowDropOff(true)}
            >
              이탈 처리
            </Button>
          )}
        </div>
      </div>

      {/* Drop-off reason if dropped */}
      {lead.status === "DROPPED" && lead.dropOffReason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium text-red-800 mb-1">이탈 사유</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {(JSON.parse(lead.dropOffReason.reasons) as string[]).map((r) => (
                <span
                  key={r}
                  className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                >
                  {DROP_OFF_REASONS[r as keyof typeof DROP_OFF_REASONS] ?? r}
                </span>
              ))}
            </div>
            {lead.dropOffReason.detailMemo && (
              <p className="text-xs text-red-600">
                {lead.dropOffReason.detailMemo}
              </p>
            )}
            {lead.dropOffReason.canRetry && (
              <p className="text-xs text-orange-600 mt-1">재연락 가능</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs - default to timeline */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">상담 타임라인</TabsTrigger>
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="tasks">다음 액션</TabsTrigger>
          <TabsTrigger value="history">상태 이력</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowConsultForm(true)}>
              <Edit2 className="h-4 w-4 mr-1" />
              상담 기록 추가
            </Button>
          </div>
          <ConsultationTimeline consultations={lead.consultations} />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit2 className="h-4 w-4 mr-1" />
              정보 수정
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">학생 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="이름" value={lead.studentName} />
                <InfoRow label="학년" value={lead.grade} />
                <InfoRow label="과목" value={lead.subject} />
                <InfoRow label="현재 수준" value={lead.currentLevel ?? "-"} />
                <InfoRow
                  label="경쟁 학원"
                  value={lead.competitorInfo ?? "-"}
                />
                <InfoRow label="메모" value={lead.memo ?? "-"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">학부모 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="이름" value={lead.parentName ?? "-"} />
                <InfoRow label="연락처" value={lead.parentPhone} />
                <InfoRow label="관계" value={lead.parentRelation ?? "-"} />
                <InfoRow
                  label="문의 경로"
                  value={
                    INQUIRY_SOURCES[
                      lead.inquirySource as keyof typeof INQUIRY_SOURCES
                    ] ?? lead.inquirySource
                  }
                />
                <InfoRow
                  label="등록일"
                  value={new Date(lead.createdAt).toLocaleDateString("ko-KR")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <TaskList tasks={lead.tasks} onUpdate={fetchLead} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {/* Drop-off reason card */}
          {lead.dropOffReason && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-800">이탈 사유</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(JSON.parse(lead.dropOffReason.reasons) as string[]).map((r) => (
                    <span key={r} className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-700">
                      {DROP_OFF_REASONS[r as keyof typeof DROP_OFF_REASONS] ?? r}
                    </span>
                  ))}
                </div>
                {lead.dropOffReason.detailMemo && (
                  <p className="text-muted-foreground">{lead.dropOffReason.detailMemo}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  재시도 가능: {lead.dropOffReason.canRetry ? "예" : "아니오"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Activity summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{lead.consultations.length}</p>
              <p className="text-xs text-muted-foreground">상담 횟수</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{lead.tasks.filter(t => t.status === "COMPLETED").length}</p>
              <p className="text-xs text-muted-foreground">완료 태스크</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{lead.statusLogs.length}</p>
              <p className="text-xs text-muted-foreground">상태 변경</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-4">
              {lead.statusLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  상태 변경 이력이 없습니다
                </p>
              ) : (
                <div className="space-y-3">
                  {lead.statusLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 text-sm border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge status={log.fromStatus} />
                        <span className="text-muted-foreground">→</span>
                        <StatusBadge status={log.toStatus} />
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">
                          {log.changer.name} /{" "}
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                        {log.reason && (
                          <p className="text-xs text-muted-foreground">
                            {log.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ConsultationForm
        open={showConsultForm}
        onOpenChange={setShowConsultForm}
        leadId={lead.id}
        onSuccess={fetchLead}
      />
      <StatusChangeModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        leadId={lead.id}
        currentStatus={lead.status}
        onSuccess={fetchLead}
      />
      <DropOffModal
        open={showDropOff}
        onOpenChange={setShowDropOff}
        leadId={lead.id}
        onSuccess={() => {
          fetchLead();
          setShowDropOff(false);
        }}
      />
      <LeadEditModal
        open={showEdit}
        onOpenChange={setShowEdit}
        lead={lead}
        onSuccess={fetchLead}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

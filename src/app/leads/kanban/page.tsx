"use client";

import { useEffect, useState, useCallback } from "react";
import { STATUS_LABELS, type LeadStatus } from "@/lib/constants";
import { isValidTransition } from "@/lib/status-machine";
import { toast } from "sonner";
import Link from "next/link";

const KANBAN_COLUMNS: LeadStatus[] = [
  "NEW_INQUIRY",
  "INITIAL_CONSULT",
  "IN_PROGRESS",
  "TRIAL_BOOKED",
  "TRIAL_DONE",
  "REGISTERED",
];

const COLUMN_COLORS: Record<string, { bg: string; border: string; header: string; badge: string }> = {
  NEW_INQUIRY: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", header: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" },
  INITIAL_CONSULT: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", header: "text-blue-700 dark:text-blue-300", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  IN_PROGRESS: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", header: "text-blue-700 dark:text-blue-300", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  TRIAL_BOOKED: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", header: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  TRIAL_DONE: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", header: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  REGISTERED: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", header: "text-green-700 dark:text-green-300", badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

interface Lead {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  parentPhone: string;
  status: string;
  interestScore: number;
  assignedUser: { id: string; name: string } | null;
}

function maskPhone(phone: string): string {
  return "****-" + phone.slice(-4);
}

function InterestBar({ score }: { score: number }) {
  const maxScore = 10;
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const color =
    score >= 7 ? "bg-red-500" : score >= 4 ? "bg-amber-500" : "bg-blue-400";
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchLeads = useCallback(() => {
    fetch("/api/leads?pageSize=200&page=1")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : data.leads ?? []));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedId(leadId);
  }

  function handleDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    setDragOverCol(status);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  async function handleDrop(e: React.DragEvent, toStatus: string) {
    e.preventDefault();
    setDragOverCol(null);
    const leadId = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === toStatus) {
      setDraggedId(null);
      return;
    }

    if (!isValidTransition(lead.status, toStatus)) {
      toast.error(
        `${STATUS_LABELS[lead.status as LeadStatus]} → ${STATUS_LABELS[toStatus as LeadStatus]} 전환은 허용되지 않습니다`
      );
      setDraggedId(null);
      return;
    }

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: toStatus } : l))
    );

    const res = await fetch(`/api/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toStatus,
        changedBy: lead.assignedUser?.id ?? "",
      }),
    });

    if (res.ok) {
      toast.success("상태가 변경되었습니다");
    } else {
      const err = await res.json();
      toast.error(err.error || "상태 변경 실패");
      fetchLeads(); // revert
    }

    setDraggedId(null);
  }

  // Group leads by status, exclude DROPPED and ON_HOLD from main board
  const grouped: Record<string, Lead[]> = {};
  for (const col of KANBAN_COLUMNS) {
    grouped[col] = [];
  }
  for (const lead of leads) {
    if (grouped[lead.status]) {
      grouped[lead.status].push(lead);
    }
  }

  const droppedCount = leads.filter((l) => l.status === "DROPPED").length;
  const onHoldCount = leads.filter((l) => l.status === "ON_HOLD").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">파이프라인</h1>
        <p className="text-muted-foreground text-sm">
          드래그하여 상태 변경 / 이탈 {droppedCount}건, 보류 {onHoldCount}건
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
        {KANBAN_COLUMNS.map((status) => {
          const col = grouped[status];
          const isDragOver = dragOverCol === status;
          const draggedLead = draggedId
            ? leads.find((l) => l.id === draggedId)
            : null;
          const canDrop =
            draggedLead && draggedLead.status !== status
              ? isValidTransition(draggedLead.status, status)
              : false;
          const colors = COLUMN_COLORS[status] ?? COLUMN_COLORS.NEW_INQUIRY;

          return (
            <div
              key={status}
              className={`flex-shrink-0 w-64 rounded-lg border-2 transition-colors ${
                isDragOver && canDrop
                  ? "border-primary bg-primary/5"
                  : isDragOver && !canDrop
                    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                    : `${colors.border} ${colors.bg}`
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${colors.header}`}>
                    {STATUS_LABELS[status as LeadStatus]}
                  </span>
                  <span className={`ml-auto text-xs font-medium rounded-full px-2 py-0.5 ${colors.badge}`}>
                    {col.length}
                  </span>
                </div>
              </div>
              <div className="p-2 pt-0 space-y-2 min-h-[100px]">
                {col.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <Link href={`/leads/${lead.id}`} className="block space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{lead.studentName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {maskPhone(lead.parentPhone)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lead.grade} / {lead.subject}
                      </p>
                      <InterestBar score={lead.interestScore} />
                      {lead.assignedUser && (
                        <p className="text-xs text-muted-foreground">
                          담당: {lead.assignedUser.name}
                        </p>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

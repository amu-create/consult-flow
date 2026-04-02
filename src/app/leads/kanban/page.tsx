"use client";

import { useEffect, useState, useCallback } from "react";
import { KanbanCard } from "@/components/kanban-card";
import { STATUS_LABELS, type LeadStatus } from "@/lib/constants";
import { isValidTransition } from "@/lib/status-machine";
import { STATUS_CHART_COLORS } from "@/lib/chart-colors";
import { toast } from "sonner";

const KANBAN_COLUMNS: LeadStatus[] = [
  "NEW_INQUIRY",
  "INITIAL_CONSULT",
  "IN_PROGRESS",
  "TRIAL_BOOKED",
  "TRIAL_DONE",
  "REGISTERED",
];

interface Lead {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  status: string;
  interestScore: number;
  assignedUser: { id: string; name: string } | null;
}

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchLeads = useCallback(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : data.leads));
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
    if (!lead || lead.status === toStatus) return;

    if (!isValidTransition(lead.status, toStatus)) {
      toast.error(
        `${STATUS_LABELS[lead.status as LeadStatus]} → ${STATUS_LABELS[toStatus as LeadStatus]} 전환은 허용되지 않습니다`
      );
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

      <div className="flex gap-3 overflow-x-auto pb-4">
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

          return (
            <div
              key={status}
              className={`flex-shrink-0 w-64 rounded-lg border-2 transition-colors ${
                isDragOver && canDrop
                  ? "border-primary bg-primary/5"
                  : isDragOver && !canDrop
                    ? "border-red-300 bg-red-50"
                    : "border-transparent bg-muted/30"
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_CHART_COLORS[status] }}
                  />
                  <span className="text-sm font-medium">
                    {STATUS_LABELS[status as LeadStatus]}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                    {col.length}
                  </span>
                </div>
              </div>
              <div className="p-2 pt-0 space-y-2 min-h-[100px]">
                {col.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    id={lead.id}
                    studentName={lead.studentName}
                    grade={lead.grade}
                    subject={lead.subject}
                    interestScore={lead.interestScore}
                    assigneeName={lead.assignedUser?.name ?? null}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

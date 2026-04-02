"use client";

import Link from "next/link";
import { InterestBadge } from "@/components/interest-badge";

interface KanbanCardProps {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  interestScore: number;
  assigneeName: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export function KanbanCard({
  id,
  studentName,
  grade,
  subject,
  interestScore,
  assigneeName,
  onDragStart,
}: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      className="rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <Link href={`/leads/${id}`} className="block">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{studentName}</span>
          <InterestBadge score={interestScore} />
        </div>
        <p className="text-xs text-muted-foreground">
          {grade} / {subject}
        </p>
        {assigneeName && (
          <p className="text-xs text-muted-foreground mt-1">
            담당: {assigneeName}
          </p>
        )}
      </Link>
    </div>
  );
}

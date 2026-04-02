"use client";

import { CHANNELS, TASK_TYPES, INTEREST_SIGNALS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, Phone, Mail, MapPin, MoreHorizontal } from "lucide-react";

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  KAKAO: MessageSquare,
  PHONE: Phone,
  SMS: Mail,
  VISIT: MapPin,
  OTHER: MoreHorizontal,
};

interface Consultation {
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
}

export function ConsultationTimeline({
  consultations,
}: {
  consultations: Consultation[];
}) {
  if (consultations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        상담 기록이 없습니다. 첫 상담을 기록하세요.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {consultations.map((c) => {
        const Icon = channelIcons[c.channel] ?? MoreHorizontal;
        const signals: string[] = c.interestSignals
          ? JSON.parse(c.interestSignals)
          : [];

        return (
          <div key={c.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 p-2">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 w-px bg-border" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {CHANNELS[c.channel as keyof typeof CHANNELS] ?? c.channel}
                </span>
                <span className="text-xs text-muted-foreground">
                  {c.creator.name} /{" "}
                  {formatDistanceToNow(new Date(c.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-2">{c.content}</p>
              {signals.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {signals.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {INTEREST_SIGNALS[s]?.label ?? s}
                      <span className="ml-1 text-muted-foreground">
                        {(INTEREST_SIGNALS[s]?.score ?? 0) > 0 ? "+" : ""}
                        {INTEREST_SIGNALS[s]?.score ?? 0}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
              {c.task && (
                <div className="rounded-md bg-accent p-2 text-xs">
                  <span className="font-medium">다음 액션:</span>{" "}
                  {TASK_TYPES[c.task.taskType as keyof typeof TASK_TYPES] ??
                    c.task.taskType}{" "}
                  - {c.task.description}
                  <span
                    className={`ml-2 ${
                      c.task.status === "COMPLETED"
                        ? "text-green-600"
                        : c.task.status === "CANCELLED"
                          ? "text-gray-400"
                          : ""
                    }`}
                  >
                    [{c.task.status === "COMPLETED" ? "완료" : c.task.status === "CANCELLED" ? "취소" : "대기"}]
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

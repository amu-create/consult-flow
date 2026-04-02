"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CHANNELS,
  TASK_TYPES,
  PRIORITIES,
  INTEREST_SIGNALS,
} from "@/lib/constants";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
}

export function ConsultationForm({
  open,
  onOpenChange,
  leadId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/users")
        .then((r) => r.json())
        .then(setUsers);
      setSelectedSignals([]);
    }
  }, [open]);

  function toggleSignal(signal: string) {
    setSelectedSignals((prev) =>
      prev.includes(signal) ? prev.filter((s) => s !== signal) : [...prev, signal]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const followUpDesc = form.get("followUpDesc") as string;
    if (!followUpDesc?.trim()) {
      toast.error("다음 액션은 필수입니다");
      setLoading(false);
      return;
    }

    const data = {
      channel: form.get("channel"),
      content: form.get("content"),
      interestSignals: selectedSignals,
      createdBy: form.get("createdBy"),
      followUp: {
        taskType: form.get("taskType"),
        description: followUpDesc,
        assignedTo: form.get("followUpAssignee"),
        dueDate: form.get("dueDate"),
        priority: form.get("priority"),
      },
    };

    const res = await fetch(`/api/leads/${leadId}/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("상담 기록이 저장되었습니다");
      onOpenChange(false);
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error || "저장에 실패했습니다");
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상담 기록 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Consultation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>상담 채널 *</Label>
              <Select name="channel" required defaultValue="PHONE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>작성자 *</Label>
              <Select name="createdBy" required>
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>상담 내용 *</Label>
            <Textarea name="content" rows={3} required />
          </div>

          {/* Interest Signals */}
          <div>
            <Label className="mb-2 block">관심 신호</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(INTEREST_SIGNALS).map(([key, { label, score }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSignal(key)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    selectedSignals.includes(key)
                      ? score > 0
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-red-100 border-red-300 text-red-800"
                      : "bg-white hover:bg-accent"
                  }`}
                >
                  {label} ({score > 0 ? `+${score}` : score})
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Follow-up (required) */}
          <div>
            <p className="text-sm font-medium mb-3">
              다음 액션 (필수)
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>유형</Label>
                  <Select name="taskType" defaultValue="CALL">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>담당자 *</Label>
                  <Select name="followUpAssignee" required>
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>할 일 내용 *</Label>
                <Input name="followUpDesc" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>기한 *</Label>
                  <Input
                    name="dueDate"
                    type="datetime-local"
                    defaultValue={defaultDate}
                    required
                  />
                </div>
                <div>
                  <Label>우선순위</Label>
                  <Select name="priority" defaultValue="NORMAL">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

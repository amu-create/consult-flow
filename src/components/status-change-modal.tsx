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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { STATUS_LABELS, type LeadStatus } from "@/lib/constants";
import { getNextStatuses } from "@/lib/status-machine";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
}

export function StatusChangeModal({
  open,
  onOpenChange,
  leadId,
  currentStatus,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  currentStatus: string;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [toStatus, setToStatus] = useState("");
  const [reason, setReason] = useState("");
  const [changedBy, setChangedBy] = useState("");
  const [loading, setLoading] = useState(false);

  const nextStatuses = getNextStatuses(currentStatus).filter(
    (s) => s !== "DROPPED"
  );

  useEffect(() => {
    if (open) {
      fetch("/api/users")
        .then((r) => r.json())
        .then(setUsers);
      setToStatus("");
      setReason("");
      setChangedBy("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!toStatus || !changedBy) {
      toast.error("상태와 담당자를 선택하세요");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toStatus, changedBy, reason: reason || undefined }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("상태가 변경되었습니다");
      onOpenChange(false);
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error || "상태 변경에 실패했습니다");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>상태 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">현재:</span>
            <StatusBadge status={currentStatus} />
          </div>

          <div>
            <Label>변경할 상태 *</Label>
            <Select value={toStatus} onValueChange={(v) => setToStatus(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s as LeadStatus] ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>처리자 *</Label>
            <Select value={changedBy} onValueChange={(v) => setChangedBy(v ?? "")}>
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

          <div>
            <Label>변경 사유 (선택)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 체험수업 완료"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !toStatus}>
              {loading ? "변경 중..." : "변경"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DROP_OFF_REASONS } from "@/lib/constants";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
}

export function DropOffModal({
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
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [detailMemo, setDetailMemo] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/users")
        .then((r) => r.json())
        .then(setUsers);
      setSelectedReasons([]);
      setDetailMemo("");
      setCanRetry(false);
      setCreatedBy("");
    }
  }, [open]);

  function toggleReason(reason: string) {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  }

  async function handleSubmit() {
    if (selectedReasons.length === 0) {
      toast.error("이탈 사유를 최소 1개 선택하세요");
      return;
    }
    if (!createdBy) {
      toast.error("처리자를 선택하세요");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/leads/${leadId}/drop-off`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reasons: selectedReasons,
        detailMemo: detailMemo || undefined,
        canRetry,
        createdBy,
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("이탈 처리되었습니다");
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error || "이탈 처리에 실패했습니다");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">이탈 처리</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">이탈 사유 (복수 선택 가능) *</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DROP_OFF_REASONS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleReason(key)}
                  className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                    selectedReasons.includes(key)
                      ? "bg-red-50 border-red-300 text-red-800"
                      : "hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>상세 메모</Label>
            <Textarea
              value={detailMemo}
              onChange={(e) => setDetailMemo(e.target.value)}
              rows={2}
              placeholder="추가 사유를 기록하세요"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="canRetry"
              checked={canRetry}
              onChange={(e) => setCanRetry(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="canRetry" className="text-sm cursor-pointer">
              재연락 가능
            </Label>
          </div>

          <div>
            <Label>처리자 *</Label>
            <Select value={createdBy} onValueChange={(v) => setCreatedBy(v ?? "")}>
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={loading || selectedReasons.length === 0}
            >
              {loading ? "처리 중..." : "이탈 확정"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

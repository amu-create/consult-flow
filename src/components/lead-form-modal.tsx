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
import { INQUIRY_SOURCES } from "@/lib/constants";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  role: string;
}

export function LeadFormModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/users")
        .then((r) => r.json())
        .then(setUsers);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      studentName: form.get("studentName"),
      grade: form.get("grade"),
      subject: form.get("subject"),
      parentName: form.get("parentName"),
      parentPhone: form.get("parentPhone"),
      parentRelation: form.get("parentRelation"),
      inquirySource: form.get("inquirySource"),
      assignedTo: form.get("assignedTo") || undefined,
      memo: form.get("memo") || undefined,
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("신규 리드가 등록되었습니다");
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error("등록에 실패했습니다");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>신규 리드 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="studentName">학생 이름 *</Label>
              <Input id="studentName" name="studentName" required />
            </div>
            <div>
              <Label htmlFor="grade">학년 *</Label>
              <Input id="grade" name="grade" placeholder="예: 중2" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="subject">관심 과목 *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="예: 영어"
                required
              />
            </div>
            <div>
              <Label htmlFor="inquirySource">문의 경로 *</Label>
              <Select name="inquirySource" required defaultValue="KAKAO">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INQUIRY_SOURCES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="parentName">학부모 이름</Label>
              <Input id="parentName" name="parentName" />
            </div>
            <div>
              <Label htmlFor="parentPhone">연락처 *</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                placeholder="010-0000-0000"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="parentRelation">관계</Label>
              <Select name="parentRelation" defaultValue="어머니">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="어머니">어머니</SelectItem>
                  <SelectItem value="아버지">아버지</SelectItem>
                  <SelectItem value="본인">본인</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">담당자</Label>
              <Select name="assignedTo">
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
            <Label htmlFor="memo">메모</Label>
            <Textarea id="memo" name="memo" rows={2} />
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
              {loading ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

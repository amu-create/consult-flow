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
}

interface LeadData {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  parentName: string | null;
  parentPhone: string;
  parentRelation: string | null;
  inquirySource: string;
  competitorInfo: string | null;
  currentLevel: string | null;
  memo: string | null;
  assignedUser: { id: string; name: string } | null;
}

export function LeadEditModal({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadData;
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
      parentName: form.get("parentName") || null,
      parentPhone: form.get("parentPhone"),
      parentRelation: form.get("parentRelation") || null,
      inquirySource: form.get("inquirySource"),
      assignedTo: form.get("assignedTo") || undefined,
      competitorInfo: form.get("competitorInfo") || null,
      currentLevel: form.get("currentLevel") || null,
      memo: form.get("memo") || null,
    };

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("리드 정보가 수정되었습니다");
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error("수정에 실패했습니다");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>리드 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-studentName">학생 이름 *</Label>
              <Input id="edit-studentName" name="studentName" defaultValue={lead.studentName} required />
            </div>
            <div>
              <Label htmlFor="edit-grade">학년 *</Label>
              <Input id="edit-grade" name="grade" defaultValue={lead.grade} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-subject">관심 과목 *</Label>
              <Input id="edit-subject" name="subject" defaultValue={lead.subject} required />
            </div>
            <div>
              <Label htmlFor="edit-inquirySource">문의 경로 *</Label>
              <Select name="inquirySource" defaultValue={lead.inquirySource}>
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
              <Label htmlFor="edit-parentName">학부모 이름</Label>
              <Input id="edit-parentName" name="parentName" defaultValue={lead.parentName ?? ""} />
            </div>
            <div>
              <Label htmlFor="edit-parentPhone">연락처 *</Label>
              <Input id="edit-parentPhone" name="parentPhone" defaultValue={lead.parentPhone} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-parentRelation">관계</Label>
              <Select name="parentRelation" defaultValue={lead.parentRelation ?? "어머니"}>
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
              <Label htmlFor="edit-assignedTo">담당자</Label>
              <Select name="assignedTo" defaultValue={lead.assignedUser?.id ?? ""}>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-currentLevel">현재 수준</Label>
              <Input id="edit-currentLevel" name="currentLevel" defaultValue={lead.currentLevel ?? ""} />
            </div>
            <div>
              <Label htmlFor="edit-competitorInfo">경쟁 학원</Label>
              <Input id="edit-competitorInfo" name="competitorInfo" defaultValue={lead.competitorInfo ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-memo">메모</Label>
            <Textarea id="edit-memo" name="memo" rows={2} defaultValue={lead.memo ?? ""} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

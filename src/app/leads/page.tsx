"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { InterestBadge } from "@/components/interest-badge";
import { LeadFormModal } from "@/components/lead-form-modal";
import { STATUS_LABELS, type LeadStatus } from "@/lib/constants";
import { Plus, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Lead {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  status: string;
  interestScore: number;
  parentPhone: string;
  updatedAt: string;
  assignedUser: { id: string; name: string } | null;
  tasks: Array<{ description: string; dueDate: string }>;
  consultations: Array<{ createdAt: string }>;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLeads = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("pageSize", "20");
    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeads(data);
          setPagination({ total: data.length, totalPages: 1 });
        } else {
          setLeads(data.leads);
          setPagination(data.pagination);
        }
      });
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">리드 관리</h1>
          <p className="text-muted-foreground text-sm">
            전체 {pagination.total}건
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export/leads" download>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </a>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            신규 리드
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이름, 연락처 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>학생명</TableHead>
              <TableHead>학년</TableHead>
              <TableHead>과목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관심도</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>마지막 연락</TableHead>
              <TableHead>다음 액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  리드가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-accent/50">
                  <TableCell>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium hover:underline"
                    >
                      {lead.studentName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.grade}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.subject}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <InterestBadge score={lead.interestScore} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assignedUser?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {lead.consultations[0]
                      ? formatDistanceToNow(
                          new Date(lead.consultations[0].createdAt),
                          { addSuffix: true, locale: ko }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {lead.tasks[0]?.description ?? "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages} 페이지
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <LeadFormModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={fetchLeads}
      />
    </div>
  );
}

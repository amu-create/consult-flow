"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TASK_TYPES, PRIORITIES, PRIORITY_COLORS } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { Check, X } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

interface Task {
  id: string;
  taskType: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  lead: { id: string; studentName: string; status: string };
  assignee: { id: string; name: string };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");

  const fetchTasks = useCallback(() => {
    fetch(`/api/tasks?filter=${filter}`)
      .then((r) => r.json())
      .then(setTasks);
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function completeTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    toast.success("완료 처리되었습니다");
    fetchTasks();
  }

  async function cancelTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    toast.info("취소되었습니다");
    fetchTasks();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">할 일</h1>
        <p className="text-muted-foreground text-sm">
          대기 중인 후속 액션 {tasks.length}건
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v ?? "all")}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="today">오늘</TabsTrigger>
          <TabsTrigger value="overdue">기한 초과</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {filter === "today"
              ? "오늘 예정된 할 일이 없습니다"
              : filter === "overdue"
                ? "기한 초과 항목이 없습니다"
                : "대기 중인 할 일이 없습니다"}
          </p>
        ) : (
          tasks.map((task) => {
            const overdue = isPast(new Date(task.dueDate));
            return (
              <Card
                key={task.id}
                className={overdue ? "border-red-200" : undefined}
              >
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/leads/${task.lead.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {task.lead.studentName}
                      </Link>
                      <StatusBadge status={task.lead.status} />
                      <Badge
                        variant="secondary"
                        className={`text-xs ${PRIORITY_COLORS[task.priority] ?? ""} border-0`}
                      >
                        {PRIORITIES[task.priority as keyof typeof PRIORITIES] ??
                          task.priority}
                      </Badge>
                      {overdue && (
                        <Badge variant="destructive" className="text-xs">
                          기한 초과
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">
                      {TASK_TYPES[task.taskType as keyof typeof TASK_TYPES] ??
                        task.taskType}{" "}
                      - {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.assignee.name} / 기한:{" "}
                      {formatDistanceToNow(new Date(task.dueDate), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => completeTask(task.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      onClick={() => cancelTask(task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

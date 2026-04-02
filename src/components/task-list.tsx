"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TASK_TYPES, PRIORITIES, PRIORITY_COLORS } from "@/lib/constants";
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
  completedAt: string | null;
  assignee: { id: string; name: string };
}

export function TaskList({
  tasks,
  onUpdate,
}: {
  tasks: Task[];
  onUpdate: () => void;
}) {
  const pending = tasks.filter((t) => t.status === "PENDING");
  const done = tasks.filter((t) => t.status !== "PENDING");

  async function completeTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    toast.success("완료 처리되었습니다");
    onUpdate();
  }

  async function cancelTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    toast.info("취소되었습니다");
    onUpdate();
  }

  return (
    <div className="space-y-4">
      {pending.length === 0 && done.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          등록된 다음 액션이 없습니다
        </p>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            대기 중 ({pending.length})
          </h3>
          {pending.map((task) => {
            const overdue = isPast(new Date(task.dueDate));
            return (
              <Card
                key={task.id}
                className={overdue ? "border-red-200" : undefined}
              >
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {TASK_TYPES[task.taskType as keyof typeof TASK_TYPES] ??
                          task.taskType}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          PRIORITY_COLORS[task.priority] ?? ""
                        } border-0`}
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
                    <p className="text-sm">{task.description}</p>
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
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            완료/취소 ({done.length})
          </h3>
          {done.map((task) => (
            <Card key={task.id} className="opacity-60">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm line-through">
                    {TASK_TYPES[task.taskType as keyof typeof TASK_TYPES] ??
                      task.taskType}{" "}
                    - {task.description}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {task.status === "COMPLETED" ? "완료" : "취소"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

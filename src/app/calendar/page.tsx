"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface TrialEvent {
  id: string;
  date: string;
  time: string;
  studentName: string;
  grade: string;
  subject: string;
  parentPhone: string;
  assigneeName: string;
  status: string;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function TrialCalendarPage() {
  const router = useRouter();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [events, setEvents] = useState<TrialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TrialEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/calendar/trials?month=${monthStr}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month, router]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedEvent(null);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedEvent(null);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  function getEventsForDay(day: number): TrialEvent[] {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">체험 수업 일정</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {year}년 {month + 1}월
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              불러오는 중...
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`text-center text-xs font-medium py-2 ${
                      i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {Array.from({ length: totalCells }, (_, i) => {
                  const day = i - firstDay + 1;
                  const isValidDay = day >= 1 && day <= daysInMonth;
                  const dayEvents = isValidDay ? getEventsForDay(day) : [];
                  const isToday =
                    isValidDay &&
                    new Date().getFullYear() === year &&
                    new Date().getMonth() === month &&
                    new Date().getDate() === day;
                  const colIndex = i % 7;

                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] bg-card p-1.5 ${
                        !isValidDay ? "bg-muted/30" : ""
                      }`}
                    >
                      {isValidDay && (
                        <>
                          <div
                            className={`text-xs mb-1 ${
                              isToday
                                ? "bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center font-bold"
                                : colIndex === 0
                                  ? "text-red-500"
                                  : colIndex === 6
                                    ? "text-blue-500"
                                    : "text-muted-foreground"
                            }`}
                          >
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.map((evt) => (
                              <button
                                key={evt.id}
                                onClick={() => setSelectedEvent(evt)}
                                className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium transition-colors ${
                                  evt.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                    : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                }`}
                              >
                                {evt.studentName}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Event detail popup */}
              {selectedEvent && (
                <div className="mt-4">
                  <Card className="border-primary/20">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">체험 수업 상세</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setSelectedEvent(null)}
                        >
                          &times;
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-muted-foreground">학생 이름</dt>
                        <dd className="font-medium">{selectedEvent.studentName}</dd>
                        <dt className="text-muted-foreground">학년</dt>
                        <dd>{selectedEvent.grade}</dd>
                        <dt className="text-muted-foreground">과목</dt>
                        <dd>{selectedEvent.subject}</dd>
                        <dt className="text-muted-foreground">학부모 연락처</dt>
                        <dd>{selectedEvent.parentPhone}</dd>
                        <dt className="text-muted-foreground">담당자</dt>
                        <dd>{selectedEvent.assigneeName}</dd>
                        <dt className="text-muted-foreground">날짜</dt>
                        <dd>{new Date(selectedEvent.date).toLocaleDateString("ko-KR")}</dd>
                        <dt className="text-muted-foreground">상태</dt>
                        <dd>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              selectedEvent.status === "COMPLETED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {selectedEvent.status === "COMPLETED" ? "완료" : "예정"}
                          </span>
                        </dd>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

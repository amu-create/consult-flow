"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MessageSquare,
  Phone,
  Bell,
  Send,
  CheckCircle2,
  Settings,
  Zap,
} from "lucide-react";

const TEMPLATES = [
  {
    id: "consult_reminder",
    name: "상담 리마인더",
    channel: "KAKAO",
    trigger: "상담 예약 1일 전",
    template:
      "[ConsultFlow] #{학생명} 학부모님, 내일 #{시간}에 #{학원명} 상담이 예정되어 있습니다. 변경이 필요하시면 #{전화번호}로 연락주세요.",
    active: true,
  },
  {
    id: "trial_booked",
    name: "체험수업 확정",
    channel: "KAKAO",
    trigger: "체험수업 예약 시",
    template:
      "[ConsultFlow] #{학생명} 학부모님, #{날짜} #{시간} 체험수업이 확정되었습니다. 준비물: #{준비물}. 장소: #{학원주소}",
    active: true,
  },
  {
    id: "followup_sms",
    name: "후속 연락 알림",
    channel: "SMS",
    trigger: "팔로업 태스크 기한 당일",
    template:
      "[ConsultFlow] 오늘 #{학생명} 학부모님께 후속 연락 예정입니다. (#{태스크내용})",
    active: false,
  },
  {
    id: "registration_complete",
    name: "등록 완료 안내",
    channel: "KAKAO",
    trigger: "등록 완료 처리 시",
    template:
      "[ConsultFlow] #{학생명} 학부모님, #{학원명} 등록이 완료되었습니다! 첫 수업은 #{시작일}입니다. 감사합니다.",
    active: true,
  },
  {
    id: "overdue_alert",
    name: "방치 리드 경고",
    channel: "SMS",
    trigger: "마지막 상담 후 7일 경과",
    template:
      "[알림] #{학생명} 리드가 7일간 후속 조치 없습니다. 즉시 확인해주세요.",
    active: true,
  },
];

const CHANNEL_ICON: Record<string, typeof MessageSquare> = {
  KAKAO: MessageSquare,
  SMS: Phone,
};

const CHANNEL_COLOR: Record<string, string> = {
  KAKAO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  SMS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function NotificationsPage() {
  const [templates, setTemplates] = useState(TEMPLATES);
  const [testPhone, setTestPhone] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  function toggleTemplate(id: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
    toast.success("알림 설정이 변경되었습니다.");
  }

  function handleTestSend(templateId: string) {
    setSending(templateId);
    // Simulate API call
    setTimeout(() => {
      setSending(null);
      if (!apiConnected) {
        toast.info("API 키가 설정되지 않아 Mock 모드로 전송했습니다.", {
          description: "실제 연동 시 카카오 비즈메시지 API 키를 설정해주세요.",
        });
      } else {
        toast.success("테스트 메시지를 전송했습니다.");
      }
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">알림 설정</h1>
        <p className="text-muted-foreground text-sm mt-1">
          카카오 알림톡 / SMS 자동 발송 설정
        </p>
      </div>

      {/* API Connection Status */}
      <Card className={apiConnected ? "border-green-300 dark:border-green-800" : "border-amber-300 dark:border-amber-800"}>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${apiConnected ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                <Zap className={`h-5 w-5 ${apiConnected ? "text-green-600" : "text-amber-600"}`} />
              </div>
              <div>
                <p className="font-medium">
                  {apiConnected ? "API 연결됨" : "API 미연결 (Mock 모드)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {apiConnected
                    ? "카카오 비즈메시지 API가 정상 연결되었습니다."
                    : "API 키를 설정하면 실제 알림이 발송됩니다."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={apiConnected ? "outline" : "default"}
                size="sm"
                onClick={() => setApiConnected(!apiConnected)}
              >
                <Settings className="h-4 w-4 mr-1" />
                {apiConnected ? "연결 해제" : "API 키 설정"}
              </Button>
            </div>
          </div>

          {!apiConnected && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted">
              <div className="space-y-1">
                <Label className="text-xs">카카오 비즈메시지 API Key</Label>
                <Input placeholder="ak_xxxxxxxxxxxxxxxx" className="h-8 text-sm" disabled={!apiConnected} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">발신번호</Label>
                <Input placeholder="02-1234-5678" className="h-8 text-sm" disabled={!apiConnected} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Send */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" />
            테스트 발송
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              placeholder="테스트 수신 번호 (010-xxxx-xxxx)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              아래 템플릿의 '테스트' 버튼으로 발송
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          알림 템플릿 ({templates.filter((t) => t.active).length}/{templates.length}개 활성)
        </h2>

        {templates.map((t) => {
          const Icon = CHANNEL_ICON[t.channel] || Bell;
          return (
            <Card key={t.id} className={!t.active ? "opacity-60" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_COLOR[t.channel]}`}>
                        <Icon className="h-3 w-3" />
                        {t.channel === "KAKAO" ? "카카오톡" : "SMS"}
                      </span>
                      <span className="font-medium">{t.name}</span>
                      {t.active && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          활성
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      트리거: {t.trigger}
                    </p>
                    <div className="rounded-md bg-muted p-2.5 text-sm font-mono leading-relaxed">
                      {t.template}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestSend(t.id)}
                      disabled={sending === t.id}
                    >
                      {sending === t.id ? "전송 중..." : "테스트"}
                    </Button>
                    <Button
                      variant={t.active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleTemplate(t.id)}
                    >
                      {t.active ? "비활성화" : "활성화"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Guide */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">연동 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. <strong>카카오 비즈니스</strong>에서 채널을 생성하고 비즈메시지 API 키를 발급받으세요.</p>
          <p>2. 위 <strong>API 키 설정</strong>에 발급받은 키와 발신번호를 입력하세요.</p>
          <p>3. <strong>테스트 발송</strong>으로 정상 동작을 확인한 후, 템플릿을 활성화하세요.</p>
          <p>4. 활성화된 템플릿은 트리거 조건에 따라 <strong>자동으로 발송</strong>됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

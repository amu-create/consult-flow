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
    testText: "[ConsultFlow] 김민수 학부모님, 내일 14:00에 영재학원 상담이 예정되어 있습니다.",
    active: true,
  },
  {
    id: "trial_booked",
    name: "체험수업 확정",
    channel: "KAKAO",
    trigger: "체험수업 예약 시",
    template:
      "[ConsultFlow] #{학생명} 학부모님, #{날짜} #{시간} 체험수업이 확정되었습니다. 준비물: #{준비물}. 장소: #{학원주소}",
    testText: "[ConsultFlow] 이서연 학부모님, 4월 5일 16:00 체험수업이 확정되었습니다.",
    active: true,
  },
  {
    id: "followup_sms",
    name: "후속 연락 알림",
    channel: "SMS",
    trigger: "팔로업 태스크 기한 당일",
    template:
      "[ConsultFlow] 오늘 #{학생명} 학부모님께 후속 연락 예정입니다. (#{태스크내용})",
    testText: "[ConsultFlow] 오늘 박지훈 학부모님께 후속 연락 예정입니다. (체험수업 후기 확인)",
    active: false,
  },
  {
    id: "registration_complete",
    name: "등록 완료 안내",
    channel: "KAKAO",
    trigger: "등록 완료 처리 시",
    template:
      "[ConsultFlow] #{학생명} 학부모님, #{학원명} 등록이 완료되었습니다! 첫 수업은 #{시작일}입니다. 감사합니다.",
    testText: "[ConsultFlow] 최예린 학부모님, 영재학원 등록이 완료되었습니다! 감사합니다.",
    active: true,
  },
  {
    id: "overdue_alert",
    name: "방치 리드 경고",
    channel: "SMS",
    trigger: "마지막 상담 후 7일 경과",
    template:
      "[알림] #{학생명} 리드가 7일간 후속 조치 없습니다. 즉시 확인해주세요.",
    testText: "[알림] 홍길동 리드가 7일간 후속 조치 없습니다. 즉시 확인해주세요.",
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
  const [kakaoMessage, setKakaoMessage] = useState("");
  const [sendingKakao, setSendingKakao] = useState(false);

  function toggleTemplate(id: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
    toast.success("알림 설정이 변경되었습니다.");
  }

  async function handleTestSend(template: typeof TEMPLATES[0]) {
    setSending(template.id);

    if (template.channel === "KAKAO") {
      // 카카오 나에게 보내기
      try {
        const res = await fetch("/api/notifications/kakao-me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: template.testText }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("카카오톡으로 전송했습니다!", { description: "카카오톡 앱을 확인하세요." });
        } else {
          toast.error(data.error || "전송 실패", {
            description: data.error?.includes("카카오 로그인") ? "로그아웃 후 카카오 로그인으로 다시 접속해주세요." : undefined,
          });
        }
      } catch {
        toast.error("전송 중 오류가 발생했습니다.");
      }
    } else {
      // SMS via Solapi
      if (!testPhone) {
        toast.error("테스트 수신 번호를 입력해주세요.");
        setSending(null);
        return;
      }
      try {
        const res = await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testPhone, text: template.testText }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("SMS를 전송했습니다!", { description: `수신: ${testPhone}` });
        } else if (data.mock) {
          toast.info("Mock 모드: Solapi API 키가 설정되지 않았습니다.", {
            description: "환경변수에 SOLAPI_API_KEY, SOLAPI_API_SECRET을 설정하세요.",
          });
        } else {
          toast.error(data.error || "SMS 전송 실패");
        }
      } catch {
        toast.error("전송 중 오류가 발생했습니다.");
      }
    }

    setSending(null);
  }

  async function handleKakaoSend() {
    if (!kakaoMessage.trim()) {
      toast.error("메시지를 입력해주세요.");
      return;
    }
    setSendingKakao(true);
    try {
      const res = await fetch("/api/notifications/kakao-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: kakaoMessage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("카카오톡으로 전송했습니다!");
        setKakaoMessage("");
      } else {
        toast.error(data.error || "전송 실패");
      }
    } catch {
      toast.error("전송 중 오류가 발생했습니다.");
    }
    setSendingKakao(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">알림 설정</h1>
        <p className="text-muted-foreground text-sm mt-1">
          카카오 알림톡 / SMS 자동 발송 설정
        </p>
      </div>

      {/* Kakao 나에게 보내기 */}
      <Card className="border-yellow-300 dark:border-yellow-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-yellow-600" />
            카카오톡 나에게 보내기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            카카오 로그인한 계정으로 테스트 메시지를 보낼 수 있습니다.
          </p>
          <div className="flex items-center gap-3">
            <Input
              placeholder="테스트 메시지 입력..."
              value={kakaoMessage}
              onChange={(e) => setKakaoMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleKakaoSend}
              disabled={sendingKakao}
              className="bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] shrink-0"
            >
              {sendingKakao ? "전송 중..." : "카카오톡 전송"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Test Send */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" />
            SMS 테스트 발송
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              placeholder="수신 번호 (010-xxxx-xxxx)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              SMS 템플릿의 '테스트' 버튼으로 발송 (Solapi)
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
                      onClick={() => handleTestSend(t)}
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
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            연동 상태
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">카카오톡 나에게 보내기</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">연동됨</span>
            <span className="text-xs text-muted-foreground">카카오 로그인 시 자동 활성화</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            <span className="font-medium">SMS (Solapi)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">연동됨</span>
            <span className="text-xs text-muted-foreground">발신번호 등록 후 실발송 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">카카오 알림톡</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">준비 중</span>
            <span className="text-xs text-muted-foreground">비즈니스 채널 연결 후 활성화</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

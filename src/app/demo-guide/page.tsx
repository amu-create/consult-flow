"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Monitor,
  MessageSquare,
  BarChart3,
  Columns3,
  Users,
  ClipboardList,
  Play,
} from "lucide-react";

const steps = [
  {
    num: 1,
    icon: Monitor,
    title: "대시보드 소개",
    duration: "1분",
    link: "/dashboard",
    script:
      "ConsultFlow에 로그인하면 가장 먼저 보이는 화면입니다. 전체 리드 현황, 전환율, 방치 리드, 등록 임박 리드를 한눈에 파악할 수 있습니다. 상태 분포 도넛 차트와 전환 소요일 지표도 바로 확인 가능합니다.",
    actions: [
      "KPI 카드 4개 설명 (전체 리드, 전환율, 방치 리드, 등록 임박)",
      "상태 분포 도넛 차트 가리키며 설명",
      "금일 마감 태스크 목록 보여주기",
    ],
  },
  {
    num: 2,
    icon: Users,
    title: "리드 등록 시연",
    duration: "2분",
    link: "/leads",
    script:
      "새로운 문의가 들어오면 '신규 리드' 버튼으로 즉시 등록합니다. 학생 정보, 학부모 연락처, 문의 경로까지 체계적으로 기록됩니다.",
    actions: [
      "'신규 리드' 버튼 클릭",
      "학생명: 김민준, 학년: 중2, 과목: 수학 입력",
      "학부모 연락처, 문의 경로(전화문의) 입력",
      "저장 후 리드 목록에서 확인",
    ],
  },
  {
    num: 3,
    icon: MessageSquare,
    title: "상담 기록 + 관심도 자동 측정",
    duration: "2분",
    link: "/leads",
    script:
      "리드를 클릭하면 상세 페이지로 이동합니다. '상담 기록 추가'를 누르면 통화/방문 내용을 기록할 수 있고, 관심 신호를 체크하면 관심도 점수가 자동으로 계산됩니다. 그리고 핵심 기능 — 상담 기록 시 다음 팔로업 액션을 반드시 입력해야 합니다.",
    actions: [
      "리드 상세 페이지 진입",
      "'상담 기록 추가' 클릭",
      "채널: 전화, 내용 입력",
      "관심 신호 2~3개 체크 (교육과정 질문, 수업료 질문 등)",
      "다음 액션(팔로업) 입력 — 필수!",
      "저장 후 관심도 점수 변화 확인",
    ],
  },
  {
    num: 4,
    icon: Columns3,
    title: "칸반 파이프라인",
    duration: "1분",
    link: "/leads/kanban",
    script:
      "칸반 보드에서 전환 파이프라인을 한눈에 볼 수 있습니다. 드래그앤드롭으로 리드의 상태를 변경할 수 있고, 상태머신이 잘못된 전이를 자동으로 차단합니다.",
    actions: [
      "컬럼별 리드 분포 보여주기",
      "리드 하나를 드래그하여 다음 상태로 이동",
      "잘못된 전이 시도 → 빨간 테두리로 차단되는 것 시연",
    ],
  },
  {
    num: 5,
    icon: ClipboardList,
    title: "태스크 관리",
    duration: "1분",
    link: "/tasks",
    script:
      "모든 팔로업 태스크를 한곳에서 관리합니다. 기한 임박 순으로 정렬되어 오늘 해야 할 일을 놓치지 않습니다.",
    actions: [
      "태스크 목록 전체 보기",
      "기한 임박 태스크 확인",
      "태스크 완료 처리 시연",
    ],
  },
  {
    num: 6,
    icon: BarChart3,
    title: "분석 대시보드",
    duration: "2분",
    link: "/analytics",
    script:
      "데이터 기반 의사결정의 핵심입니다. 전환 퍼널에서 어느 단계에서 리드가 가장 많이 이탈하는지, 월별 트렌드로 성장 추이를, 문의 경로별 전환율로 마케팅 효율을 파악합니다.",
    actions: [
      "전환 퍼널 차트 설명",
      "월별 트렌드 차트에서 성장 추이 가리키기",
      "문의 경로 분석 — 어떤 채널이 전환율이 높은지",
      "이탈 사유 분석 — 왜 등록하지 않는지 데이터로 확인",
      "CSV 내보내기 버튼 시연",
    ],
  },
];

export default function DemoGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">데모 시나리오 가이드</h1>
        <p className="text-muted-foreground text-sm mt-1">
          창업지원금 심사 발표 시 제품 데모 진행 순서 (총 약 9분)
        </p>
      </div>

      {/* Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Play className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-900 mb-1">데모 시작 전 체크리스트</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. 시드 데이터가 충분히 있는지 확인 (npx prisma db seed)</li>
                <li>2. 개발 서버 실행 확인 (npm run dev)</li>
                <li>3. 브라우저 전체 화면 모드 준비</li>
                <li>4. 각 페이지를 미리 한 번씩 로딩해두기 (초기 로딩 방지)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.num}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-blue-600" />
                      {step.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      예상 소요: {step.duration}
                    </p>
                  </div>
                </div>
                <Link href={step.link}>
                  <Button variant="outline" size="sm">
                    페이지 이동
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Script */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  스크립트
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step.script}
                </p>
              </div>
              {/* Actions */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  시연 동작
                </p>
                <ul className="space-y-1.5">
                  {step.actions.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-blue-500 font-mono text-xs mt-0.5 shrink-0">
                        {i + 1}.
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Closing */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4 pb-4">
          <p className="font-medium text-green-900 mb-1">데모 마무리 멘트</p>
          <p className="text-sm text-green-800">
            "지금까지 보신 것처럼, ConsultFlow는 문의 접수부터 상담, 팔로업, 전환 분석까지
            학원 상담의 전 과정을 체계적으로 관리합니다. 엑셀이나 수기로는 불가능한
            관심도 자동 측정과 팔로업 강제 생성이 핵심 차별점이며, 이를 통해 학원의
            등록 전환율을 실질적으로 높일 수 있습니다."
          </p>
        </CardContent>
      </Card>

      {/* Quick navigation */}
      <div className="flex flex-wrap gap-2">
        <p className="text-sm text-muted-foreground w-full mb-1">빠른 이동:</p>
        {[
          { label: "대시보드", href: "/dashboard" },
          { label: "리드 관리", href: "/leads" },
          { label: "칸반 보드", href: "/leads/kanban" },
          { label: "태스크", href: "/tasks" },
          { label: "분석", href: "/analytics" },
          { label: "랜딩 페이지", href: "/" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>
            <Button variant="outline" size="sm">
              {l.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}

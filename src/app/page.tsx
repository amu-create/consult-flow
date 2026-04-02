"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  BarChart3,
  ClipboardList,
  Target,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Bell,
  Columns3,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: Target,
    title: "8단계 상담 퍼널",
    desc: "문의부터 등록까지 전 과정을 상태머신으로 추적. 잘못된 전이를 자동 차단하여 데이터 무결성을 보장합니다.",
  },
  {
    icon: TrendingUp,
    title: "AI 관심도 스코어링",
    desc: "상담 기록의 10가지 신호를 분석하여 등록 가능성을 자동 산출. 집중해야 할 리드를 즉시 파악합니다.",
  },
  {
    icon: Bell,
    title: "팔로업 강제 생성",
    desc: "상담 기록 시 다음 액션을 필수로 생성. 방치 리드를 원천 차단하는 구조적 장치입니다.",
  },
  {
    icon: Columns3,
    title: "칸반 파이프라인",
    desc: "드래그앤드롭으로 리드 상태를 변경. 전환 파이프라인을 한눈에 파악하고 관리합니다.",
  },
  {
    icon: BarChart3,
    title: "전환 분석 대시보드",
    desc: "퍼널, 월별 트렌드, 문의 경로, 이탈 사유까지 6종 차트로 데이터 기반 의사결정을 지원합니다.",
  },
  {
    icon: Shield,
    title: "이탈 패턴 분석",
    desc: "이탈 사유를 복수 선택하고 재시도 플래그를 관리. 이탈 패턴 데이터를 축적하여 개선점을 도출합니다.",
  },
];

const stats = [
  { value: "25~35%", label: "학원 평균 전환율", sub: "이 수치를 올리는 것이 목표" },
  { value: "10만+", label: "한국 학원 수", sub: "통계청 2023 기준" },
  { value: "3,000억", label: "미전환 매출 손실", sub: "연간 시장 전체 추정" },
];

const pricing = [
  {
    name: "스타터",
    price: "무료",
    period: "",
    features: ["리드 30건", "기본 상담 관리", "상태 추적"],
    highlight: false,
  },
  {
    name: "프로",
    price: "29,000원",
    period: "/월",
    features: ["무제한 리드", "분석 대시보드", "CSV 내보내기", "관심도 스코어링"],
    highlight: true,
  },
  {
    name: "비즈니스",
    price: "59,000원",
    period: "/월",
    features: ["멀티지점 관리", "카카오/SMS 연동", "우선 지원", "맞춤 리포트"],
    highlight: false,
  },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              CF
            </div>
            <span className="font-bold text-sm">ConsultFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              기능
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              요금
            </Link>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </button>
            <Link href="/dashboard">
              <Button size="sm">
                데모 체험하기
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            학원 상담 전환 특화 OS
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            상담은 했는데<br />
            <span className="text-blue-600">등록은 안 되는</span> 학원을 위한 솔루션
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            상담 누락 방지, AI 관심도 측정, 강제 팔로업으로<br className="hidden sm:block" />
            문의 → 등록 전환율을 체계적으로 높여드립니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="text-base px-8">
                무료로 시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="lg" className="text-base px-8">
                분석 데모 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{s.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-3">
            왜 전환율이 낮을까?
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            학원 상담에서 등록까지, 이 과정에서 벌어지는 3가지 문제
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: "상담 이력 누락", desc: "누가 언제 뭘 말했는지 기록이 없어 같은 질문을 반복하게 됩니다." },
              { title: "후속 연락 지연", desc: "타이밍을 놓쳐 관심 있던 학부모가 다른 학원으로 이탈합니다." },
              { title: "관심도 파악 불가", desc: "등록 가능성 높은 리드와 낮은 리드를 구분할 수 없습니다." },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border border-red-100 bg-red-50/50 p-5">
                <h3 className="font-semibold text-red-800 mb-2">{p.title}</h3>
                <p className="text-sm text-red-600/80">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-3">
            ConsultFlow가 해결합니다
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            상담 전환에 특화된 6가지 핵심 기능
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-card border p-5 hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            이렇게 작동합니다
          </h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: "1", title: "문의 접수", desc: "전화, 방문, 온라인 등 모든 경로의 문의를 등록" },
              { step: "2", title: "상담 기록", desc: "통화/방문 내용을 기록하면 관심도가 자동 측정" },
              { step: "3", title: "팔로업 관리", desc: "자동 생성된 다음 액션으로 빈틈없이 후속 연락" },
              { step: "4", title: "전환 분석", desc: "퍼널/트렌드/이탈 분석으로 전환율 지속 개선" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            기존 솔루션과 비교
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">기능</th>
                  <th className="text-center py-3 px-4 text-muted-foreground">엑셀</th>
                  <th className="text-center py-3 px-4 text-muted-foreground">네이버 예약</th>
                  <th className="text-center py-3 px-4 text-muted-foreground">일반 CRM</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-600 bg-blue-50 rounded-t-lg">ConsultFlow</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["상담 이력 관리", "X", "X", "O", "O"],
                  ["상태 퍼널 추적", "X", "X", "O", "O"],
                  ["관심도 자동 측정", "X", "X", "X", "O"],
                  ["팔로업 강제 생성", "X", "X", "X", "O"],
                  ["이탈 사유 분석", "X", "X", "X", "O"],
                  ["학원 특화 UI", "X", "X", "X", "O"],
                  ["한국어 인터페이스", "O", "O", "X", "O"],
                  ["무료 플랜", "O", "O", "X", "O"],
                ].map(([feature, ...vals]) => (
                  <tr key={feature} className="border-b">
                    <td className="py-2.5 px-4 font-medium text-foreground">{feature}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`text-center py-2.5 px-4 ${i === 3 ? "bg-blue-50" : ""}`}>
                        {v === "O" ? (
                          <CheckCircle2 className={`h-4 w-4 mx-auto ${i === 3 ? "text-blue-600" : "text-green-500"}`} />
                        ) : (
                          <span className="text-muted-foreground/40">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-3">
            심플한 요금제
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            필요한 만큼만, 부담 없이 시작하세요
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border-2 p-6 ${
                  p.highlight
                    ? "border-blue-600 shadow-lg relative"
                    : "border-border"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    추천
                  </div>
                )}
                <h3 className="font-semibold text-foreground mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-foreground">{p.price}</span>
                  {p.period && <span className="text-sm text-muted-foreground">{p.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button
                    variant={p.highlight ? "default" : "outline"}
                    className="w-full"
                  >
                    {p.price === "무료" ? "무료로 시작" : "시작하기"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            상담 전환율, 지금 바로 높여보세요
          </h2>
          <p className="text-blue-100 mb-8">
            무료 플랜으로 시작하세요. 신용카드 필요 없습니다.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="text-base px-8">
              무료로 시작하기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              CF
            </div>
            <span className="text-sm font-semibold">ConsultFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 ConsultFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

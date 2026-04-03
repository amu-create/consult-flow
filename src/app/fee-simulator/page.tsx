"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const SUBJECTS = [
  { key: "korean", label: "국어", price: 150000 },
  { key: "english", label: "영어", price: 180000 },
  { key: "math", label: "수학", price: 180000 },
  { key: "science", label: "과학", price: 150000 },
  { key: "social", label: "사회", price: 120000 },
  { key: "essay", label: "논술", price: 200000 },
] as const;

const FREQUENCIES = [
  { label: "주 2회", multiplier: 1.0 },
  { label: "주 3회", multiplier: 1.4 },
  { label: "주 4회", multiplier: 1.8 },
];

const DISCOUNTS = [
  { key: "none", label: "없음", rate: 0 },
  { key: "sibling", label: "형제할인", rate: 0.1 },
  { key: "early", label: "조기등록", rate: 0.05 },
  { key: "multi", label: "2과목이상", rate: 0.08 },
];

const TEXTBOOK_PER_SUBJECT = 20000;

function formatWon(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

export default function FeeSimulatorPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [freqIdx, setFreqIdx] = useState(0);
  const [discountKey, setDiscountKey] = useState("none");

  const freq = FREQUENCIES[freqIdx];
  const discount = DISCOUNTS.find((d) => d.key === discountKey) ?? DISCOUNTS[0];

  const calc = useMemo(() => {
    const subjects = SUBJECTS.filter((s) => selected.has(s.key));
    const breakdown = subjects.map((s) => ({
      label: s.label,
      base: s.price,
      adjusted: Math.round(s.price * freq.multiplier),
    }));
    const subtotal = breakdown.reduce((sum, b) => sum + b.adjusted, 0);
    const discountAmount = Math.round(subtotal * discount.rate);
    const tuition = subtotal - discountAmount;
    const textbook = subjects.length * TEXTBOOK_PER_SUBJECT;
    const total = tuition + textbook;
    return { subjects, breakdown, subtotal, discountAmount, tuition, textbook, total };
  }, [selected, freq, discount]);

  function toggleSubject(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function copyEstimate() {
    if (calc.subjects.length === 0) {
      toast.error("과목을 선택해주세요");
      return;
    }
    const lines = [
      "=== 수강료 견적서 ===",
      "",
      `[과목] ${calc.subjects.map((s) => s.label).join(", ")}`,
      `[수업 횟수] ${freq.label}`,
      "",
      "--- 과목별 금액 ---",
      ...calc.breakdown.map((b) => `  ${b.label}: ${formatWon(b.adjusted)}`),
      "",
      `소계: ${formatWon(calc.subtotal)}`,
      discount.rate > 0
        ? `할인 (${discount.label} ${discount.rate * 100}%): -${formatWon(calc.discountAmount)}`
        : "할인: 없음",
      `수강료: ${formatWon(calc.tuition)}`,
      `교재비: ${formatWon(calc.textbook)} (${calc.subjects.length}과목 x ${formatWon(TEXTBOOK_PER_SUBJECT)})`,
      "",
      `총 예상 비용: ${formatWon(calc.total)}/월`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("견적서가 클립보드에 복사되었습니다");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">수강료 시뮬레이터</h1>
        <p className="text-muted-foreground text-sm">
          상담 중 빠르게 예상 수강료를 계산하세요
        </p>
      </div>

      {/* Subject selection */}
      <Card>
        <CardHeader>
          <CardTitle>과목 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS.map((s) => (
              <label
                key={s.key}
                className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selected.has(s.key)
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                    : "border-border hover:border-violet-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(s.key)}
                  onChange={() => toggleSubject(s.key)}
                  className="accent-violet-600 h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWon(s.price)}/월
                  </p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>주 횟수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {FREQUENCIES.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setFreqIdx(i)}
                className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                  freqIdx === i
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"
                    : "border-border hover:border-violet-300"
                }`}
              >
                {f.label}
                <span className="block text-xs text-muted-foreground mt-0.5">
                  x{f.multiplier}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discount */}
      <Card>
        <CardHeader>
          <CardTitle>할인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {DISCOUNTS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDiscountKey(d.key)}
                className={`rounded-lg border p-3 text-sm font-medium text-left transition-colors ${
                  discountKey === d.key
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"
                    : "border-border hover:border-violet-300"
                }`}
              >
                {d.label}
                {d.rate > 0 && (
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {d.rate * 100}% 할인
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <Card className="border-violet-200 dark:border-violet-800">
        <CardHeader>
          <CardTitle>계산 결과</CardTitle>
        </CardHeader>
        <CardContent>
          {calc.subjects.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              과목을 선택하면 계산 결과가 표시됩니다
            </p>
          ) : (
            <div className="space-y-4">
              {/* Breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  과목별 금액
                </p>
                {calc.breakdown.map((b) => (
                  <div key={b.label} className="flex justify-between text-sm">
                    <span>{b.label} ({freq.label})</span>
                    <span>{formatWon(b.adjusted)}</span>
                  </div>
                ))}
              </div>

              <hr />

              {/* Subtotals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>소계</span>
                  <span>{formatWon(calc.subtotal)}</span>
                </div>
                {discount.rate > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{discount.label} ({discount.rate * 100}%)</span>
                    <span>-{formatWon(calc.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>수강료</span>
                  <span className="font-medium">{formatWon(calc.tuition)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>교재비 ({calc.subjects.length}과목 x {formatWon(TEXTBOOK_PER_SUBJECT)})</span>
                  <span>{formatWon(calc.textbook)}</span>
                </div>
              </div>

              <hr />

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">총 예상 비용</span>
                <span className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                  {formatWon(calc.total)}
                  <span className="text-sm font-normal text-muted-foreground">/월</span>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Copy button */}
      <button
        onClick={copyEstimate}
        disabled={calc.subjects.length === 0}
        className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 transition-colors"
      >
        견적서 복사
      </button>
    </div>
  );
}

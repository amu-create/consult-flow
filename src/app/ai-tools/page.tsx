"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain,
  MessageSquare,
  Shield,
  Swords,
  Loader2,
  Copy,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
} from "lucide-react";

interface Lead {
  id: string;
  studentName: string;
  grade: string;
}

interface FollowUpResult {
  message: string;
  tone: string;
}

interface ChurnResult {
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  riskScore: number;
  reasons: string[];
  preventionActions: string[];
}

interface CoachingResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestedPhrases: string[];
  emotionalTone: string;
}

interface CompetitorResult {
  responses: string[];
  keyDifferentiators: string[];
  avoidSaying: string[];
}

function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/leads?page=1&pageSize=100")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
      })
      .catch(() => {
        toast.error("리드 목록을 불러오지 못했습니다.");
      });
  }, []);

  return leads;
}

// ─── Card 1: Follow-Up Message ───────────────────────────────────────────────

function FollowUpCard({ leads }: { leads: Lead[] }) {
  const [leadId, setLeadId] = useState("");
  const [channel, setChannel] = useState<"KAKAO" | "SMS">("KAKAO");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FollowUpResult | null>(null);

  const handleGenerate = async () => {
    if (!leadId) {
      toast.error("리드를 선택해주세요.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/follow-up-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, channel }),
      });
      if (!res.ok) throw new Error("메시지 생성에 실패했습니다.");
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.message);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          후속 메시지 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>리드 선택</Label>
          <Select value={leadId} onValueChange={(v) => v && setLeadId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="리드를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.studentName} ({lead.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>채널</Label>
          <Select value={channel} onValueChange={(v) => v && setChannel(v as "KAKAO" | "SMS")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KAKAO">카카오톡</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          메시지 생성
        </Button>

        {result && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{result.tone}</Badge>
            </div>
            <Textarea
              readOnly
              value={result.message}
              className="min-h-[120px] resize-none"
            />
            <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              복사
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 2: Churn Prediction ────────────────────────────────────────────────

function ChurnPredictionCard({ leads }: { leads: Lead[] }) {
  const [leadId, setLeadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChurnResult | null>(null);

  const handleAnalyze = async () => {
    if (!leadId) {
      toast.error("리드를 선택해주세요.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/churn-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (!res.ok) throw new Error("이탈 분석에 실패했습니다.");
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "default";
      default:
        return "secondary";
    }
  };

  const riskLabel = (level: string) => {
    switch (level) {
      case "HIGH":
        return "높음";
      case "MEDIUM":
        return "보통";
      case "LOW":
        return "낮음";
      default:
        return level;
    }
  };

  const riskBarColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-red-500";
      case "MEDIUM":
        return "bg-orange-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          이탈 예측
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>리드 선택</Label>
          <Select value={leadId} onValueChange={(v) => v && setLeadId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="리드를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.studentName} ({lead.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          이탈 위험 분석
        </Button>

        {result && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Badge variant={riskColor(result.riskLevel)}>
                위험도: {riskLabel(result.riskLevel)}
              </Badge>
              <span className="text-2xl font-bold">{result.riskScore}점</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>위험 점수</span>
                <span>{result.riskScore}/100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${riskBarColor(result.riskLevel)}`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                이탈 사유
              </p>
              <ul className="space-y-1">
                {result.reasons.map((reason, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">&#8226;</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                방지 조치
              </p>
              <ul className="space-y-1">
                {result.preventionActions.map((action, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 3: Coaching ────────────────────────────────────────────────────────

function CoachingCard() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachingResult | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("상담 내용을 입력해주세요.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationContent: content }),
      });
      if (!res.ok) throw new Error("코칭 분석에 실패했습니다.");
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          상담 코칭
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>상담 내용</Label>
          <Textarea
            placeholder="상담 내용을 붙여넣으세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          코칭 분석
        </Button>

        {result && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{result.overallScore}</div>
                <div className="text-xs text-muted-foreground">/10</div>
              </div>
              <Badge variant="secondary">{result.emotionalTone}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                강점
              </p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700 dark:text-green-400 flex items-start gap-2">
                    <span className="mt-0.5">&#8226;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                개선점
              </p>
              <ul className="space-y-1">
                {result.improvements.map((item, i) => (
                  <li key={i} className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-2">
                    <span className="mt-0.5">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-600">추천 표현</p>
              <div className="flex flex-wrap gap-2">
                {result.suggestedPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  >
                    {phrase}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 4: Competitor Response ─────────────────────────────────────────────

function CompetitorResponseCard() {
  const [competitorName, setCompetitorName] = useState("");
  const [parentConcern, setParentConcern] = useState("");
  const [ourStrengths, setOurStrengths] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorResult | null>(null);

  const handleGenerate = async () => {
    if (!competitorName.trim()) {
      toast.error("경쟁 학원명을 입력해주세요.");
      return;
    }
    if (!parentConcern.trim()) {
      toast.error("학부모 걱정 사항을 입력해주세요.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const body: Record<string, string> = { competitorName, parentConcern };
      if (ourStrengths.trim()) body.ourStrengths = ourStrengths;
      const res = await fetch("/api/ai/competitor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("대응 멘트 생성에 실패했습니다.");
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-amber-500" />
          경쟁사 대응
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>경쟁 학원명</Label>
          <Input
            placeholder="예: OO학원"
            value={competitorName}
            onChange={(e) => setCompetitorName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>학부모 걱정 사항</Label>
          <Textarea
            placeholder="학부모가 경쟁 학원에 대해 언급한 내용..."
            value={parentConcern}
            onChange={(e) => setParentConcern(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>우리 학원 강점 (선택)</Label>
          <Textarea
            placeholder="우리 학원의 차별화 포인트..."
            value={ourStrengths}
            onChange={(e) => setOurStrengths(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          대응 멘트 생성
        </Button>

        {result && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">대응 포인트</p>
              <ol className="space-y-2">
                {result.responses.map((response, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="font-semibold text-foreground shrink-0">{i + 1}.</span>
                    {response}
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">핵심 차별점</p>
              <div className="flex flex-wrap gap-2">
                {result.keyDifferentiators.map((diff, i) => (
                  <Badge key={i} variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {diff}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                피해야 할 표현
              </p>
              <ul className="space-y-1">
                {result.avoidSaying.map((item, i) => (
                  <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <span className="mt-0.5">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AIToolsPage() {
  const leads = useLeads();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 상담 도구</h1>
        <p className="text-muted-foreground mt-1">
          AI를 활용한 상담 지원 도구 모음
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FollowUpCard leads={leads} />
        <ChurnPredictionCard leads={leads} />
        <CoachingCard />
        <CompetitorResponseCard />
      </div>
    </div>
  );
}

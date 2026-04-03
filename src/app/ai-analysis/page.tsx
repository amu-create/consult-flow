"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Brain,
  Upload,
  Mic,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
} from "lucide-react";

interface AnalysisResult {
  transcript?: string;
  extractedText?: string;
  summary: string;
  keyPoints: string[];
  parentConcerns: string[];
  positiveSignals: string[];
  negativeSignals: string[];
  interestScore: number;
  conversionProbability: number;
  suggestedActions: string[];
  talkingPoints: string[];
  inputType: string;
}

export default function AiAnalysisPage() {
  const [mode, setMode] = useState<"text" | "image" | "audio">("text");
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (mode === "text" && !text.trim()) {
      toast.error("상담 내용을 입력해주세요.");
      return;
    }
    if ((mode === "image" || mode === "audio") && !file) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let res: Response;
      if (mode === "text") {
        // Text mode: send as JSON (avoids FormData issues on serverless)
        res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", text, context }),
        });
      } else {
        // File mode: send as FormData
        const formData = new FormData();
        formData.append("type", mode);
        if (file) formData.append("file", file);
        if (context) formData.append("context", context);
        res = await fetch("/api/ai/analyze", {
          method: "POST",
          body: formData,
        });
      }
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        toast.error(`서버 응답 오류 (${res.status}): ${responseText.slice(0, 200)}`);
        setLoading(false);
        return;
      }
      if (data.success) {
        setResult(data);
        toast.success("분석 완료!");
      } else {
        toast.error(data.error || "분석에 실패했습니다.", {
          description: data.detail ? String(data.detail).slice(0, 100) : undefined,
        });
      }
    } catch (err) {
      toast.error("서버 오류: " + String(err));
    }
    setLoading(false);
  }

  function getScoreColor(score: number) {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  }

  function getProbColor(prob: number) {
    if (prob >= 70) return "bg-green-500";
    if (prob >= 40) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 상담 분석</h1>
        <p className="text-muted-foreground text-sm mt-1">
          상담 내용을 텍스트, 카톡 캡처, 또는 음성으로 올리면 AI가 분석합니다.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { setMode("text"); setFile(null); }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            mode === "text"
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm font-medium">텍스트 입력</span>
          <span className="text-xs text-muted-foreground">상담 내용 직접 입력</span>
        </button>
        <button
          onClick={() => { setMode("image"); setText(""); }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            mode === "image"
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-sm font-medium">카톡 캡처</span>
          <span className="text-xs text-muted-foreground">대화 스크린샷 업로드</span>
        </button>
        <button
          onClick={() => { setMode("audio"); setText(""); }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            mode === "audio"
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Mic className="h-6 w-6" />
          <span className="text-sm font-medium">음성 녹음</span>
          <span className="text-xs text-muted-foreground">통화 녹음 파일 업로드</span>
        </button>
      </div>

      {/* Input Area */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {mode === "text" && (
            <div>
              <Label>상담 내용</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="전화 통화 내용, 카카오톡 대화, 방문 상담 메모 등을 붙여넣으세요...&#10;&#10;예시:&#10;학부모: 수학 학원 알아보고 있는데요, 중2 아들이에요.&#10;상담사: 네, 현재 수학 성적은 어느 정도인가요?&#10;학부모: 중간고사 75점이었어요. 좀 올리고 싶어서요."
              />
            </div>
          )}

          {mode === "image" && (
            <div>
              <Label>카카오톡 대화 캡처 이미지</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
              >
                {file ? (
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto text-violet-500 mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)}KB</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (최대 10MB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {mode === "audio" && (
            <div>
              <Label>통화 녹음 파일</Label>
              <div
                onClick={() => audioRef.current?.click()}
                className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
              >
                {file ? (
                  <div className="text-center">
                    <Mic className="h-8 w-8 mx-auto text-violet-500 mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">클릭하여 음성 파일 업로드</p>
                    <p className="text-xs text-gray-400">MP3, WAV, M4A, WEBM (최대 25MB)</p>
                  </>
                )}
              </div>
              <input
                ref={audioRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          <div>
            <Label>학생 정보 (선택)</Label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="예: 김민수, 중2, 수학"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> AI 분석 중...</>
            ) : (
              <><Brain className="h-5 w-5 mr-2" /> AI 분석 시작</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-violet-200">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">관심도 점수</p>
                <p className={`text-4xl font-bold ${getScoreColor(result.interestScore)}`}>
                  {result.interestScore}<span className="text-lg text-muted-foreground">/10</span>
                </p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${getProbColor(result.interestScore * 10)}`}
                    style={{ width: `${result.interestScore * 10}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border-violet-200">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">등록 전환 가능성</p>
                <p className={`text-4xl font-bold ${getScoreColor(result.conversionProbability / 10)}`}>
                  {result.conversionProbability}<span className="text-lg text-muted-foreground">%</span>
                </p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${getProbColor(result.conversionProbability)}`}
                    style={{ width: `${result.conversionProbability}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extracted Text (for image/audio) */}
          {result.extractedText && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  추출된 텍스트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                  {result.extractedText}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          {result.transcript && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  정리된 대화 내용
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{result.transcript}</p>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="border-violet-200 bg-violet-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-violet-800">
                <Brain className="h-4 w-4" />
                AI 분석 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{result.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keyPoints.map((p, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signals Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Parent Concerns */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  학부모 관심/걱정 사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {result.parentConcerns.map((c, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">-</span> {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Positive Signals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  긍정 신호
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {result.positiveSignals.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Negative Signals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  부정 신호
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {result.negativeSignals.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Suggested Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  추천 후속 조치
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {result.suggestedActions.map((a, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="rounded-full bg-blue-100 text-blue-700 text-xs w-5 h-5 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Talking Points */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                <Lightbulb className="h-4 w-4" />
                다음 상담 시 추천 멘트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.talkingPoints.map((t, i) => (
                  <li key={i} className="text-sm bg-white rounded-lg p-2.5 border border-blue-100">
                    &ldquo;{t}&rdquo;
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

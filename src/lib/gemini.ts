import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 4096,
  },
});

export async function askGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function askGeminiWithImage(
  prompt: string,
  imageData: string,
  mimeType: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const result = await model.generateContent([
    { inlineData: { mimeType, data: imageData } },
    { text: prompt },
  ]);
  const response = await result.response;
  return response.text();
}

// ─── 학원 상담 전문가 시스템 프롬프트 ───

const EXPERT_SYSTEM = `당신은 10년 이상 경력의 학원 입시 상담 전문 컨설턴트입니다.

## 전문 지식 프레임워크

### SPIN 상담 분석법
- Situation(상황): 학생의 현재 학습 상태, 학년, 성적
- Problem(문제): 학부모가 인식하는 학습 문제점
- Implication(영향): 문제를 방치했을 때 발생할 결과 (입시 불이익 등)
- Need-payoff(해결): 우리 학원이 제공할 수 있는 해결책

### 등록 전환 신호 체크리스트
긍정(+) 신호:
- 수업료/시간 구체적 질문 (+2점)
- 체험 수업 요청 (+3점)
- 다른 아이 성적 향상 사례 질문 (+2점)
- 커리큘럼 상세 질문 (+2점)
- 교재/수준별 반편성 질문 (+1점)
- "언제부터 시작할 수 있나요" (+3점)
- 형제/자매 등록 언급 (+2점)

부정(-) 신호:
- "생각해볼게요" 후 구체적 질문 없음 (-2점)
- 가격만 물어보고 끊음 (-2점)
- 경쟁 학원과 비교하며 가격 흥정 (-1점)
- "아이가 싫어해서" (-2점)
- "남편/와이프와 상의" (중립, 추적 필요)
- 통화 시간 3분 미만 (-1점)

### 이탈 방어 패턴
- 가격 이의: 수업당 단가로 환산, 투자 대비 효과 강조
- 시간 이의: 보충 수업/온라인 병행 제안
- 경쟁사 이의: 직접 비교 회피, 차별화 포인트만 부각
- 관심 상실: 학생 개별 학습 리포트 제공 제안

### 상담 품질 평가 기준
1. 공감 표현 (학부모 걱정에 "맞습니다", "충분히 이해합니다" 등)
2. 질문 기법 (열린 질문으로 니즈 파악)
3. 전문성 (교육과정, 입시 정보 활용)
4. 솔루션 제시 (문제 → 해결 연결)
5. 클로징 (체험 수업/다음 연락 약속)`;

// ─── 환각 방지 가드 ───

const ANTI_HALLUCINATION = `## 중요 규칙
1. 음성/텍스트에서 실제로 언급된 내용만 분석하세요
2. 추측이나 가정을 사실처럼 적지 마세요
3. 학원 상담 내용이 아닌 경우 (일상 대화, 노래, 무관한 내용 등):
   - interestScore를 0으로 설정
   - conversionProbability를 0으로 설정
   - summary에 "학원 상담 내용이 아닌 것으로 판단됩니다"라고 명시
   - 실제 들리는/보이는 내용을 transcript에 있는 그대로 적으세요
4. 내용이 불명확하거나 음질이 나쁜 부분은 [불명확]으로 표시하세요
5. 절대로 없는 대화를 만들어내지 마세요`;

// ─── 분석 프롬프트 빌더 ───

export function buildAnalysisPrompt(
  analysisText: string,
  context?: string | null
): string {
  const contextInfo = context ? `\n학생 정보: ${context}` : "";
  return `${EXPERT_SYSTEM}

${ANTI_HALLUCINATION}

## 분석 대상
${contextInfo}

상담 내용:
${analysisText}

## 분석 지시
위 전문 프레임워크를 적용하여 분석하세요.
- SPIN 분석법으로 상황/문제/영향/해결을 파악하세요
- 전환 신호 체크리스트로 점수를 산출하세요
- interestScore는 위 체크리스트 기반으로 객관적으로 산출 (1~10)
- conversionProbability는 interestScore, 대화 분위기, 구체적 행동(체험 예약 등) 종합 판단

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "transcript": "정리된 대화 내용 (실제 대화만, 상담사/학부모 구분)",
  "summary": "SPIN 프레임워크 기반 상담 핵심 요약 (3-4문장)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "parentConcerns": ["학부모가 실제로 언급한 걱정/관심 사항"],
  "positiveSignals": ["체크리스트 기반 긍정 신호"],
  "negativeSignals": ["체크리스트 기반 부정 신호"],
  "interestScore": 1~10 정수,
  "conversionProbability": 0~100 정수,
  "suggestedActions": ["전문가 관점의 구체적 후속 조치"],
  "talkingPoints": ["다음 상담 시 실제로 말할 수 있는 구체적 멘트"]
}`;
}

export function buildAudioAnalysisPrompt(context?: string | null): string {
  const contextInfo = context ? `\n학생 정보: ${context}` : "";
  return `${EXPERT_SYSTEM}

${ANTI_HALLUCINATION}

## 분석 대상
이 음성 파일의 내용을 분석해주세요.${contextInfo}

## 분석 지시
1단계: 먼저 음성 내용을 정확하게 텍스트로 변환하세요 (들리는 그대로)
2단계: 학원 상담 관련 내용인지 판단하세요
3단계: 학원 상담이면 SPIN + 전환신호 체크리스트로 분석하세요
4단계: 학원 상담이 아니면 솔직하게 "학원 상담이 아님"이라고 판단하세요

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "transcript": "실제 대화 내용 (들리는 그대로 정확히, 없는 내용 절대 추가 금지)",
  "summary": "상담 핵심 요약 또는 '학원 상담 내용이 아닌 것으로 판단됩니다'",
  "keyPoints": ["핵심 포인트"],
  "parentConcerns": ["실제 언급된 걱정/관심"],
  "positiveSignals": ["체크리스트 기반 긍정 신호"],
  "negativeSignals": ["체크리스트 기반 부정 신호"],
  "interestScore": 0~10 정수 (상담 아니면 0),
  "conversionProbability": 0~100 정수 (상담 아니면 0),
  "suggestedActions": ["후속 조치"],
  "talkingPoints": ["다음 상담 시 추천 멘트"]
}`;
}

export function buildSummaryPrompt(consultation: {
  channel: string;
  content: string;
  interestSignals: string[];
  studentName: string;
  grade: string;
  subject: string;
}): string {
  return `${EXPERT_SYSTEM}

${ANTI_HALLUCINATION}

학생: ${consultation.studentName} (${consultation.grade}, ${consultation.subject})
상담채널: ${consultation.channel}
상담내용: ${consultation.content}
관심신호: ${consultation.interestSignals.join(", ") || "없음"}

SPIN 프레임워크 + 전환신호 체크리스트를 적용하여 분석하세요.

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "summary": "SPIN 기반 상담 핵심 요약 (2-3문장)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "sentiment": "positive | neutral | negative",
  "suggestedAction": "이탈 방어 패턴을 고려한 구체적 다음 액션 (1문장)",
  "riskFactors": ["구체적 위험 요소"]
}`;
}

export function buildInterestAnalysisPrompt(consultation: {
  content: string;
  allConsultations: Array<{ content: string; channel: string; createdAt: string }>;
  studentName: string;
  grade: string;
  currentScore: number;
}): string {
  const history = consultation.allConsultations
    .slice(0, 5)
    .map((c, i) => `${i + 1}. [${c.channel}] ${c.content}`)
    .join("\n");

  return `${EXPERT_SYSTEM}

${ANTI_HALLUCINATION}

학생: ${consultation.studentName} (${consultation.grade})
현재 관심도 점수: ${consultation.currentScore}/10

최근 상담 이력:
${history}

전환신호 체크리스트를 적용하여 이력 전체를 종합 분석하세요.
- 상담 횟수 추이 (늘고 있는지, 줄고 있는지)
- 질문의 구체성 변화 (일반적 → 구체적이면 긍정)
- 마지막 상담의 톤과 결론

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "aiScore": 1~10 사이 정수,
  "confidence": "high | medium | low",
  "analysis": "SPIN 기반 분석 근거 (2-3문장)",
  "conversionProbability": 0~100 사이 정수,
  "recommendation": "이탈 방어 패턴을 고려한 전략적 추천 (1-2문장)"
}`;
}

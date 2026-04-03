import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 2048,
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

export function buildSummaryPrompt(consultation: {
  channel: string;
  content: string;
  interestSignals: string[];
  studentName: string;
  grade: string;
  subject: string;
}): string {
  return `당신은 학원 상담 관리 전문가입니다. 다음 상담 기록을 분석해서 JSON으로 응답하세요.

학생: ${consultation.studentName} (${consultation.grade}, ${consultation.subject})
상담채널: ${consultation.channel}
상담내용: ${consultation.content}
관심신호: ${consultation.interestSignals.join(", ") || "없음"}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "summary": "상담 핵심 요약 (2-3문장)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "sentiment": "positive | neutral | negative",
  "suggestedAction": "추천 다음 액션 (1문장)",
  "riskFactors": ["위험 요소가 있다면 나열"]
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

  return `당신은 학원 상담 데이터 분석 전문가입니다. 상담 이력을 보고 학부모의 등록 가능성을 분석하세요.

학생: ${consultation.studentName} (${consultation.grade})
현재 관심도 점수: ${consultation.currentScore}/10

최근 상담 이력:
${history}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "aiScore": 1~10 사이 정수 (등록 가능성),
  "confidence": "high | medium | low",
  "analysis": "분석 근거 (2-3문장)",
  "conversionProbability": "0~100 사이 정수 (%)",
  "recommendation": "상담사에게 추천하는 전략 (1-2문장)"
}`;
}

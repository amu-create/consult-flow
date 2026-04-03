import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { askGemini, askGeminiWithImage, buildAnalysisPrompt } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let type = "text";
    let text: string | null = null;
    let file: File | null = null;
    let context: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      type = json.type || "text";
      text = json.text || null;
      context = json.context || null;
    } else {
      const formData = await request.formData();
      type = (formData.get("type") as string) || "text";
      text = formData.get("text") as string | null;
      file = formData.get("file") as File | null;
      context = formData.get("context") as string | null;
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    let analysisText = "";

    if (type === "text" && text) {
      analysisText = text;
    } else if (type === "image" && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";

      analysisText = await askGeminiWithImage(
        `이 이미지는 카카오톡 또는 메신저 대화 캡처입니다.
1. 대화 내용을 그대로 텍스트로 추출해주세요. 발화자와 내용을 구분해서 작성하세요.
2. 학원 상담과 무관한 이미지면 "학원 상담 관련 이미지가 아닙니다"라고 말하세요.
3. 보이는 내용만 추출하고, 없는 내용을 만들어내지 마세요.`,
        base64,
        mimeType
      );

      if (!analysisText) {
        return Response.json({ error: "이미지에서 텍스트를 추출할 수 없습니다." }, { status: 400 });
      }
    } else if (type === "audio" && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "audio/webm";

      analysisText = await askGeminiWithImage(
        `이 음성 파일의 내용을 정확하게 텍스트로 변환해주세요.
1. 들리는 내용을 그대로 적으세요. 없는 내용을 만들어내지 마세요.
2. 대화가 있으면 화자를 구분해서 작성하세요.
3. 학원 상담이 아닌 내용이면 그대로 적고 "학원 상담이 아님"이라고 명시하세요.`,
        base64,
        mimeType
      );

      if (!analysisText) {
        return Response.json({ error: "음성에서 텍스트를 추출할 수 없습니다." }, { status: 400 });
      }
    } else {
      return Response.json({ error: "텍스트, 이미지, 또는 음성 파일을 입력해주세요." }, { status: 400 });
    }

    const prompt = buildAnalysisPrompt(analysisText, context);

    const raw = await askGemini(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "AI 응답 파싱 실패", detail: cleaned.slice(0, 500) }, { status: 500 });
    }

    return Response.json({
      success: true,
      inputType: type,
      extractedText: type !== "text" ? analysisText : undefined,
      ...result,
    });
  } catch (err) {
    console.error("[ai-analyze] error:", err);
    return Response.json(
      { error: String(err).includes("quota") ? "API 할당량 초과. 잠시 후 다시 시도해주세요." : "AI 분석에 실패했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}

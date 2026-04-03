import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

// Step 1: Client calls this to get an upload URL
// Step 2: Client uploads directly to Google
// Step 3: Client calls /api/ai/analyze-audio with the file URI

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const { fileName, mimeType, fileSize } = await request.json();

    // Initiate resumable upload to Gemini File API
    const res = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": String(fileSize),
          "X-Goog-Upload-Header-Content-Type": mimeType,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: { displayName: fileName },
        }),
      }
    );

    const uploadUrl = res.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl) {
      const text = await res.text();
      console.error("[upload-audio] no upload URL:", text);
      return Response.json({ error: "업로드 URL 생성 실패", detail: text }, { status: 500 });
    }

    return Response.json({ uploadUrl });
  } catch (err) {
    console.error("[upload-audio] error:", err);
    return Response.json({ error: "업로드 초기화 실패", detail: String(err) }, { status: 500 });
  }
}

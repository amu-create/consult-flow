import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kakaoToken = request.cookies.get("cf_kakao_token")?.value;
  console.log("[kakao-me] token exists:", !!kakaoToken, "token length:", kakaoToken?.length);

  if (!kakaoToken) {
    return Response.json(
      { error: "카카오 로그인이 필요합니다. 로그아웃 후 카카오 로그인으로 다시 접속해주세요." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const message = body?.message;
  if (!message) {
    return Response.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  try {
    const templateObject = JSON.stringify({
      object_type: "text",
      text: message,
      link: {
        web_url: process.env.NEXT_PUBLIC_BASE_URL || "https://consult-flow-app.vercel.app",
        mobile_web_url: process.env.NEXT_PUBLIC_BASE_URL || "https://consult-flow-app.vercel.app",
      },
      button_title: "ConsultFlow 열기",
    });

    console.log("[kakao-me] sending message, template:", templateObject.substring(0, 100));

    const res = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ template_object: templateObject }),
    });

    const responseText = await res.text();
    console.log("[kakao-me] kakao response status:", res.status, "body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return Response.json({ error: `카카오 응답 파싱 실패: ${responseText}` }, { status: 500 });
    }

    if (data.result_code === 0) {
      return Response.json({ success: true, message: "카카오톡으로 전송되었습니다." });
    }

    return Response.json(
      { error: data.msg || `카카오 에러 (code: ${data.code || data.result_code})`, detail: data },
      { status: 400 }
    );
  } catch (err) {
    console.error("[kakao-me] error:", err);
    return Response.json({ error: "카카오 메시지 전송 중 오류: " + String(err) }, { status: 500 });
  }
}

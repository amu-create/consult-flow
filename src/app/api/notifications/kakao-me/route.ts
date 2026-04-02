import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kakaoToken = request.cookies.get("cf_kakao_token")?.value;
  if (!kakaoToken) {
    return Response.json(
      { error: "카카오 로그인이 필요합니다. 카카오로 로그인 후 다시 시도해주세요." },
      { status: 400 }
    );
  }

  const { message } = await request.json();
  if (!message) {
    return Response.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  try {
    const res = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        template_object: JSON.stringify({
          object_type: "text",
          text: message,
          link: {
            web_url: process.env.NEXT_PUBLIC_BASE_URL || "https://consult-flow-amu-creates-projects.vercel.app",
            mobile_web_url: process.env.NEXT_PUBLIC_BASE_URL || "https://consult-flow-amu-creates-projects.vercel.app",
          },
          button_title: "ConsultFlow 열기",
        }),
      }),
    });

    const data = await res.json();

    if (data.result_code === 0) {
      return Response.json({ success: true, message: "카카오톡으로 전송되었습니다." });
    }

    return Response.json(
      { error: data.msg || "카카오 메시지 전송 실패", detail: data },
      { status: 400 }
    );
  } catch (err) {
    console.error("Kakao message error:", err);
    return Response.json({ error: "카카오 메시지 전송 중 오류" }, { status: 500 });
  }
}

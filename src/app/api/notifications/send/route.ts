import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY;
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET;

function getSolapiAuth() {
  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) return null;

  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const signature = crypto
    .createHmac("sha256", SOLAPI_API_SECRET)
    .update(date + salt)
    .digest("hex");

  return `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, text, type = "SMS" } = await request.json();

  if (!to || !text) {
    return Response.json({ error: "수신번호와 내용을 입력해주세요." }, { status: 400 });
  }

  const auth = getSolapiAuth();
  if (!auth) {
    return Response.json(
      { error: "Solapi API 키가 설정되지 않았습니다.", mock: true },
      { status: 400 }
    );
  }

  try {
    const phone = to.replace(/-/g, "");

    const res = await fetch("https://api.solapi.com/messages/v4/send-many/detail", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            to: phone,
            from: process.env.SOLAPI_SENDER_NUMBER || phone,
            type,
            text,
          },
        ],
      }),
    });

    const responseText = await res.text();
    console.log("[solapi] status:", res.status, "body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return Response.json({ error: `Solapi 응답 파싱 실패: ${responseText}` }, { status: 500 });
    }

    if (res.ok) {
      // Check for individual message failures
      const failed = data.failedMessageList || [];
      if (failed.length > 0) {
        console.log("[solapi] failed messages:", JSON.stringify(failed));
        return Response.json({
          success: false,
          error: `발송 실패: ${failed[0]?.statusMessage || JSON.stringify(failed[0])}`,
          detail: data
        });
      }
      return Response.json({ success: true, data });
    }

    return Response.json({ error: data.errorMessage || "발송 실패", detail: data }, { status: 400 });
  } catch (err) {
    console.error("Solapi send error:", err);
    return Response.json({ error: "SMS 발송 중 오류" }, { status: 500 });
  }
}

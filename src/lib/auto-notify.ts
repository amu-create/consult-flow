import crypto from "crypto";

const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY;
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET;
const SOLAPI_SENDER_NUMBER = process.env.SOLAPI_SENDER_NUMBER;

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

const STATUS_MESSAGES: Record<string, string> = {
  TRIAL_BOOKED: "[ConsultFlow] {studentName} 학생의 체험 수업이 예약되었습니다. 일정을 확인해주세요.",
  TRIAL_DONE: "[ConsultFlow] {studentName} 학생의 체험 수업이 완료되었습니다. 등록 안내를 진행해주세요.",
  REGISTERED: "[ConsultFlow] {studentName} 학생이 등록 완료되었습니다. 감사합니다!",
  DROPPED: "[ConsultFlow] {studentName} 학생이 이탈 처리되었습니다. 재연락 여부를 확인해주세요.",
};

export async function sendAutoNotification(params: {
  toStatus: string;
  studentName: string;
  parentPhone: string;
}): Promise<{ sent: boolean; error?: string }> {
  const template = STATUS_MESSAGES[params.toStatus];
  if (!template) return { sent: false, error: "no_template" };

  const auth = getSolapiAuth();
  if (!auth || !SOLAPI_SENDER_NUMBER) {
    return { sent: false, error: "sms_not_configured" };
  }

  const message = template.replace("{studentName}", params.studentName);
  const phone = params.parentPhone.replace(/-/g, "");

  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send-many/detail", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ to: phone, from: SOLAPI_SENDER_NUMBER, type: "SMS", text: message }],
      }),
    });

    const data = await res.json();
    const failed = data.failedMessageList || [];
    if (failed.length > 0) {
      console.log("[auto-notify] SMS failed:", JSON.stringify(failed));
      return { sent: false, error: failed[0]?.statusMessage || "send_failed" };
    }

    console.log("[auto-notify] SMS sent to", phone, "for status", params.toStatus);
    return { sent: true };
  } catch (err) {
    console.error("[auto-notify] error:", err);
    return { sent: false, error: String(err) };
  }
}

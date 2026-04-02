import { NextRequest } from "next/server";

const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://consult-flow-amu-creates-projects.vercel.app";
const REDIRECT_URI = `${BASE_URL}/api/auth/kakao/callback`;

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect") || "/dashboard";

  const params = new URLSearchParams({
    client_id: KAKAO_REST_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "talk_message",
    state: redirect,
  });

  return Response.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
}

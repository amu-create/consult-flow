import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://consult-flow-amu-creates-projects.vercel.app";
const REDIRECT_URI = `${BASE_URL}/api/auth/kakao/callback`;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function encodeToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  return Buffer.from(payload).toString("base64url");
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("redirect") || request.nextUrl.searchParams.get("state") || "/dashboard";
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=kakao_denied`, BASE_URL));
  }

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KAKAO_REST_KEY,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL(`/login?error=kakao_token_fail`, BASE_URL));
    }

    // 2. Get user info
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const kakaoUser = await userRes.json();

    const kakaoId = String(kakaoUser.id);
    const nickname = kakaoUser.properties?.nickname || kakaoUser.kakao_account?.profile?.nickname || "카카오 사용자";
    const email = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@consultflow.kr`;

    // 3. Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPw = crypto.randomBytes(32).toString("hex");
      user = await prisma.user.create({
        data: {
          name: nickname,
          email,
          password: await bcrypt.hash(randomPw, 10),
          role: "STAFF",
        },
      });
    }

    // 4. Set session cookie
    const token = encodeToken(user.id);
    const response = NextResponse.redirect(new URL(state, BASE_URL));

    response.cookies.set("cf_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    // 5. Store Kakao access token for "나에게 보내기"
    response.cookies.set("cf_kakao_token", tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: tokenData.expires_in || 21599,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Kakao OAuth error:", err);
    return NextResponse.redirect(new URL(`/login?error=kakao_error`, BASE_URL));
  }
}

import { NextRequest } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const user = await login(email, password);
  if (!user) {
    return Response.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  return Response.json(user);
}

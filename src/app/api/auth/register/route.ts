import { NextRequest } from "next/server";
import { register } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return Response.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
  }

  const user = await register(name, email, password);
  if (!user) {
    return Response.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
  }

  return Response.json(user, { status: 201 });
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const kakaoError = searchParams.get("error");
  const [error, setError] = useState(kakaoError ? `카카오 로그인 실패: ${kakaoError}` : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              CF
            </div>
          </div>
          <h1 className="text-2xl font-bold">ConsultFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">학원 상담 전환 OS</p>
        </div>

        {/* Kakao Login */}
        <a
          href={`/api/auth/kakao?redirect=${encodeURIComponent(redirect)}`}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] hover:bg-[#FDD835] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#191919" d="M9 1C4.582 1 1 3.877 1 7.393c0 2.227 1.474 4.18 3.693 5.292l-.937 3.426a.246.246 0 0 0 .37.274l3.89-2.574c.32.03.645.048.984.048 4.418 0 8-2.877 8-6.466C17 3.877 13.418 1 9 1"/></svg>
          카카오 로그인
        </a>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="owner@consultflow.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            회원가입
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">데모 계정</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span>원장: owner@consultflow.kr</span>
            <span>비밀번호: demo1234</span>
            <span>실장: manager@consultflow.kr</span>
            <span>비밀번호: demo1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}

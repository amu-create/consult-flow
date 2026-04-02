"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">오류가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "페이지를 불러오는 중 문제가 발생했습니다."}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}

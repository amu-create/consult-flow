"use client";

import { usePathname } from "next/navigation";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = pathname === "/" || pathname === "/login" || pathname === "/register";

  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <main className="md:ml-56 min-h-screen">
      <div className="p-4 md:p-6">{children}</div>
    </main>
  );
}

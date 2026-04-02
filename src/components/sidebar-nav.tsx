"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  Columns3,
  Menu,
  X,
  BookOpen,
  Moon,
  Sun,
  LogOut,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/leads", label: "리드 관리", icon: Users },
  { href: "/leads/kanban", label: "파이프라인", icon: Columns3 },
  { href: "/tasks", label: "할 일", icon: ClipboardList },
  { href: "/analytics", label: "분석", icon: BarChart3 },
  { href: "/notifications", label: "알림 설정", icon: Bell },
  { href: "/demo-guide", label: "데모 가이드", icon: BookOpen },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "원장",
  MANAGER: "실장",
  STAFF: "직원",
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
      <span className="dark:hidden">다크 모드</span>
      <span className="hidden dark:block">라이트 모드</span>
    </button>
  );
}

function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold" onClick={onNavigate}>
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            CF
          </div>
          <span className="text-sm">ConsultFlow</span>
        </Link>
      </div>
      <nav className="space-y-1 p-3 flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/leads"
              ? pathname === "/leads" ||
                (pathname.startsWith("/leads/") && !pathname.startsWith("/leads/kanban"))
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 space-y-1">
        <ThemeToggle />
        {user && (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide sidebar on landing, login, register pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register") return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r bg-card hidden md:block">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
            CF
          </div>
          <span className="text-sm">ConsultFlow</span>
        </Link>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-56 bg-card shadow-lg md:hidden">
            <div className="absolute right-2 top-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChartSquare02,
  Building07,
  UserPlus01,
  Users01,
  GraduationHat02,
  BookOpen01,
  Award01,
  FileCheck02,
  Wallet02,
  MessageChatCircle,
  User01,
  Key01,
  LogOut01,
  Menu01,
  XClose,
  BookClosed,
} from "@untitledui/icons";
import { cn } from "@/lib/format";
import type { Role } from "@prisma/client";

export type NavIconName =
  | "dashboard"
  | "schools"
  | "onboarding"
  | "classes"
  | "students"
  | "staff"
  | "subjects"
  | "grading"
  | "results"
  | "finance"
  | "messages"
  | "profile"
  | "password";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

const ICONS: Record<NavIconName, React.ComponentType<{ className?: string }>> = {
  dashboard: BarChartSquare02,
  schools: Building07,
  onboarding: UserPlus01,
  classes: BookClosed,
  students: GraduationHat02,
  staff: Users01,
  subjects: BookOpen01,
  grading: Award01,
  results: FileCheck02,
  finance: Wallet02,
  messages: MessageChatCircle,
  profile: User01,
  password: Key01,
};

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  SCHOOL_ADMIN: "School Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

interface PortalShellProps {
  role: Role;
  fullName: string;
  identifier: string;
  schoolName?: string | null;
  navGroups: NavGroup[];
  children: React.ReactNode;
}

export function PortalShell({
  role,
  fullName,
  identifier,
  schoolName,
  navGroups,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const initials = React.useMemo(() => {
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [fullName]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const renderNav = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col justify-between bg-white">
      <div className="space-y-6 overflow-y-auto px-4 py-5">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white uui-shadow-skeuomorphic">
            <GraduationHat02 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-[#0F172A] truncate">
              Kidstack
            </p>
            <p className="text-xs font-medium text-[#475569] truncate">
              {schoolName || "Platform Console"}
            </p>
          </div>
        </div>

        <nav aria-label="Primary Navigation" className="space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.title && (
                <p className="px-3 pb-1 text-xs font-semibold text-[#64748B]">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = ICONS[item.icon];
                const isActive =
                  item.href === pathname ||
                  (item.href !== "/admin" &&
                    item.href !== "/super-admin" &&
                    item.href !== "/teacher" &&
                    item.href !== "/student" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-[40px] items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
                      isActive
                        ? "bg-[#F8FAFC] text-[#1D4ED8] ring-1 ring-inset ring-[#E2E8F0]"
                        : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-[#2563EB]" : "text-[#64748B]"
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Untitled UI Sidebar Account Card */}
      <div className="border-t border-[#E2E8F0] p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-3 ring-1 ring-inset ring-[#E2E8F0]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-semibold text-[#1D4ED8] ring-1 ring-inset ring-[#BFDBFE]">
              {initials || "KS"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{fullName}</p>
              <p className="text-xs text-[#475569] truncate">
                {ROLE_LABELS[role]} · {identifier}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign Out"
            aria-label="Sign Out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#475569] hover:bg-white hover:text-[#D92D20] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20]"
          >
            <LogOut01 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-[272px] lg:shrink-0 lg:flex-col border-r border-[#E2E8F0] bg-white">
        {renderNav()}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white border-r border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F8FAFC]"
            >
              <XClose className="h-5 w-5" />
            </button>
            {renderNav(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ring-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] lg:hidden"
            >
              <Menu01 className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#1D4ED8] ring-1 ring-inset ring-[#BFDBFE]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" aria-hidden="true" />
                {ROLE_LABELS[role]} Portal
              </span>
              {schoolName && (
                <span className="hidden sm:inline text-xs font-medium text-[#475569]">
                  · {schoolName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#475569]">
            <span className="hidden sm:inline font-medium text-[#0F172A]">{fullName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

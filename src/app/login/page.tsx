"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  GraduationHat02,
  Eye,
  EyeOff,
  ShieldTick,
  Users01,
  BookOpen01,
} from "@untitledui/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/format";

type LoginType = "STUDENT" | "TEACHER" | "ADMIN";

const TABS: Array<{
  id: LoginType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "STUDENT", label: "Student", icon: GraduationHat02 },
  { id: "TEACHER", label: "Teacher", icon: BookOpen01 },
  { id: "ADMIN", label: "Admin", icon: ShieldTick },
];

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = React.useState<LoginType>("STUDENT");
  const [schoolCode, setSchoolCode] = React.useState("GWA");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType,
          schoolCode: loginType === "ADMIN" ? undefined : schoolCode,
          identifier,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed.");
        return;
      }
      router.push(data.redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type: LoginType, id: string, pass: string, code = "GWA") {
    setLoginType(type);
    setSchoolCode(code);
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-2.5">
            <GraduationHat02 className="h-6 w-6 text-[#2563EB]" aria-hidden="true" />
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
              Sign in to Kidstack
            </h1>
          </div>
          <p className="text-sm text-[#475569] text-pretty">
            School portal for Students, Teachers &amp; Administrators
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Untitled UI Horizontal Button Group / Tabs */}
            <div
              role="tablist"
              aria-label="Login role"
              className="grid grid-cols-3 gap-1 rounded-lg bg-[#F8FAFC] p-1 ring-1 ring-inset ring-[#E2E8F0]"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = loginType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setLoginType(tab.id);
                      setError(null);
                    }}
                    className={cn(
                      "flex min-h-[36px] items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
                      active
                        ? "bg-white text-[#0F172A] uui-shadow-xs ring-1 ring-inset ring-[#E2E8F0]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-[#FEF3F2] px-3.5 py-2.5 text-sm font-medium text-[#B42318] ring-1 ring-inset ring-[#FECDCA]"
                >
                  {error}
                </div>
              )}

              {loginType !== "ADMIN" && (
                <Input
                  label="School Code"
                  placeholder="e.g. GWA"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  required
                />
              )}

              <Input
                label={
                  loginType === "STUDENT"
                    ? "Admission Number"
                    : loginType === "TEACHER"
                    ? "Staff ID"
                    : "Email Address"
                }
                type={loginType === "ADMIN" ? "email" : "text"}
                placeholder={
                  loginType === "STUDENT"
                    ? "e.g. GWA-2026-001"
                    : loginType === "TEACHER"
                    ? "e.g. TCH-001"
                    : "e.g. admin@greenwood.edu.ng"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete={loginType === "ADMIN" ? "email" : "username"}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-[28px] flex h-9 w-9 items-center justify-center rounded-lg text-[#475569] hover:text-[#0F172A] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Quick-Fill */}
        <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-[#E2E8F0] uui-shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
            <Users01 className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
            <span>Demo Accounts (Click to Autofill)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("ADMIN", "superadmin@kidstack.io", "SuperAdmin123!")}
              className="min-h-[38px] rounded-lg px-2.5 py-1.5 text-left text-xs ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <span className="block font-semibold text-[#0F172A]">Super Admin</span>
              <span className="text-[#475569]">superadmin@kidstack.io</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("ADMIN", "admin@greenwood.edu.ng", "Admin123!")}
              className="min-h-[38px] rounded-lg px-2.5 py-1.5 text-left text-xs ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <span className="block font-semibold text-[#0F172A]">School Admin</span>
              <span className="text-[#475569]">admin@greenwood.edu.ng</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("TEACHER", "TCH-001", "Teacher123!", "GWA")}
              className="min-h-[38px] rounded-lg px-2.5 py-1.5 text-left text-xs ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <span className="block font-semibold text-[#0F172A]">Teacher</span>
              <span className="text-[#475569]">GWA · TCH-001</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("STUDENT", "GWA-2026-001", "Student123!", "GWA")}
              className="min-h-[38px] rounded-lg px-2.5 py-1.5 text-left text-xs ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <span className="block font-semibold text-[#0F172A]">Student</span>
              <span className="text-[#475569]">GWA · GWA-2026-001</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

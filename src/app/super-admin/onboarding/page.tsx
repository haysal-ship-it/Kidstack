"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Building2, BookOpen, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GRADING_PRESETS } from "@/lib/grading";

export default function SuperAdminOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successSchool, setSuccessSchool] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    schoolName: "",
    schoolCode: "",
    schoolEmail: "",
    phone: "",
    address: "",
    schoolType: "K-12",
    planTier: "STANDARD",
    sessionName: "2026/2027",
    termName: "First Term",
    gradingPreset: "CA1_CA2_EXAM",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to onboard school.");
        return;
      }
      setSuccessSchool(`${data.school.name} (${data.school.code})`);
    } catch {
      setError("Network error while provisioning school.");
    } finally {
      setLoading(false);
    }
  }

  if (successSchool) {
    return (
      <Card className="max-w-xl">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B]">School Provisioned Successfully</h2>
          <p className="text-sm text-[#64748B]">
            <strong>{successSchool}</strong> is now active with NGN currency, default grading scales,
            and primary School Admin access.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => router.push("/super-admin/accounts")}>
              Manage Accounts
            </Button>
            <Button
              onClick={() => {
                setSuccessSchool(null);
                setStep(1);
                setForm((prev) => ({
                  ...prev,
                  schoolName: "",
                  schoolCode: "",
                  schoolEmail: "",
                  adminName: "",
                  adminEmail: "",
                  adminPassword: "",
                }));
              }}
            >
              Onboard Another School
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">School Onboarding</h1>
        <p className="text-sm text-[#64748B]">
          Provision a new isolated school tenant, academic session, grading preset, and primary admin.
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: 1, label: "School Profile", icon: Building2 },
          { num: 2, label: "Academic & Grading", icon: BookOpen },
          { num: 3, label: "Primary Admin", icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          const active = step === item.num;
          const done = step > item.num;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num)}
              className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                  : done
                  ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]"
                  : "border-[#E2E8F0] bg-white text-[#64748B]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {item.num}. {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Step 1: School Identity & Contact"}
            {step === 2 && "Step 2: Academic Session & Grading Preset"}
            {step === 3 && "Step 3: Primary School Admin Account"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter the school's official name, unique tenant code, and contact details."}
            {step === 2 && "Set the initial session, term, and preferred grading preset (NGN default)."}
            {step === 3 && "Create the first School Admin login credentials."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-sm text-[#B91C1C]"
              >
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="School Name"
                  placeholder="e.g. Crescent High School"
                  value={form.schoolName}
                  onChange={(e) => updateField("schoolName", e.target.value)}
                  required
                />
                <Input
                  label="School Code (Tenant ID)"
                  placeholder="e.g. CHS"
                  value={form.schoolCode}
                  onChange={(e) => updateField("schoolCode", e.target.value.toUpperCase())}
                  helperText="Used by teachers & students at login."
                  required
                />
                <Input
                  label="Official Email"
                  type="email"
                  placeholder="info@crescent.edu.ng"
                  value={form.schoolEmail}
                  onChange={(e) => updateField("schoolEmail", e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
                <Select
                  label="School Type"
                  value={form.schoolType}
                  onChange={(e) => updateField("schoolType", e.target.value)}
                >
                  <option value="K-12">K-12 (Primary & Secondary)</option>
                  <option value="Primary">Primary School</option>
                  <option value="Secondary">Secondary School</option>
                </Select>
                <Select
                  label="Plan Tier"
                  value={form.planTier}
                  onChange={(e) => updateField("planTier", e.target.value)}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </Select>
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    placeholder="Street, City, State"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Current Academic Session"
                  value={form.sessionName}
                  onChange={(e) => updateField("sessionName", e.target.value)}
                  required
                />
                <Select
                  label="Current Term"
                  value={form.termName}
                  onChange={(e) => updateField("termName", e.target.value)}
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </Select>
                <div className="sm:col-span-2">
                  <Select
                    label="Preferred Grading Preset"
                    value={form.gradingPreset}
                    onChange={(e) => updateField("gradingPreset", e.target.value)}
                  >
                    {GRADING_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Admin Full Name"
                  placeholder="e.g. Dr. Musa Abdullahi"
                  value={form.adminName}
                  onChange={(e) => updateField("adminName", e.target.value)}
                  required
                />
                <Input
                  label="Admin Email"
                  type="email"
                  placeholder="admin@crescent.edu.ng"
                  value={form.adminEmail}
                  onChange={(e) => updateField("adminEmail", e.target.value)}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Temporary Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.adminPassword}
                    onChange={(e) => updateField("adminPassword", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                Back
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep((s) => Math.min(3, s + 1))}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" loading={loading}>
                  Provision School
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentRow {
  id: string;
  admissionNo: string;
  gender: string;
  status: string;
  guardianName: string | null;
  guardianPhone: string | null;
  user: { fullName: string; email: string | null };
  classRoom: { id: string; name: string; arm: string | null } | null;
}

interface ClassOption {
  id: string;
  name: string;
  arm: string | null;
}

export default function ManageStudentsPage() {
  const [students, setStudents] = React.useState<StudentRow[]>([]);
  const [classes, setClasses] = React.useState<ClassOption[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    fullName: "",
    admissionNo: "",
    classId: "",
    gender: "MALE",
    guardianName: "",
    guardianPhone: "",
    password: "Student123!",
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(data.students ?? []);
      setClasses(data.classes ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          classId: form.classId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to enroll student.");
        return;
      }
      setForm({
        fullName: "",
        admissionNo: "",
        classId: "",
        gender: "MALE",
        guardianName: "",
        guardianPhone: "",
        password: "Student123!",
      });
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.user.fullName.toLowerCase().includes(query.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Manage Students</h1>
        <p className="text-sm text-[#64748B]">
          Enroll students with Admission Numbers for portal login and class placement.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#2563EB]" />
              Enroll Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3.5">
              {error && (
                <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
                  {error}
                </div>
              )}
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
              <Input
                label="Admission Number"
                placeholder="e.g. GWA-2026-004"
                value={form.admissionNo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, admissionNo: e.target.value.toUpperCase() }))
                }
                required
              />
              <Select
                label="Class"
                value={form.classId}
                onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
              >
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.arm ? `- ${c.arm}` : ""}
                  </option>
                ))}
              </Select>
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input
                label="Guardian Name"
                value={form.guardianName}
                onChange={(e) => setForm((p) => ({ ...p, guardianName: e.target.value }))}
              />
              <Input
                label="Guardian Phone"
                value={form.guardianPhone}
                onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))}
              />
              <Input
                label="Initial Password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full" loading={saving}>
                Enroll Student
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Student Directory ({filtered.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search name or admission no..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="h-10 animate-pulse rounded-lg bg-[#F1F5F9]" />
                <div className="h-10 animate-pulse rounded-lg bg-[#F1F5F9]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#64748B]">No students found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                      <th className="py-3 pr-4">Student</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Guardian</th>
                      <th className="py-3 pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 pr-4 font-medium text-[#1E293B]">
                          {s.user.fullName}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{s.admissionNo}</td>
                        <td className="py-3 px-4">
                          {s.classRoom
                            ? `${s.classRoom.name}${s.classRoom.arm ? ` - ${s.classRoom.arm}` : ""}`
                            : "Unassigned"}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B]">
                          {s.guardianName || "—"}
                        </td>
                        <td className="py-3 pl-4">
                          <Badge variant={s.status === "ACTIVE" ? "success" : "neutral"}>
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

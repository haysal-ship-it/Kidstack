"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StaffRow {
  id: string;
  staffId: string;
  designation: string;
  department: string | null;
  phone: string | null;
  user: { fullName: string; email: string | null; status: string };
  _count: { subjectAssignments: number };
}

export default function ManageStaffPage() {
  const [staff, setStaff] = React.useState<StaffRow[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    fullName: "",
    staffId: "",
    email: "",
    designation: "Teacher",
    department: "",
    phone: "",
    password: "Teacher123!",
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      setStaff(data.staff ?? []);
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
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add staff.");
        return;
      }
      setForm({
        fullName: "",
        staffId: "",
        email: "",
        designation: "Teacher",
        department: "",
        phone: "",
        password: "Teacher123!",
      });
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  const filtered = staff.filter(
    (s) =>
      s.user.fullName.toLowerCase().includes(query.toLowerCase()) ||
      s.staffId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Manage Staff</h1>
        <p className="text-sm text-[#64748B]">
          Create teacher and staff accounts with Staff IDs for portal sign-in.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#2563EB]" />
              Add Staff / Teacher
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
                label="Staff ID"
                placeholder="e.g. TCH-003"
                value={form.staffId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, staffId: e.target.value.toUpperCase() }))
                }
                required
              />
              <Input
                label="Email (Optional)"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                label="Designation"
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                required
              />
              <Input
                label="Department"
                placeholder="e.g. Sciences"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                label="Initial Password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full" loading={saving}>
                Add Staff Member
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Staff Directory ({filtered.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search name or Staff ID..."
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
              <p className="py-8 text-center text-sm text-[#64748B]">No staff records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-4">Role / Dept</th>
                      <th className="py-3 px-4">Subjects</th>
                      <th className="py-3 pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 pr-4 font-medium text-[#1E293B]">
                          {s.user.fullName}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{s.staffId}</td>
                        <td className="py-3 px-4 text-xs text-[#64748B]">
                          {s.designation}
                          {s.department ? ` · ${s.department}` : ""}
                        </td>
                        <td className="py-3 px-4 tabular-nums">{s._count.subjectAssignments}</td>
                        <td className="py-3 pl-4">
                          <Badge variant={s.user.status === "ACTIVE" ? "success" : "neutral"}>
                            {s.user.status}
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

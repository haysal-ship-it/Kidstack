"use client";

import * as React from "react";
import { Plus, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ClassRow {
  id: string;
  name: string;
  arm: string | null;
  capacity: number;
  classTeacher: { user: { fullName: string } } | null;
  _count: { students: number };
}

interface TeacherOption {
  id: string;
  staffId: string;
  user: { fullName: string };
}

export default function ManageClassesPage() {
  const [classes, setClasses] = React.useState<ClassRow[]>([]);
  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [arm, setArm] = React.useState("");
  const [capacity, setCapacity] = React.useState("35");
  const [classTeacherId, setClassTeacherId] = React.useState("");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/classes");
      const data = await res.json();
      setClasses(data.classes ?? []);
      setTeachers(data.teachers ?? []);
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
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          arm,
          capacity: Number(capacity),
          classTeacherId: classTeacherId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create class.");
        return;
      }
      setName("");
      setArm("");
      setClassTeacherId("");
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Manage Classes</h1>
        <p className="text-sm text-[#64748B]">
          Create classes and arms, set capacities, and assign form teachers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#2563EB]" />
              Add New Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
                  {error}
                </div>
              )}
              <Input
                label="Class Name"
                placeholder="e.g. JSS 1 or Grade 5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Arm / Section"
                placeholder="e.g. A, Gold"
                value={arm}
                onChange={(e) => setArm(e.target.value)}
              />
              <Input
                label="Capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
              <Select
                label="Class Teacher (Optional)"
                value={classTeacherId}
                onChange={(e) => setClassTeacherId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.fullName} ({t.staffId})
                  </option>
                ))}
              </Select>
              <Button type="submit" className="w-full" loading={saving}>
                Create Class
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-4 w-4 text-[#2563EB]" />
              All Classes ({classes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="h-10 animate-pulse rounded-lg bg-[#F1F5F9]" />
                <div className="h-10 animate-pulse rounded-lg bg-[#F1F5F9]" />
              </div>
            ) : classes.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#64748B]">No classes created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                      <th className="py-3 pr-4">Class</th>
                      <th className="py-3 px-4">Class Teacher</th>
                      <th className="py-3 pl-4 text-right">Enrolled / Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {classes.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 pr-4 font-medium text-[#1E293B]">
                          {c.name} {c.arm ? `- ${c.arm}` : ""}
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          {c.classTeacher?.user.fullName || "Unassigned"}
                        </td>
                        <td className="py-3 pl-4 text-right tabular-nums">
                          {c._count.students} / {c.capacity}
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

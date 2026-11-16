"use client";

import * as React from "react";
import { BookOpen, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SubjectRow {
  id: string;
  name: string;
  code: string;
  department: string | null;
}

interface AssignmentRow {
  id: string;
  classRoom: { name: string; arm: string | null };
  subject: { name: string; code: string };
  teacher: { staffId: string; user: { fullName: string } };
}

export default function SubjectsAndTeachersPage() {
  const [subjects, setSubjects] = React.useState<SubjectRow[]>([]);
  const [assignments, setAssignments] = React.useState<AssignmentRow[]>([]);
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string; arm: string | null }>>([]);
  const [teachers, setTeachers] = React.useState<Array<{ id: string; staffId: string; user: { fullName: string } }>>([]);

  const [subName, setSubName] = React.useState("");
  const [subCode, setSubCode] = React.useState("");
  const [subDept, setSubDept] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const res = await fetch("/api/admin/subjects");
    const data = await res.json();
    setSubjects(data.subjects ?? []);
    setAssignments(data.assignments ?? []);
    setClasses(data.classes ?? []);
    setTeachers(data.teachers ?? []);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function createSubject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_SUBJECT",
          name: subName,
          code: subCode,
          department: subDept,
        }),
      });
      if (res.ok) {
        setSubName("");
        setSubCode("");
        setSubDept("");
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  async function assignTeacher(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_TEACHER",
          classId,
          subjectId,
          teacherId,
        }),
      });
      if (res.ok) {
        setClassId("");
        setSubjectId("");
        setTeacherId("");
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Subjects &amp; Teachers</h1>
        <p className="text-sm text-[#64748B]">
          Manage your subject catalog and assign teachers to specific classes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#2563EB]" />
              Create Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSubject} className="space-y-3.5">
              <Input
                label="Subject Name"
                placeholder="e.g. Civic Education"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Subject Code"
                  placeholder="e.g. CIV101"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value.toUpperCase())}
                  required
                />
                <Input
                  label="Department"
                  placeholder="e.g. Humanities"
                  value={subDept}
                  onChange={(e) => setSubDept(e.target.value)}
                />
              </div>
              <Button type="submit" loading={saving}>
                Add Subject
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[#2563EB]" />
              Assign Teacher to Class Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={assignTeacher} className="space-y-3.5">
              <Select
                label="Class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.arm ? `- ${c.arm}` : ""}
                  </option>
                ))}
              </Select>
              <Select
                label="Subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </Select>
              <Select
                label="Teacher"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
              >
                <option value="">Select teacher...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.fullName} ({t.staffId})
                  </option>
                ))}
              </Select>
              <Button type="submit" loading={saving}>
                Save Assignment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Subject-Teacher Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#64748B]">No assignments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">Class</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 pl-4">Assigned Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 pr-4 font-medium">
                        {a.classRoom.name} {a.classRoom.arm ? `- ${a.classRoom.arm}` : ""}
                      </td>
                      <td className="py-3 px-4">
                        {a.subject.name}{" "}
                        <span className="font-mono text-xs text-[#64748B]">
                          ({a.subject.code})
                        </span>
                      </td>
                      <td className="py-3 pl-4">
                        {a.teacher.user.fullName}{" "}
                        <span className="font-mono text-xs text-[#64748B]">
                          ({a.teacher.staffId})
                        </span>
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
  );
}

"use client";

import * as React from "react";
import { CheckCircle2, Save, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateGrade, type AssessmentComponent } from "@/lib/grading";

interface AssignmentOption {
  id: string;
  classId: string;
  subjectId: string;
  classRoom: { name: string; arm: string | null };
  subject: { name: string; code: string };
}

interface StudentRow {
  id: string;
  admissionNo: string;
  user: { fullName: string };
}

export default function TeacherManageResultsPage() {
  const [assignments, setAssignments] = React.useState<AssignmentOption[]>([]);
  const [components, setComponents] = React.useState<AssessmentComponent[]>([]);
  const [scales, setScales] = React.useState<
    Array<{ grade: string; minScore: number; maxScore: number; remark: string }>
  >([]);
  const [selectedKey, setSelectedKey] = React.useState("");
  const [students, setStudents] = React.useState<StudentRow[]>([]);
  const [scoresMap, setScoresMap] = React.useState<Record<string, Record<string, number>>>({});
  const [statusMap, setStatusMap] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const loadAssignmentData = React.useCallback(async (classId?: string, subjectId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.set("classId", classId);
      if (subjectId) params.set("subjectId", subjectId);
      const res = await fetch(`/api/teacher/results?${params.toString()}`);
      const data = await res.json();

      setAssignments(data.assignments ?? []);
      setComponents(data.components ?? []);
      setScales(data.scales ?? []);
      setStudents(data.students ?? []);

      if (data.selectedClassId && data.selectedSubjectId) {
        setSelectedKey(`${data.selectedClassId}::${data.selectedSubjectId}`);
      }

      const initialScores: Record<string, Record<string, number>> = {};
      const initialStatus: Record<string, string> = {};
      for (const r of data.existingResults ?? []) {
        initialScores[r.studentId] = (r.scores as Record<string, number>) || {};
        initialStatus[r.studentId] = r.status;
      }
      setScoresMap(initialScores);
      setStatusMap(initialStatus);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAssignmentData();
  }, [loadAssignmentData]);

  function handleSelectChange(val: string) {
    setSelectedKey(val);
    setMessage(null);
    const [classId, subjectId] = val.split("::");
    if (classId && subjectId) {
      loadAssignmentData(classId, subjectId);
    }
  }

  function updateScore(studentId: string, key: string, maxScore: number, raw: string) {
    const val = Math.max(0, Math.min(maxScore, Number(raw) || 0));
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [key]: val,
      },
    }));
  }

  async function handleSave(submitStatus: "DRAFT" | "SUBMITTED") {
    const [classId, subjectId] = selectedKey.split("::");
    if (!classId || !subjectId) return;

    setSaving(true);
    setMessage(null);
    try {
      const entries = students.map((s) => ({
        studentId: s.id,
        scores: scoresMap[s.id] || {},
      }));
      const res = await fetch("/api/teacher/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, subjectId, submitStatus, entries }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        await loadAssignmentData(classId, subjectId);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Manage Results</h1>
        <p className="text-sm text-[#64748B]">
          Select an assigned class &amp; subject to enter scores. Totals and grades calculate live.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-96">
            <Select
              label="Assigned Class & Subject"
              value={selectedKey}
              onChange={(e) => handleSelectChange(e.target.value)}
            >
              {assignments.length === 0 && <option value="">No assigned subjects</option>}
              {assignments.map((a) => (
                <option key={a.id} value={`${a.classId}::${a.subjectId}`}>
                  {a.classRoom.name} {a.classRoom.arm ? `- ${a.classRoom.arm}` : ""} ·{" "}
                  {a.subject.name} ({a.subject.code})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={students.length === 0}
              loading={saving}
              onClick={() => handleSave("DRAFT")}
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              disabled={students.length === 0}
              loading={saving}
              onClick={() => handleSave("SUBMITTED")}
            >
              <Send className="h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-2.5 text-sm text-[#047857]"
            >
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}

          {loading ? (
            <div className="h-40 animate-pulse rounded-lg bg-[#F1F5F9]" />
          ) : students.length === 0 ? (
            <CardDescription className="py-8 text-center">
              No active students found in this class.
            </CardDescription>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">Student</th>
                    {components.map((c) => (
                      <th key={c.key} className="py-3 px-3 text-center">
                        {c.label} <span className="font-normal">(/{c.maxScore})</span>
                      </th>
                    ))}
                    <th className="py-3 px-3 text-right">Total</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 pl-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {students.map((s) => {
                    const rowScores = scoresMap[s.id] || {};
                    const total = components.reduce(
                      (sum, c) => sum + Number(rowScores[c.key] || 0),
                      0
                    );
                    const { grade, remark } = calculateGrade(total, scales);
                    const status = statusMap[s.id] || "NEW";
                    const locked = status === "PUBLISHED";

                    return (
                      <tr key={s.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-[#1E293B]">{s.user.fullName}</p>
                          <p className="font-mono text-xs text-[#64748B]">{s.admissionNo}</p>
                        </td>
                        {components.map((c) => (
                          <td key={c.key} className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={c.maxScore}
                              disabled={locked}
                              value={rowScores[c.key] ?? ""}
                              onChange={(e) =>
                                updateScore(s.id, c.key, c.maxScore, e.target.value)
                              }
                              aria-label={`${s.user.fullName} ${c.label}`}
                              className="h-10 w-20 rounded-lg border border-[#CBD5E1] bg-white px-2 text-center text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:bg-[#F1F5F9]"
                            />
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                          {total}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold">{grade}</span>{" "}
                          <span className="text-xs text-[#64748B]">({remark})</span>
                        </td>
                        <td className="py-2.5 pl-3">
                          <Badge
                            variant={
                              status === "PUBLISHED"
                                ? "success"
                                : status === "SUBMITTED"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResultRow {
  id: string;
  total: number;
  grade: string;
  remark: string;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED";
  student: { admissionNo: string; user: { fullName: string } };
  classRoom: { name: string; arm: string | null };
  subject: { name: string; code: string };
}

export default function AdminResultsPage() {
  const [results, setResults] = React.useState<ResultRow[]>([]);
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string; arm: string | null }>>([]);
  const [subjects, setSubjects] = React.useState<Array<{ id: string; name: string }>>([]);
  const [classId, setClassId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.set("classId", classId);
      if (subjectId) params.set("subjectId", subjectId);
      const res = await fetch(`/api/admin/results?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setClasses(data.classes ?? []);
      setSubjects(data.subjects ?? []);
    } finally {
      setLoading(false);
    }
  }, [classId, subjectId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateStatus(ids: string[], status: "PUBLISHED" | "DRAFT") {
    if (ids.length === 0) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultIds: ids, status }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setUpdating(false);
    }
  }

  const submittedIds = results.filter((r) => r.status === "SUBMITTED").map((r) => r.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Results Approval &amp; Publishing</h1>
          <p className="text-sm text-[#64748B]">
            Review teacher-submitted scores and publish results to the Student Portal.
          </p>
        </div>
        <Button
          disabled={submittedIds.length === 0}
          loading={updating}
          onClick={() => updateStatus(submittedIds, "PUBLISHED")}
        >
          <CheckCircle2 className="h-4 w-4" />
          Publish Submitted ({submittedIds.length})
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <CardTitle>Score Records ({results.length})</CardTitle>
          <div className="grid grid-cols-2 gap-3 sm:w-96">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.arm ? `- ${c.arm}` : ""}
                </option>
              ))}
            </Select>
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 animate-pulse rounded-lg bg-[#F1F5F9]" />
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B]">No result records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#1E293B]">{r.student.user.fullName}</p>
                        <p className="font-mono text-xs text-[#64748B]">{r.student.admissionNo}</p>
                      </td>
                      <td className="py-3 px-4">
                        {r.classRoom.name} {r.classRoom.arm ? `- ${r.classRoom.arm}` : ""}
                      </td>
                      <td className="py-3 px-4">{r.subject.name}</td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">
                        {r.total}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{r.grade}</span>{" "}
                        <span className="text-xs text-[#64748B]">({r.remark})</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            r.status === "PUBLISHED"
                              ? "success"
                              : r.status === "SUBMITTED"
                              ? "warning"
                              : "neutral"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {r.status !== "PUBLISHED" ? (
                          <Button
                            size="sm"
                            onClick={() => updateStatus([r.id], "PUBLISHED")}
                            disabled={updating}
                          >
                            Publish
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus([r.id], "DRAFT")}
                            disabled={updating}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reopen
                          </Button>
                        )}
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

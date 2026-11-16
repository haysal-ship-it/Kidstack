import { FileSpreadsheet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/shared/print-button";

export const instant = false;

export default async function StudentResultsPage() {
  const session = await getSession();
  const userId = session?.userId ?? "";

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { user: true, school: true, classRoom: true },
  });

  if (!student) {
    return <p className="text-sm text-[#64748B]">Student record not found.</p>;
  }

  const currentTerm = await prisma.term.findFirst({
    where: { schoolId: student.schoolId, isCurrent: true },
    include: { session: true },
  });

  const results = currentTerm
    ? await prisma.resultRecord.findMany({
        where: {
          schoolId: student.schoolId,
          studentId: student.id,
          termId: currentTerm.id,
          status: "PUBLISHED",
        },
        include: { subject: true },
        orderBy: { subject: { name: "asc" } },
      })
    : [];

  const average =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.total, 0) / results.length).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">My Results</h1>
          <p className="text-sm text-[#64748B]">
            {currentTerm
              ? `${currentTerm.session.name} · ${currentTerm.name}`
              : "Current Academic Term"}
          </p>
        </div>
        {results.length > 0 && <PrintButton label="Print Report Card" />}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#2563EB]" />
              {student.school.name} — Term Report Card
            </CardTitle>
            <CardDescription>
              {student.user.fullName} ({student.admissionNo}) ·{" "}
              {student.classRoom
                ? `${student.classRoom.name}${student.classRoom.arm ? ` - ${student.classRoom.arm}` : ""}`
                : "Class Unassigned"}
            </CardDescription>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-[#64748B]">Term Average</p>
            <p className="text-xl font-bold text-[#2563EB] tabular-nums">{average}%</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {results.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="font-medium text-[#1E293B]">No Published Results Yet</p>
              <p className="text-sm text-[#64748B]">
                Your results will appear here once your teachers submit them and the School Admin
                publishes them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">Subject</th>
                    <th className="py-3 px-4">Score Breakdown</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 pl-4">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {results.map((r) => {
                    const breakdown = Object.entries(
                      (r.scores as Record<string, number>) || {}
                    )
                      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                      .join(" · ");
                    return (
                      <tr key={r.id}>
                        <td className="py-3 pr-4 font-medium text-[#1E293B]">
                          {r.subject.name}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B] tabular-nums">
                          {breakdown || "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums">{r.total}</td>
                        <td className="py-3 px-4">
                          <Badge variant={r.grade === "F" ? "danger" : "success"}>
                            {r.grade}
                          </Badge>
                        </td>
                        <td className="py-3 pl-4 text-[#475569]">{r.remark}</td>
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

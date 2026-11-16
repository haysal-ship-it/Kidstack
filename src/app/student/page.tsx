import { GraduationCap, MessageSquare, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export const instant = false;

export default async function StudentProfilePage() {
  const session = await getSession();
  const userId = session?.userId ?? "";

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      school: true,
      classRoom: { include: { classTeacher: { include: { user: true } } } },
    },
  });

  if (!student) {
    return <p className="text-sm text-[#64748B]">Student profile not found.</p>;
  }

  const notices = await prisma.message.findMany({
    where: {
      schoolId: student.schoolId,
      OR: [
        { recipientType: "ALL" },
        { recipientType: "ROLE", recipientId: "STUDENT" },
        ...(student.classId
          ? [{ recipientType: "CLASS" as const, recipientId: student.classId }]
          : []),
      ],
    },
    include: { sender: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">My Profile</h1>
        <p className="text-sm text-[#64748B]">
          Academic identity and guardian records at {student.school.name}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#2563EB]" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs text-[#64748B]">Full Name</p>
              <p className="font-semibold text-[#1E293B]">{student.user.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Admission Number</p>
              <p className="font-mono font-semibold text-[#2563EB]">{student.admissionNo}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Current Class</p>
              <p className="font-medium text-[#1E293B]">
                {student.classRoom
                  ? `${student.classRoom.name}${student.classRoom.arm ? ` - ${student.classRoom.arm}` : ""}`
                  : "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Form / Class Teacher</p>
              <p className="text-[#1E293B]">
                {student.classRoom?.classTeacher?.user.fullName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Gender</p>
              <p className="text-[#1E293B]">{student.gender}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Status</p>
              <Badge variant={student.status === "ACTIVE" ? "success" : "neutral"}>
                {student.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Guardian Name</p>
              <p className="text-[#1E293B]">{student.guardianName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Guardian Phone</p>
              <p className="text-[#1E293B]">{student.guardianPhone || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#2563EB]" />
              School Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#64748B]">
                <GraduationCap className="mx-auto mb-2 h-6 w-6 text-[#94A3B8]" />
                No announcements yet.
              </div>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="rounded-lg border border-[#E2E8F0] p-3 space-y-1">
                  <p className="font-semibold text-sm text-[#1E293B]">{n.subject}</p>
                  <p className="text-xs text-[#475569]">{n.body}</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {n.sender.fullName} · {formatDate(n.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

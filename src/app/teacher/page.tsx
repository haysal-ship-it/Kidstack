import Link from "next/link";
import { BookOpen, FileSpreadsheet, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const instant = false;

export default async function TeacherProfilePage() {
  const session = await getSession();
  const userId = session?.userId ?? "";

  const staff = await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      school: true,
      subjectAssignments: {
        include: { classRoom: true, subject: true },
      },
    },
  });

  if (!staff) {
    return <p className="text-sm text-[#64748B]">Teacher profile not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">My Profile</h1>
          <p className="text-sm text-[#64748B]">
            Your staff details and assigned subjects for {staff.school.name}.
          </p>
        </div>
        <Link
          href="/teacher/results"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Manage Results
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#2563EB]" />
              Staff Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-[#64748B]">Full Name</p>
              <p className="font-semibold text-[#1E293B]">{staff.user.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Staff ID</p>
              <p className="font-mono font-medium text-[#1E293B]">{staff.staffId}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Designation</p>
              <p className="text-[#1E293B]">{staff.designation}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Department</p>
              <p className="text-[#1E293B]">{staff.department || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Email</p>
              <p className="text-[#1E293B]">{staff.user.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Phone</p>
              <p className="text-[#1E293B]">{staff.phone || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#2563EB]" />
              Assigned Classes &amp; Subjects ({staff.subjectAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.subjectAssignments.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#64748B]">
                No subjects assigned yet. Contact your School Admin.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {staff.subjectAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-3.5"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#1E293B]">{a.subject.name}</p>
                      <p className="text-xs text-[#64748B]">
                        {a.classRoom.name} {a.classRoom.arm ? `- ${a.classRoom.arm}` : ""}
                      </p>
                    </div>
                    <Badge variant="info">{a.subject.code}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

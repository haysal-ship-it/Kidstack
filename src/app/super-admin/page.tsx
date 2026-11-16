import Link from "next/link";
import { Building2, CheckCircle2, GraduationCap, PauseCircle, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export const instant = false;

export default async function SuperAdminDashboardPage() {
  const [schools, totalStudents, totalStaff] = await Promise.all([
    prisma.school.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { studentProfiles: true, staffProfiles: true },
        },
      },
    }),
    prisma.studentProfile.count(),
    prisma.staffProfile.count(),
  ]);

  const activeCount = schools.filter((s) => s.status === "ACTIVE").length;
  const suspendedCount = schools.filter((s) => s.status === "SUSPENDED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Platform Overview</h1>
          <p className="text-sm text-[#64748B]">
            Monitor onboarded schools, tenant status, and platform adoption.
          </p>
        </div>
        <Link
          href="/super-admin/onboarding"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Onboard New School
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={schools.length}
          subtitle={`${activeCount} active · ${suspendedCount} suspended`}
          icon={<Building2 className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          title="Active Tenants"
          value={activeCount}
          subtitle="Operational schools"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Across all tenants"
          icon={<GraduationCap className="h-5 w-5" />}
          accent="indigo"
        />
        <StatCard
          title="Total Staff"
          value={totalStaff}
          subtitle="Teachers & staff"
          icon={<Users className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recently Onboarded Schools</CardTitle>
            <CardDescription>Latest school tenants provisioned on Kidstack.</CardDescription>
          </div>
          <Link
            href="/super-admin/accounts"
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#64748B]">
              No schools onboarded yet. Click &ldquo;Onboard New School&rdquo; to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">School</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4">Onboarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {schools.slice(0, 6).map((school) => (
                    <tr key={school.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#1E293B]">{school.name}</p>
                        <p className="text-xs text-[#64748B]">{school.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#475569]">{school.code}</td>
                      <td className="py-3 px-4 tabular-nums">{school._count.studentProfiles}</td>
                      <td className="py-3 px-4 tabular-nums">{school._count.staffProfiles}</td>
                      <td className="py-3 px-4">
                        <Badge variant={school.status === "ACTIVE" ? "success" : "danger"}>
                          {school.status === "SUSPENDED" && (
                            <PauseCircle className="h-3 w-3" aria-hidden="true" />
                          )}
                          {school.status}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-[#64748B]">{formatDate(school.createdAt)}</td>
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

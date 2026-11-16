import Link from "next/link";
import {
  GraduationCap,
  Users,
  School,
  Wallet,
  FileSpreadsheet,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export const instant = false;

export default async function AdminDashboardPage() {
  const session = await getSession();
  const schoolId = session?.schoolId ?? "";

  const [
    studentCount,
    staffCount,
    classCount,
    currentTerm,
    paymentsAgg,
    pendingResultsCount,
    recentMessages,
  ] = await Promise.all([
    prisma.studentProfile.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.staffProfile.count({ where: { schoolId } }),
    prisma.classRoom.count({ where: { schoolId } }),
    prisma.term.findFirst({
      where: { schoolId, isCurrent: true },
      include: { session: true },
    }),
    prisma.feePayment.aggregate({
      where: { schoolId },
      _sum: { amount: true },
    }),
    prisma.resultRecord.count({
      where: { schoolId, status: "SUBMITTED" },
    }),
    prisma.message.findMany({
      where: { schoolId },
      include: { sender: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const totalCollected = paymentsAgg._sum.amount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">School Dashboard</h1>
          <p className="text-sm text-[#64748B]">
            {currentTerm
              ? `${currentTerm.session.name} · ${currentTerm.name}`
              : "Active Academic Term"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/students"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Add Student
          </Link>
          <Link
            href="/admin/fees"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
          >
            Record Fee Payment
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Students"
          value={studentCount}
          subtitle="Enrolled this term"
          icon={<GraduationCap className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          title="Staff & Teachers"
          value={staffCount}
          subtitle={`${classCount} active classes`}
          icon={<Users className="h-5 w-5" />}
          accent="indigo"
        />
        <StatCard
          title="Fees Collected"
          value={formatCurrency(totalCollected)}
          subtitle="Total NGN recorded"
          icon={<Wallet className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          title="Pending Results"
          value={pendingResultsCount}
          subtitle="Awaiting admin approval"
          icon={<FileSpreadsheet className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Module Access</CardTitle>
            <CardDescription>Jump directly to daily school operations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Manage Classes", href: "/admin/classes", icon: School },
              { label: "Subjects & Teachers", href: "/admin/subjects", icon: Users },
              { label: "Grading Presets", href: "/admin/grading", icon: FileSpreadsheet },
              { label: "Publish Results", href: "/admin/results", icon: GraduationCap },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-[52px] items-center justify-between rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm font-medium text-[#1E293B] hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Communication</CardTitle>
              <CardDescription>Latest school notices &amp; messages.</CardDescription>
            </div>
            <Link
              href="/admin/messages"
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              Open Messages
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#64748B]">
                No messages sent yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-[#E2E8F0] p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-[#1E293B] truncate flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
                        {msg.subject}
                      </p>
                      <Badge variant={msg.isAnnouncement ? "info" : "neutral"}>
                        {msg.recipientType}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2">{msg.body}</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      By {msg.sender.fullName} · {formatDate(msg.createdAt)}
                    </p>
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

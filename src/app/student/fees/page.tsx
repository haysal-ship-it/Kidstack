import { CheckCircle2, Receipt, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/shared/print-button";
import { formatCurrency, formatDate } from "@/lib/format";

export const instant = false;

export default async function StudentFeesPage() {
  const session = await getSession();
  const userId = session?.userId ?? "";

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { user: true, classRoom: true },
  });

  if (!student) {
    return <p className="text-sm text-[#64748B]">Student record not found.</p>;
  }

  const currentTerm = await prisma.term.findFirst({
    where: { schoolId: student.schoolId, isCurrent: true },
    include: { session: true },
  });

  const [feeStructure, payments] = await Promise.all([
    currentTerm && student.classId
      ? prisma.feeStructure.findUnique({
          where: {
            schoolId_termId_classId: {
              schoolId: student.schoolId,
              termId: currentTerm.id,
              classId: student.classId,
            },
          },
        })
      : null,
    prisma.feePayment.findMany({
      where: {
        schoolId: student.schoolId,
        studentId: student.id,
        ...(currentTerm ? { termId: currentTerm.id } : {}),
      },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  const totalBilled = feeStructure?.totalAmount ?? 0;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, totalBilled - totalPaid);
  const items = (feeStructure?.items as Array<{ name: string; amount: number }> | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">My School Fees (NGN)</h1>
          <p className="text-sm text-[#64748B]">
            {currentTerm
              ? `${currentTerm.session.name} · ${currentTerm.name}`
              : "Current Academic Term"}
          </p>
        </div>
        <PrintButton label="Print Fee Statement" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Billed"
          value={formatCurrency(totalBilled)}
          subtitle={feeStructure?.title || "Current term schedule"}
          icon={<Wallet className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle={`${payments.length} recorded payment(s)`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(balance)}
          subtitle={balance === 0 && totalBilled > 0 ? "Fully cleared" : "Amount due"}
          icon={<Receipt className="h-5 w-5" />}
          accent={balance === 0 ? "emerald" : "amber"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Breakdown</CardTitle>
            <CardDescription>
              {feeStructure ? feeStructure.title : "No fee schedule published for your class yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#64748B]">No fee items listed.</p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] text-sm">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5">
                    <span className="text-[#475569]">{item.name}</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 font-bold text-[#1E293B]">
                  <span>Total Billed</span>
                  <span className="tabular-nums">{formatCurrency(totalBilled)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History &amp; Receipts</CardTitle>
            <CardDescription>Verified payments recorded by your school bursar.</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#64748B]">
                No payments recorded for this term yet.
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-3.5"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#2563EB]">
                        {p.receiptNo}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {p.method} · Ref: {p.reference}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">{formatDate(p.paidAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#059669] tabular-nums">
                        {formatCurrency(p.amount)}
                      </p>
                      <Badge variant="success">Verified</Badge>
                    </div>
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

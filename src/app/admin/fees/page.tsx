"use client";

import * as React from "react";
import { Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

interface StudentFeeRow {
  id: string;
  admissionNo: string;
  classId: string | null;
  user: { fullName: string };
  classRoom: { id: string; name: string; arm: string | null } | null;
  feePayments: Array<{ id: string; amount: number }>;
}

interface StructureRow {
  id: string;
  classId: string;
  title: string;
  totalAmount: number;
  classRoom: { name: string; arm: string | null };
}

interface PaymentRow {
  id: string;
  amount: number;
  method: string;
  reference: string;
  receiptNo: string;
  paidAt: string;
  student: { admissionNo: string; user: { fullName: string } };
}

export default function ManageFeesPage() {
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string; arm: string | null }>>([]);
  const [structures, setStructures] = React.useState<StructureRow[]>([]);
  const [students, setStudents] = React.useState<StudentFeeRow[]>([]);
  const [payments, setPayments] = React.useState<PaymentRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  const [structClassId, setStructClassId] = React.useState("");
  const [structTitle, setStructTitle] = React.useState("First Term Tuition & Levies");
  const [tuitionAmount, setTuitionAmount] = React.useState("85000");
  const [levyAmount, setLevyAmount] = React.useState("40000");

  const [payStudentId, setPayStudentId] = React.useState("");
  const [payAmount, setPayAmount] = React.useState("");
  const [payMethod, setPayMethod] = React.useState("BANK_TRANSFER");
  const [payRef, setPayRef] = React.useState("");

  const loadData = React.useCallback(async () => {
    const res = await fetch("/api/admin/fees");
    const data = await res.json();
    setClasses(data.classes ?? []);
    setStructures(data.structures ?? []);
    setStudents(data.students ?? []);
    setPayments(data.payments ?? []);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveStructure(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_STRUCTURE",
          classId: structClassId,
          title: structTitle,
          items: [
            { name: "Tuition Fee", amount: Number(tuitionAmount) },
            { name: "Development & Lab Levies", amount: Number(levyAmount) },
          ],
        }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_PAYMENT",
          studentId: payStudentId,
          amount: Number(payAmount),
          method: payMethod,
          reference: payRef,
        }),
      });
      if (res.ok) {
        setPayStudentId("");
        setPayAmount("");
        setPayRef("");
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  const structureByClass = new Map(structures.map((s) => [s.classId, s.totalAmount]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Manage School Fees (NGN)</h1>
        <p className="text-sm text-[#64748B]">
          Configure termly fee structures per class, record student payments, and track balances.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#2563EB]" />
              Set Class Fee Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveStructure} className="space-y-3.5">
              <Select
                label="Class"
                value={structClassId}
                onChange={(e) => setStructClassId(e.target.value)}
                required
              >
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.arm ? `- ${c.arm}` : ""}
                  </option>
                ))}
              </Select>
              <Input
                label="Fee Schedule Title"
                value={structTitle}
                onChange={(e) => setStructTitle(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tuition (₦)"
                  type="number"
                  min={0}
                  value={tuitionAmount}
                  onChange={(e) => setTuitionAmount(e.target.value)}
                  required
                />
                <Input
                  label="Levies (₦)"
                  type="number"
                  min={0}
                  value={levyAmount}
                  onChange={(e) => setLevyAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" loading={saving}>
                Save Fee Structure
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#2563EB]" />
              Record Student Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={recordPayment} className="space-y-3.5">
              <Select
                label="Student"
                value={payStudentId}
                onChange={(e) => setPayStudentId(e.target.value)}
                required
              >
                <option value="">Select student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.fullName} ({s.admissionNo})
                  </option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Amount (₦)"
                  type="number"
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
                <Select
                  label="Method"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="POS">POS</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </Select>
              </div>
              <Input
                label="Payment Reference"
                placeholder="e.g. NIP-20261115-001"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                required
              />
              <Button type="submit" loading={saving}>
                Record Payment &amp; Issue Receipt
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Fee Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Billed</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {students.map((s) => {
                  const billed = s.classId ? structureByClass.get(s.classId) ?? 0 : 0;
                  const paid = s.feePayments.reduce((sum, p) => sum + p.amount, 0);
                  const balance = Math.max(0, billed - paid);
                  const status =
                    billed === 0 ? "NO_BILL" : balance === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
                  return (
                    <tr key={s.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{s.user.fullName}</p>
                        <p className="font-mono text-xs text-[#64748B]">{s.admissionNo}</p>
                      </td>
                      <td className="py-3 px-4">
                        {s.classRoom
                          ? `${s.classRoom.name}${s.classRoom.arm ? ` - ${s.classRoom.arm}` : ""}`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(billed)}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#059669]">
                        {formatCurrency(paid)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-3 pl-4">
                        <Badge
                          variant={
                            status === "PAID"
                              ? "success"
                              : status === "PARTIAL"
                              ? "warning"
                              : status === "UNPAID"
                              ? "danger"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#64748B]">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">Receipt No</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Method / Ref</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 pl-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#2563EB]">
                        {p.receiptNo}
                      </td>
                      <td className="py-3 px-4">{p.student.user.fullName}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">
                        {p.method} · {p.reference}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 pl-4 text-[#64748B]">{formatDate(p.paidAt)}</td>
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

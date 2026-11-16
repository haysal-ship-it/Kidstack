import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const feeActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CREATE_STRUCTURE"),
    classId: z.string().min(1),
    title: z.string().trim().min(2),
    items: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          amount: z.coerce.number().min(0),
        })
      )
      .min(1),
  }),
  z.object({
    action: z.literal("RECORD_PAYMENT"),
    studentId: z.string().min(1),
    amount: z.coerce.number().positive(),
    method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "POS", "OTHER"]),
    reference: z.string().trim().min(2),
    notes: z.string().trim().optional(),
  }),
]);

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentTerm = await prisma.term.findFirst({
    where: { schoolId: session.schoolId, isCurrent: true },
    include: { session: true },
  });

  const [classes, structures, students, payments] = await Promise.all([
    prisma.classRoom.findMany({
      where: { schoolId: session.schoolId },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
    }),
    prisma.feeStructure.findMany({
      where: {
        schoolId: session.schoolId,
        ...(currentTerm ? { termId: currentTerm.id } : {}),
      },
      include: { classRoom: true },
    }),
    prisma.studentProfile.findMany({
      where: { schoolId: session.schoolId, status: "ACTIVE" },
      include: {
        user: { select: { fullName: true } },
        classRoom: true,
        feePayments: {
          where: currentTerm ? { termId: currentTerm.id } : {},
        },
      },
      orderBy: { admissionNo: "asc" },
    }),
    prisma.feePayment.findMany({
      where: { schoolId: session.schoolId },
      include: {
        student: { include: { user: { select: { fullName: true } }, classRoom: true } },
      },
      orderBy: { paidAt: "desc" },
      take: 25,
    }),
  ]);

  return NextResponse.json({ currentTerm, classes, structures, students, payments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentTerm = await prisma.term.findFirst({
    where: { schoolId: session.schoolId, isCurrent: true },
  });
  if (!currentTerm) {
    return NextResponse.json({ error: "No active term configured." }, { status: 400 });
  }

  const body = await req.json();
  const parsed = feeActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid fee payload" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.action === "CREATE_STRUCTURE") {
    const totalAmount = data.items.reduce((sum, i) => sum + i.amount, 0);
    const structure = await prisma.feeStructure.upsert({
      where: {
        schoolId_termId_classId: {
          schoolId: session.schoolId,
          termId: currentTerm.id,
          classId: data.classId,
        },
      },
      update: {
        title: data.title,
        items: data.items as unknown as object,
        totalAmount,
      },
      create: {
        schoolId: session.schoolId,
        termId: currentTerm.id,
        classId: data.classId,
        title: data.title,
        items: data.items as unknown as object,
        totalAmount,
      },
    });
    return NextResponse.json({ structure }, { status: 201 });
  }

  const receiptNo = `RCP-${session.schoolCode ?? "KDS"}-${Date.now().toString().slice(-6)}`;
  const payment = await prisma.feePayment.create({
    data: {
      schoolId: session.schoolId,
      studentId: data.studentId,
      termId: currentTerm.id,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      receiptNo,
      notes: data.notes || null,
      recordedById: session.userId,
    },
  });

  return NextResponse.json({ payment }, { status: 201 });
}

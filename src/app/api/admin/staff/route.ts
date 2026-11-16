import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

const createStaffSchema = z.object({
  fullName: z.string().trim().min(2),
  staffId: z.string().trim().min(2),
  email: z.string().trim().email().optional().or(z.literal("")),
  designation: z.string().trim().default("Teacher"),
  department: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  password: z.string().min(6).default("Teacher123!"),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = await prisma.staffProfile.findMany({
    where: { schoolId: session.schoolId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true, status: true } },
      _count: { select: { subjectAssignments: true } },
    },
  });

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid staff payload" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const staffId = data.staffId.toUpperCase();
  const existing = await prisma.staffProfile.findUnique({
    where: { schoolId_staffId: { schoolId: session.schoolId, staffId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Staff ID "${staffId}" already exists.` },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(data.password);
  const schoolId = session.schoolId;

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        schoolId,
        email: data.email ? data.email.toLowerCase() : null,
        passwordHash,
        fullName: data.fullName,
        role: "TEACHER",
        status: "ACTIVE",
      },
    });

    return tx.staffProfile.create({
      data: {
        userId: user.id,
        schoolId,
        staffId,
        designation: data.designation,
        department: data.department || null,
        phone: data.phone || null,
      },
    });
  });

  return NextResponse.json({ staff: created }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

const createStudentSchema = z.object({
  fullName: z.string().trim().min(2),
  admissionNo: z.string().trim().min(2),
  email: z.string().trim().email().optional().or(z.literal("")),
  classId: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("OTHER"),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  password: z.string().min(6).default("Student123!"),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [students, classes] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { schoolId: session.schoolId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true, status: true } },
        classRoom: { select: { id: true, name: true, arm: true } },
      },
    }),
    prisma.classRoom.findMany({
      where: { schoolId: session.schoolId },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
    }),
  ]);

  return NextResponse.json({ students, classes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid student payload" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const admissionNo = data.admissionNo.toUpperCase();
  const existing = await prisma.studentProfile.findUnique({
    where: { schoolId_admissionNo: { schoolId: session.schoolId, admissionNo } },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Admission Number "${admissionNo}" already exists.` },
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
        role: "STUDENT",
        status: "ACTIVE",
      },
    });

    return tx.studentProfile.create({
      data: {
        userId: user.id,
        schoolId,
        admissionNo,
        classId: data.classId || null,
        gender: data.gender,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        status: "ACTIVE",
      },
    });
  });

  return NextResponse.json({ student: created }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const subjectSchema = z.object({
  action: z.enum(["CREATE_SUBJECT", "ASSIGN_TEACHER"]),
  name: z.string().trim().optional(),
  code: z.string().trim().optional(),
  department: z.string().trim().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [subjects, assignments, classes, teachers] = await Promise.all([
    prisma.subject.findMany({
      where: { schoolId: session.schoolId },
      orderBy: { name: "asc" },
    }),
    prisma.subjectAssignment.findMany({
      where: { schoolId: session.schoolId },
      include: {
        classRoom: true,
        subject: true,
        teacher: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.classRoom.findMany({
      where: { schoolId: session.schoolId },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
    }),
    prisma.staffProfile.findMany({
      where: { schoolId: session.schoolId },
      include: { user: { select: { fullName: true } } },
      orderBy: { staffId: "asc" },
    }),
  ]);

  return NextResponse.json({ subjects, assignments, classes, teachers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data = parsed.data;
  if (data.action === "CREATE_SUBJECT") {
    if (!data.name || !data.code) {
      return NextResponse.json({ error: "Subject name and code are required." }, { status: 400 });
    }
    const subject = await prisma.subject.create({
      data: {
        schoolId: session.schoolId,
        name: data.name,
        code: data.code.toUpperCase(),
        department: data.department || null,
      },
    });
    return NextResponse.json({ subject }, { status: 201 });
  }

  if (!data.classId || !data.subjectId || !data.teacherId) {
    return NextResponse.json(
      { error: "Class, Subject, and Teacher are required." },
      { status: 400 }
    );
  }

  const assignment = await prisma.subjectAssignment.upsert({
    where: {
      schoolId_classId_subjectId: {
        schoolId: session.schoolId,
        classId: data.classId,
        subjectId: data.subjectId,
      },
    },
    update: { teacherId: data.teacherId },
    create: {
      schoolId: session.schoolId,
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
    },
  });

  return NextResponse.json({ assignment }, { status: 201 });
}

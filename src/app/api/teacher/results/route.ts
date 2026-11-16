import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateGrade, getPresetById, type AssessmentComponent } from "@/lib/grading";

const saveScoresSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  submitStatus: z.enum(["DRAFT", "SUBMITTED"]),
  entries: z.array(
    z.object({
      studentId: z.string().min(1),
      scores: z.record(z.string(), z.coerce.number().min(0)),
      teacherComment: z.string().optional(),
    })
  ),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!staff) {
    return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
  }

  const [assignments, currentTerm, config, scales] = await Promise.all([
    prisma.subjectAssignment.findMany({
      where: { schoolId: session.schoolId, teacherId: staff.id },
      include: { classRoom: true, subject: true },
    }),
    prisma.term.findFirst({
      where: { schoolId: session.schoolId, isCurrent: true },
      include: { session: true },
    }),
    prisma.assessmentConfig.findFirst({
      where: { schoolId: session.schoolId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.gradingScale.findMany({
      where: { schoolId: session.schoolId },
      orderBy: { minScore: "desc" },
    }),
  ]);

  const classId = req.nextUrl.searchParams.get("classId") || assignments[0]?.classId || "";
  const subjectId = req.nextUrl.searchParams.get("subjectId") || assignments[0]?.subjectId || "";

  let students: Array<{
    id: string;
    admissionNo: string;
    user: { fullName: string };
  }> = [];
  let existingResults: Array<{
    studentId: string;
    scores: unknown;
    total: number;
    grade: string;
    remark: string;
    teacherComment: string | null;
    status: string;
  }> = [];

  if (classId && subjectId && currentTerm) {
    [students, existingResults] = await Promise.all([
      prisma.studentProfile.findMany({
        where: { schoolId: session.schoolId, classId, status: "ACTIVE" },
        include: { user: { select: { fullName: true } } },
        orderBy: { admissionNo: "asc" },
      }),
      prisma.resultRecord.findMany({
        where: {
          schoolId: session.schoolId,
          classId,
          subjectId,
          termId: currentTerm.id,
        },
      }),
    ]);
  }

  const components: AssessmentComponent[] =
    (config?.components as AssessmentComponent[] | undefined) ??
    getPresetById("CA1_CA2_EXAM").components;

  return NextResponse.json({
    assignments,
    currentTerm,
    components,
    scales,
    selectedClassId: classId,
    selectedSubjectId: subjectId,
    students,
    existingResults,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = saveScoresSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid score payload" },
      { status: 400 }
    );
  }

  const staff = await prisma.staffProfile.findUnique({ where: { userId: session.userId } });
  const currentTerm = await prisma.term.findFirst({
    where: { schoolId: session.schoolId, isCurrent: true },
  });

  if (!staff || !currentTerm) {
    return NextResponse.json({ error: "Active term or teacher profile missing." }, { status: 400 });
  }

  const { classId, subjectId, submitStatus, entries } = parsed.data;

  const isAssigned = await prisma.subjectAssignment.findFirst({
    where: {
      schoolId: session.schoolId,
      classId,
      subjectId,
      teacherId: staff.id,
    },
  });
  if (!isAssigned) {
    return NextResponse.json(
      { error: "You are not assigned to this class and subject." },
      { status: 403 }
    );
  }

  const scales = await prisma.gradingScale.findMany({
    where: { schoolId: session.schoolId },
  });

  const schoolId = session.schoolId;

  await prisma.$transaction(
    entries.map((entry) => {
      const total = Object.values(entry.scores).reduce((sum, v) => sum + Number(v || 0), 0);
      const { grade, remark } = calculateGrade(total, scales);

      return prisma.resultRecord.upsert({
        where: {
          schoolId_studentId_subjectId_termId: {
            schoolId,
            studentId: entry.studentId,
            subjectId,
            termId: currentTerm.id,
          },
        },
        update: {
          scores: entry.scores as unknown as object,
          total,
          grade,
          remark,
          teacherComment: entry.teacherComment || null,
          status: submitStatus,
          submittedById: session.userId,
        },
        create: {
          schoolId,
          studentId: entry.studentId,
          classId,
          subjectId,
          termId: currentTerm.id,
          scores: entry.scores as unknown as object,
          total,
          grade,
          remark,
          teacherComment: entry.teacherComment || null,
          status: submitStatus,
          submittedById: session.userId,
        },
      });
    })
  );

  return NextResponse.json({
    message:
      submitStatus === "SUBMITTED"
        ? "Results submitted for Admin approval."
        : "Draft scores saved.",
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPresetById } from "@/lib/grading";

const updateGradingSchema = z.object({
  presetId: z.string().min(1),
  components: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        maxScore: z.coerce.number().min(1).max(100),
      })
    )
    .optional(),
  scales: z
    .array(
      z.object({
        id: z.string().optional(),
        grade: z.string().min(1),
        minScore: z.coerce.number().min(0).max(100),
        maxScore: z.coerce.number().min(0).max(100),
        gradePoint: z.coerce.number().min(0).max(10).default(0),
        remark: z.string().min(1),
      })
    )
    .optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [school, currentTerm, config, scales] = await Promise.all([
    prisma.school.findUnique({ where: { id: session.schoolId } }),
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

  return NextResponse.json({
    gradingPreset: school?.gradingPreset ?? "CA1_CA2_EXAM",
    currentTerm,
    config,
    scales,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateGradingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid grading configuration" },
      { status: 400 }
    );
  }

  const { presetId, components, scales } = parsed.data;
  const resolvedComponents =
    components && components.length > 0 ? components : getPresetById(presetId).components;

  const totalMax = resolvedComponents.reduce((acc, c) => acc + c.maxScore, 0);
  if (totalMax !== 100) {
    return NextResponse.json(
      { error: `Assessment component weights must sum to 100 (currently ${totalMax}).` },
      { status: 400 }
    );
  }

  const schoolId = session.schoolId;
  const currentTerm = await prisma.term.findFirst({
    where: { schoolId, isCurrent: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.school.update({
      where: { id: schoolId },
      data: { gradingPreset: presetId },
    });

    const existing = await tx.assessmentConfig.findFirst({
      where: { schoolId, termId: currentTerm?.id ?? null },
    });

    if (existing) {
      await tx.assessmentConfig.update({
        where: { id: existing.id },
        data: { presetName: presetId, components: resolvedComponents as unknown as object },
      });
    } else {
      await tx.assessmentConfig.create({
        data: {
          schoolId,
          termId: currentTerm?.id ?? null,
          presetName: presetId,
          components: resolvedComponents as unknown as object,
        },
      });
    }

    if (scales && scales.length > 0) {
      await tx.gradingScale.deleteMany({ where: { schoolId } });
      await tx.gradingScale.createMany({
        data: scales.map((s) => ({
          schoolId,
          grade: s.grade.toUpperCase(),
          minScore: s.minScore,
          maxScore: s.maxScore,
          gradePoint: s.gradePoint,
          remark: s.remark,
        })),
      });
    }
  });

  return NextResponse.json({ message: "Grading configuration saved." });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { DEFAULT_GRADING_SCALES, getPresetById } from "@/lib/grading";

const onboardSchema = z.object({
  schoolName: z.string().trim().min(2),
  schoolCode: z.string().trim().min(2).max(12),
  schoolEmail: z.string().trim().email(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  schoolType: z.string().trim().default("K-12"),
  planTier: z.string().trim().default("STANDARD"),
  sessionName: z.string().trim().min(4).default("2026/2027"),
  termName: z.string().trim().min(2).default("First Term"),
  gradingPreset: z.string().default("CA1_CA2_EXAM"),
  adminName: z.string().trim().min(2),
  adminEmail: z.string().trim().email(),
  adminPassword: z.string().min(8),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          studentProfiles: true,
          staffProfiles: true,
          users: true,
        },
      },
    },
  });

  return NextResponse.json({ schools });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = onboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid onboarding data" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const normalizedCode = data.schoolCode.toUpperCase().replace(/[^A-Z0-9-]/g, "");

  const existing = await prisma.school.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return NextResponse.json(
      { error: `School code "${normalizedCode}" is already in use.` },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(data.adminPassword);
  const preset = getPresetById(data.gradingPreset);

  const created = await prisma.$transaction(async (tx) => {
    const school = await tx.school.create({
      data: {
        name: data.schoolName,
        code: normalizedCode,
        email: data.schoolEmail.toLowerCase(),
        phone: data.phone || null,
        address: data.address || null,
        schoolType: data.schoolType,
        currency: "NGN",
        planTier: data.planTier,
        gradingPreset: preset.id,
        status: "ACTIVE",
      },
    });

    const academicSession = await tx.academicSession.create({
      data: {
        schoolId: school.id,
        name: data.sessionName,
        isCurrent: true,
      },
    });

    const term = await tx.term.create({
      data: {
        schoolId: school.id,
        sessionId: academicSession.id,
        name: data.termName,
        isCurrent: true,
      },
    });

    await tx.assessmentConfig.create({
      data: {
        schoolId: school.id,
        termId: term.id,
        presetName: preset.id,
        components: preset.components as unknown as object,
      },
    });

    await tx.gradingScale.createMany({
      data: DEFAULT_GRADING_SCALES.map((s) => ({
        schoolId: school.id,
        ...s,
      })),
    });

    const adminUser = await tx.user.create({
      data: {
        schoolId: school.id,
        email: data.adminEmail.toLowerCase(),
        passwordHash,
        fullName: data.adminName,
        role: "SCHOOL_ADMIN",
        status: "ACTIVE",
      },
    });

    return { school, adminEmail: adminUser.email };
  });

  return NextResponse.json(created, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Class name is required"),
  arm: z.string().trim().optional(),
  capacity: z.coerce.number().int().min(1).max(500).default(40),
  classTeacherId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [classes, teachers] = await Promise.all([
    prisma.classRoom.findMany({
      where: { schoolId: session.schoolId },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
      include: {
        classTeacher: { include: { user: { select: { fullName: true } } } },
        _count: { select: { students: true } },
      },
    }),
    prisma.staffProfile.findMany({
      where: { schoolId: session.schoolId },
      include: { user: { select: { fullName: true } } },
      orderBy: { staffId: "asc" },
    }),
  ]);

  return NextResponse.json({ classes, teachers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid class payload" },
      { status: 400 }
    );
  }

  const created = await prisma.classRoom.create({
    data: {
      schoolId: session.schoolId,
      name: parsed.data.name,
      arm: parsed.data.arm || null,
      capacity: parsed.data.capacity,
      classTeacherId: parsed.data.classTeacherId || null,
    },
  });

  return NextResponse.json({ classRoom: created }, { status: 201 });
}

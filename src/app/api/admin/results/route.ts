import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const patchResultsSchema = z.object({
  resultIds: z.array(z.string()).min(1),
  status: z.enum(["DRAFT", "SUBMITTED", "PUBLISHED"]),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const classId = req.nextUrl.searchParams.get("classId") || undefined;
  const subjectId = req.nextUrl.searchParams.get("subjectId") || undefined;

  const [classes, subjects, currentTerm, results] = await Promise.all([
    prisma.classRoom.findMany({
      where: { schoolId: session.schoolId },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
    }),
    prisma.subject.findMany({
      where: { schoolId: session.schoolId },
      orderBy: { name: "asc" },
    }),
    prisma.term.findFirst({
      where: { schoolId: session.schoolId, isCurrent: true },
      include: { session: true },
    }),
    prisma.resultRecord.findMany({
      where: {
        schoolId: session.schoolId,
        ...(classId ? { classId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        classRoom: true,
        subject: true,
        term: { include: { session: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ classes, subjects, currentTerm, results });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchResultsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.resultRecord.updateMany({
    where: {
      schoolId: session.schoolId,
      id: { in: parsed.data.resultIds },
    },
    data: {
      status: parsed.data.status,
      approvedById: parsed.data.status === "PUBLISHED" ? session.userId : null,
    },
  });

  return NextResponse.json({ message: `Updated ${parsed.data.resultIds.length} result(s).` });
}

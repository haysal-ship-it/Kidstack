import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const sendMessageSchema = z.object({
  recipientType: z.enum(["ALL", "ROLE", "CLASS", "USER"]),
  recipientId: z.string().optional().nullable(),
  subject: z.string().trim().min(2),
  body: z.string().trim().min(2),
  isAnnouncement: z.boolean().default(false),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [messages, classes, users] = await Promise.all([
    prisma.message.findMany({
      where: { schoolId: session.schoolId },
      include: { sender: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.classRoom.findMany({
      where: { schoolId: session.schoolId },
      orderBy: [{ name: "asc" }, { arm: "asc" }],
    }),
    prisma.user.findMany({
      where: { schoolId: session.schoolId, status: "ACTIVE" },
      select: { id: true, fullName: true, role: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return NextResponse.json({ messages, classes, users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SCHOOL_ADMIN" || !session.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message payload" },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      schoolId: session.schoolId,
      senderId: session.userId,
      recipientType: parsed.data.recipientType,
      recipientId: parsed.data.recipientId || null,
      subject: parsed.data.subject,
      body: parsed.data.body,
      isAnnouncement: parsed.data.isAnnouncement,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getRoleHomePath,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from "@/lib/auth";

const loginSchema = z.object({
  loginType: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  schoolCode: z.string().trim().optional(),
  identifier: z.string().trim().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid login payload" },
        { status: 400 }
      );
    }

    const { loginType, schoolCode, identifier, password } = parsed.data;

    let user = null;
    let resolvedIdentifier = identifier;

    if (loginType === "ADMIN") {
      user = await prisma.user.findFirst({
        where: {
          email: identifier.toLowerCase(),
          role: { in: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
        },
        include: { school: true },
      });
      resolvedIdentifier = user?.email ?? identifier;
    } else {
      if (!schoolCode) {
        return NextResponse.json(
          { error: "School Code is required for Teacher and Student login." },
          { status: 400 }
        );
      }

      const school = await prisma.school.findUnique({
        where: { code: schoolCode.toUpperCase() },
      });
      if (!school) {
        return NextResponse.json({ error: "Invalid School Code or credentials." }, { status: 401 });
      }

      if (loginType === "TEACHER") {
        const staff = await prisma.staffProfile.findUnique({
          where: { schoolId_staffId: { schoolId: school.id, staffId: identifier.toUpperCase() } },
          include: { user: { include: { school: true } } },
        });
        user = staff?.user ?? null;
        resolvedIdentifier = staff?.staffId ?? identifier;
      } else {
        const student = await prisma.studentProfile.findUnique({
          where: {
            schoolId_admissionNo: { schoolId: school.id, admissionNo: identifier.toUpperCase() },
          },
          include: { user: { include: { school: true } } },
        });
        user = student?.user ?? null;
        resolvedIdentifier = student?.admissionNo ?? identifier;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is currently inactive or suspended. Contact your administrator." },
        { status: 403 }
      );
    }

    if (user.school && user.school.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This school account has been suspended. Contact Kidstack support." },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createSessionToken({
      userId: user.id,
      schoolId: user.schoolId,
      schoolCode: user.school?.code ?? null,
      schoolName: user.school?.name ?? null,
      role: user.role,
      fullName: user.fullName,
      identifier: resolvedIdentifier,
    });

    const response = NextResponse.json({
      redirectTo: getRoleHomePath(user.role),
      role: user.role,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now. Please check database connectivity." },
      { status: 500 }
    );
  }
}

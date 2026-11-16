import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_GRADING_SCALES, getPresetById } from "../src/lib/grading";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Kidstack database...");

  // 1. Super Admin
  const superAdminHash = await bcrypt.hash("SuperAdmin123!", 10);
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@kidstack.io", role: "SUPER_ADMIN" },
  });

  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        email: "superadmin@kidstack.io",
        passwordHash: superAdminHash,
        fullName: "Platform Super Admin",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });
  }

  // 2. Demo School: Greenwood Academy (GWA)
  const school = await prisma.school.upsert({
    where: { code: "GWA" },
    update: {},
    create: {
      name: "Greenwood Academy",
      code: "GWA",
      email: "info@greenwood.edu.ng",
      phone: "+234 800 555 0100",
      address: "14 Victoria Island Way, Lagos",
      schoolType: "K-12",
      currency: "NGN",
      planTier: "PRO",
      gradingPreset: "CA1_CA2_EXAM",
      status: "ACTIVE",
    },
  });

  // 3. Academic Session & Term
  const session = await prisma.academicSession.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "2026/2027" } },
    update: { isCurrent: true },
    create: {
      schoolId: school.id,
      name: "2026/2027",
      isCurrent: true,
    },
  });

  const term = await prisma.term.upsert({
    where: {
      schoolId_sessionId_name: {
        schoolId: school.id,
        sessionId: session.id,
        name: "First Term",
      },
    },
    update: { isCurrent: true },
    create: {
      schoolId: school.id,
      sessionId: session.id,
      name: "First Term",
      isCurrent: true,
    },
  });

  // 4. Grading Scales & Assessment Config
  for (const scale of DEFAULT_GRADING_SCALES) {
    await prisma.gradingScale.upsert({
      where: { schoolId_grade: { schoolId: school.id, grade: scale.grade } },
      update: {},
      create: {
        schoolId: school.id,
        ...scale,
      },
    });
  }

  const preset = getPresetById("CA1_CA2_EXAM");
  const existingConfig = await prisma.assessmentConfig.findFirst({
    where: { schoolId: school.id, termId: term.id },
  });
  if (!existingConfig) {
    await prisma.assessmentConfig.create({
      data: {
        schoolId: school.id,
        termId: term.id,
        presetName: preset.id,
        components: preset.components as unknown as object,
      },
    });
  }

  // 5. School Admin
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: "admin@greenwood.edu.ng" } },
    update: {},
    create: {
      schoolId: school.id,
      email: "admin@greenwood.edu.ng",
      passwordHash: adminHash,
      fullName: "Mrs. Folake Adeyemi",
      role: "SCHOOL_ADMIN",
      status: "ACTIVE",
    },
  });

  // 6. Teachers
  const teacherHash = await bcrypt.hash("Teacher123!", 10);
  const t1User = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: "chinedu.okafor@greenwood.edu.ng" } },
    update: {},
    create: {
      schoolId: school.id,
      email: "chinedu.okafor@greenwood.edu.ng",
      passwordHash: teacherHash,
      fullName: "Mr. Chinedu Okafor",
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const t1Profile = await prisma.staffProfile.upsert({
    where: { schoolId_staffId: { schoolId: school.id, staffId: "TCH-001" } },
    update: {},
    create: {
      userId: t1User.id,
      schoolId: school.id,
      staffId: "TCH-001",
      designation: "Senior Mathematics Teacher",
      department: "Sciences",
      phone: "+234 803 111 2233",
    },
  });

  const t2User = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: "amina.bello@greenwood.edu.ng" } },
    update: {},
    create: {
      schoolId: school.id,
      email: "amina.bello@greenwood.edu.ng",
      passwordHash: teacherHash,
      fullName: "Ms. Amina Bello",
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const t2Profile = await prisma.staffProfile.upsert({
    where: { schoolId_staffId: { schoolId: school.id, staffId: "TCH-002" } },
    update: {},
    create: {
      userId: t2User.id,
      schoolId: school.id,
      staffId: "TCH-002",
      designation: "English & Literature Teacher",
      department: "Humanities",
      phone: "+234 805 444 5566",
    },
  });

  // 7. Classes
  const jss1 = await prisma.classRoom.upsert({
    where: { schoolId_name_arm: { schoolId: school.id, name: "JSS 1", arm: "A" } },
    update: {},
    create: {
      schoolId: school.id,
      name: "JSS 1",
      arm: "A",
      capacity: 35,
      classTeacherId: t1Profile.id,
    },
  });

  const jss2 = await prisma.classRoom.upsert({
    where: { schoolId_name_arm: { schoolId: school.id, name: "JSS 2", arm: "A" } },
    update: {},
    create: {
      schoolId: school.id,
      name: "JSS 2",
      arm: "A",
      capacity: 35,
      classTeacherId: t2Profile.id,
    },
  });

  // 8. Subjects & Assignments
  const math = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "MTH101" } },
    update: {},
    create: { schoolId: school.id, name: "Mathematics", code: "MTH101", department: "Sciences" },
  });

  const eng = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "ENG101" } },
    update: {},
    create: { schoolId: school.id, name: "English Language", code: "ENG101", department: "Humanities" },
  });

  const sci = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "BSC101" } },
    update: {},
    create: { schoolId: school.id, name: "Basic Science", code: "BSC101", department: "Sciences" },
  });

  await prisma.subjectAssignment.upsert({
    where: {
      schoolId_classId_subjectId: { schoolId: school.id, classId: jss1.id, subjectId: math.id },
    },
    update: {},
    create: { schoolId: school.id, classId: jss1.id, subjectId: math.id, teacherId: t1Profile.id },
  });
  await prisma.subjectAssignment.upsert({
    where: {
      schoolId_classId_subjectId: { schoolId: school.id, classId: jss1.id, subjectId: sci.id },
    },
    update: {},
    create: { schoolId: school.id, classId: jss1.id, subjectId: sci.id, teacherId: t1Profile.id },
  });
  await prisma.subjectAssignment.upsert({
    where: {
      schoolId_classId_subjectId: { schoolId: school.id, classId: jss1.id, subjectId: eng.id },
    },
    update: {},
    create: { schoolId: school.id, classId: jss1.id, subjectId: eng.id, teacherId: t2Profile.id },
  });

  // 9. Students
  const studentHash = await bcrypt.hash("Student123!", 10);
  const demoStudents = [
    {
      admissionNo: "GWA-2026-001",
      fullName: "Toluwanimi Balogun",
      email: "tolu.balogun@student.greenwood.edu.ng",
      gender: "FEMALE" as const,
      classId: jss1.id,
      guardianName: "Mr. Kunle Balogun",
      guardianPhone: "+234 802 333 4455",
    },
    {
      admissionNo: "GWA-2026-002",
      fullName: "Ibrahim Musa",
      email: "ibrahim.musa@student.greenwood.edu.ng",
      gender: "MALE" as const,
      classId: jss1.id,
      guardianName: "Hajiya Zainab Musa",
      guardianPhone: "+234 809 777 8899",
    },
    {
      admissionNo: "GWA-2026-003",
      fullName: "Chisom Eze",
      email: "chisom.eze@student.greenwood.edu.ng",
      gender: "FEMALE" as const,
      classId: jss2.id,
      guardianName: "Dr. Emeka Eze",
      guardianPhone: "+234 806 222 1100",
    },
  ];

  const createdStudents = [];
  for (const s of demoStudents) {
    const u = await prisma.user.upsert({
      where: { schoolId_email: { schoolId: school.id, email: s.email } },
      update: {},
      create: {
        schoolId: school.id,
        email: s.email,
        passwordHash: studentHash,
        fullName: s.fullName,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });
    const sp = await prisma.studentProfile.upsert({
      where: { schoolId_admissionNo: { schoolId: school.id, admissionNo: s.admissionNo } },
      update: {},
      create: {
        userId: u.id,
        schoolId: school.id,
        admissionNo: s.admissionNo,
        classId: s.classId,
        gender: s.gender,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        status: "ACTIVE",
      },
    });
    createdStudents.push(sp);
  }

  // 10. Fee Structure & Sample Payment (NGN)
  await prisma.feeStructure.upsert({
    where: {
      schoolId_termId_classId: { schoolId: school.id, termId: term.id, classId: jss1.id },
    },
    update: {},
    create: {
      schoolId: school.id,
      termId: term.id,
      classId: jss1.id,
      title: "JSS 1 First Term Tuition & Levies",
      items: [
        { name: "Tuition Fee", amount: 85000 },
        { name: "Development Levy", amount: 20000 },
        { name: "Science & ICT Lab", amount: 12000 },
        { name: "Sports & Library", amount: 8000 },
      ],
      totalAmount: 125000,
    },
  });

  const existingPayment = await prisma.feePayment.findUnique({
    where: { receiptNo: "RCP-GWA-2026-0001" },
  });
  if (!existingPayment && createdStudents[0]) {
    await prisma.feePayment.create({
      data: {
        schoolId: school.id,
        studentId: createdStudents[0].id,
        termId: term.id,
        amount: 85000,
        method: "BANK_TRANSFER",
        reference: "NIP-20261110-9912",
        receiptNo: "RCP-GWA-2026-0001",
        notes: "First installment (Tuition)",
        recordedById: adminUser.id,
      },
    });
  }

  // 11. Sample Published Result for Student 1
  if (createdStudents[0]) {
    await prisma.resultRecord.upsert({
      where: {
        schoolId_studentId_subjectId_termId: {
          schoolId: school.id,
          studentId: createdStudents[0].id,
          subjectId: math.id,
          termId: term.id,
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        studentId: createdStudents[0].id,
        classId: jss1.id,
        subjectId: math.id,
        termId: term.id,
        scores: { ca1: 18, ca2: 17, exam: 51 },
        total: 86,
        grade: "A",
        remark: "Excellent",
        teacherComment: "Consistent problem-solving skills.",
        status: "PUBLISHED",
        submittedById: t1User.id,
        approvedById: adminUser.id,
      },
    });
  }

  // 12. Sample Announcement Message
  const existingMsg = await prisma.message.findFirst({ where: { schoolId: school.id } });
  if (!existingMsg) {
    await prisma.message.create({
      data: {
        schoolId: school.id,
        senderId: adminUser.id,
        recipientType: "ALL",
        subject: "Welcome to 2026/2027 First Term",
        body: "Welcome back to Greenwood Academy! Please ensure all First Term school fees are settled before mid-term assessments.",
        isAnnouncement: true,
      },
    });
  }

  console.log("Kidstack seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

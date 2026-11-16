import { redirect } from "next/navigation";
import { getRoleHomePath, getSession } from "@/lib/auth";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

export const instant = false;

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/admin", icon: "dashboard" }],
  },
  {
    title: "Administration",
    items: [
      { label: "Manage Classes", href: "/admin/classes", icon: "classes" },
      { label: "Manage Students", href: "/admin/students", icon: "students" },
      { label: "Manage Staff", href: "/admin/staff", icon: "staff" },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Subjects & Teachers", href: "/admin/subjects", icon: "subjects" },
      { label: "Grading", href: "/admin/grading", icon: "grading" },
      { label: "Results", href: "/admin/results", icon: "results" },
    ],
  },
  {
    title: "Finance",
    items: [{ label: "Manage School Fees", href: "/admin/fees", icon: "finance" }],
  },
  {
    title: "Communication",
    items: [{ label: "Messages", href: "/admin/messages", icon: "messages" }],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SCHOOL_ADMIN") redirect(getRoleHomePath(session.role));

  return (
    <PortalShell
      role={session.role}
      fullName={session.fullName}
      identifier={session.identifier}
      schoolName={session.schoolName}
      navGroups={NAV_GROUPS}
    >
      {children}
    </PortalShell>
  );
}

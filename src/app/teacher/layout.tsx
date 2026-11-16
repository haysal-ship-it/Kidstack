import { redirect } from "next/navigation";
import { getRoleHomePath, getSession } from "@/lib/auth";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

export const instant = false;

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Teacher Portal",
    items: [
      { label: "My Profile", href: "/teacher", icon: "profile" },
      { label: "Manage Results", href: "/teacher/results", icon: "results" },
      { label: "Change Password", href: "/teacher/change-password", icon: "password" },
    ],
  },
];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "TEACHER") redirect(getRoleHomePath(session.role));

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

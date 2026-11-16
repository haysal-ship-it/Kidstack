import { redirect } from "next/navigation";
import { getRoleHomePath, getSession } from "@/lib/auth";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

export const instant = false;

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Student Portal",
    items: [
      { label: "My Profile", href: "/student", icon: "profile" },
      { label: "My Results", href: "/student/results", icon: "results" },
      { label: "My School Fees", href: "/student/fees", icon: "finance" },
      { label: "Change Password", href: "/student/change-password", icon: "password" },
    ],
  },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect(getRoleHomePath(session.role));

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

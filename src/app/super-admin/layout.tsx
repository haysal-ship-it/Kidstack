import { redirect } from "next/navigation";
import { getRoleHomePath, getSession } from "@/lib/auth";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

export const instant = false;

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { label: "Dashboard", href: "/super-admin", icon: "dashboard" },
      { label: "Onboarding", href: "/super-admin/onboarding", icon: "onboarding" },
      { label: "Manage Accounts", href: "/super-admin/accounts", icon: "schools" },
    ],
  },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect(getRoleHomePath(session.role));

  return (
    <PortalShell
      role={session.role}
      fullName={session.fullName}
      identifier={session.identifier}
      schoolName="Kidstack Platform"
      navGroups={NAV_GROUPS}
    >
      {children}
    </PortalShell>
  );
}

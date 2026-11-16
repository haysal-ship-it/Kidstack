import { redirect } from "next/navigation";
import { getRoleHomePath, getSession } from "@/lib/auth";

export const instant = false;

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  redirect(getRoleHomePath(session.role));
}

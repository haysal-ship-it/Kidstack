import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-8 text-center space-y-4">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            404 — Page Not Found
          </p>
          <h1 className="text-xl font-bold text-[#0F172A]">
            We couldn&apos;t find that page
          </h1>
          <p className="text-sm text-[#475569]">
            The link may be outdated, or you may not have access to this route.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

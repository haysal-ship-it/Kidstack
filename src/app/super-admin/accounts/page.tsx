"use client";

import * as React from "react";
import { Search, PauseCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

interface SchoolRow {
  id: string;
  name: string;
  code: string;
  email: string;
  planTier: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  createdAt: string;
  _count: {
    studentProfiles: number;
    staffProfiles: number;
    users: number;
  };
}

export default function ManageAccountsPage() {
  const [schools, setSchools] = React.useState<SchoolRow[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const loadSchools = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/schools");
      const data = await res.json();
      setSchools(data.schools ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  async function toggleStatus(school: SchoolRow) {
    const nextStatus = school.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingId(school.id);
    try {
      const res = await fetch(`/api/super-admin/schools/${school.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setSchools((prev) =>
          prev.map((s) => (s.id === school.id ? { ...s, status: nextStatus } : s))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Manage School Accounts</h1>
        <p className="text-sm text-[#64748B]">
          Search tenants, inspect user counts, and activate or suspend school access.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Onboarded Tenants ({filtered.length})</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#64748B]"
              aria-hidden="true"
            />
            <Input
              placeholder="Search by school name or code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2 py-6">
              <div className="h-10 animate-pulse rounded-lg bg-[#F1F5F9]" />
              <div className="h-10 animate-pulse rounded-lg bg-[#F1F5F9]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B]">No matching schools found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold uppercase text-[#64748B]">
                    <th className="py-3 pr-4">School</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Students / Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.map((school) => (
                    <tr key={school.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#1E293B]">{school.name}</p>
                        <p className="text-xs text-[#64748B]">{school.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{school.code}</td>
                      <td className="py-3 px-4">
                        <Badge variant="info">{school.planTier}</Badge>
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        {school._count.studentProfiles} / {school._count.staffProfiles}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={school.status === "ACTIVE" ? "success" : "danger"}>
                          {school.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">{formatDate(school.createdAt)}</td>
                      <td className="py-3 pl-4 text-right">
                        <Button
                          size="sm"
                          variant={school.status === "ACTIVE" ? "outline" : "primary"}
                          loading={updatingId === school.id}
                          onClick={() => toggleStatus(school)}
                        >
                          {school.status === "ACTIVE" ? (
                            <>
                              <PauseCircle className="h-3.5 w-3.5 text-[#DC2626]" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

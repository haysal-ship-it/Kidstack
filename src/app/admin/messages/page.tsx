"use client";

import * as React from "react";
import { Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

interface MessageRow {
  id: string;
  subject: string;
  body: string;
  recipientType: string;
  isAnnouncement: boolean;
  createdAt: string;
  sender: { fullName: string; role: string };
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = React.useState<MessageRow[]>([]);
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string; arm: string | null }>>([]);
  const [recipientType, setRecipientType] = React.useState("ALL");
  const [recipientId, setRecipientId] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setClasses(data.classes ?? []);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType,
          recipientId: recipientId || null,
          subject,
          body,
          isAnnouncement: recipientType === "ALL",
        }),
      });
      if (res.ok) {
        setSubject("");
        setBody("");
        await loadData();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">School Communication</h1>
        <p className="text-sm text-[#64748B]">
          Broadcast announcements or send targeted messages to classes and roles.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[#2563EB]" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-3.5">
              <Select
                label="Audience"
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value);
                  setRecipientId("");
                }}
              >
                <option value="ALL">All School Users (Announcement)</option>
                <option value="ROLE">Specific Role</option>
                <option value="CLASS">Specific Class</option>
              </Select>

              {recipientType === "ROLE" && (
                <Select
                  label="Select Role"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                >
                  <option value="">Choose role...</option>
                  <option value="TEACHER">All Teachers</option>
                  <option value="STUDENT">All Students</option>
                </Select>
              )}

              {recipientType === "CLASS" && (
                <Select
                  label="Select Class"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                >
                  <option value="">Choose class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.arm ? `- ${c.arm}` : ""}
                    </option>
                  ))}
                </Select>
              )}

              <Input
                label="Subject"
                placeholder="e.g. Mid-Term Break Notice"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1E293B]">Message</label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  required
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                />
              </div>

              <Button type="submit" className="w-full" loading={sending}>
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#2563EB]" />
              Sent Messages ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#64748B]">No messages sent yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="rounded-xl border border-[#E2E8F0] p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[#1E293B]">{m.subject}</p>
                      <Badge variant={m.isAnnouncement ? "info" : "neutral"}>
                        {m.recipientType}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#475569]">{m.body}</p>
                    <p className="text-xs text-[#94A3B8]">
                      Sent by {m.sender.fullName} · {formatDate(m.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

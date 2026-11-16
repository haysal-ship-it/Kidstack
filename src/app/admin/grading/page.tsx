"use client";

import * as React from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GRADING_PRESETS, type AssessmentComponent } from "@/lib/grading";

interface ScaleRow {
  grade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  remark: string;
}

export default function GradingConfigPage() {
  const [presetId, setPresetId] = React.useState("CA1_CA2_EXAM");
  const [components, setComponents] = React.useState<AssessmentComponent[]>([]);
  const [scales, setScales] = React.useState<ScaleRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/grading");
        const data = await res.json();
        const activePreset = data.gradingPreset || "CA1_CA2_EXAM";
        setPresetId(activePreset);
        if (data.config?.components) {
          setComponents(data.config.components as AssessmentComponent[]);
        } else {
          const found = GRADING_PRESETS.find((p) => p.id === activePreset) ?? GRADING_PRESETS[0];
          setComponents(found.components);
        }
        setScales(data.scales ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function selectPreset(id: string) {
    setPresetId(id);
    const found = GRADING_PRESETS.find((p) => p.id === id);
    if (found) {
      setComponents(found.components.map((c) => ({ ...c })));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/grading", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId, components, scales }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save grading configuration.");
        return;
      }
      setMessage(data.message || "Grading configuration saved.");
    } finally {
      setSaving(false);
    }
  }

  const totalWeight = components.reduce((sum, c) => sum + Number(c.maxScore || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Grading &amp; Assessment Presets</h1>
        <p className="text-sm text-[#64748B]">
          Choose your preferred grading preset, customize component weights (total 100%), and
          configure grade bands.
        </p>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-white border border-[#E2E8F0]" />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
            >
              {error}
            </div>
          )}
          {message && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]"
            >
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#2563EB]" />
                Select Grading Preset
              </CardTitle>
              <CardDescription>
                Pick a preset structure; you can fine-tune individual max scores below.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {GRADING_PRESETS.map((preset) => {
                const active = presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.id)}
                    className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                      active
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <p className="font-semibold text-sm text-[#1E293B]">{preset.name}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{preset.description}</p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Components (Total: {totalWeight}%)</CardTitle>
                <CardDescription>Max scores must add up to 100.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {components.map((comp, idx) => (
                  <div key={comp.key} className="grid grid-cols-2 gap-3">
                    <Input
                      label="Label"
                      value={comp.label}
                      onChange={(e) => {
                        const next = [...components];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setComponents(next);
                      }}
                    />
                    <Input
                      label="Max Score"
                      type="number"
                      min={1}
                      max={100}
                      value={comp.maxScore}
                      onChange={(e) => {
                        const next = [...components];
                        next[idx] = { ...next[idx], maxScore: Number(e.target.value) };
                        setComponents(next);
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grading Scale Bands</CardTitle>
                <CardDescription>Score ranges used to auto-assign grades.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {scales.map((scale, idx) => (
                  <div key={scale.grade} className="grid grid-cols-4 gap-2 items-end">
                    <Input
                      label={idx === 0 ? "Grade" : undefined}
                      value={scale.grade}
                      onChange={(e) => {
                        const next = [...scales];
                        next[idx] = { ...next[idx], grade: e.target.value };
                        setScales(next);
                      }}
                    />
                    <Input
                      label={idx === 0 ? "Min" : undefined}
                      type="number"
                      step="0.01"
                      value={scale.minScore}
                      onChange={(e) => {
                        const next = [...scales];
                        next[idx] = { ...next[idx], minScore: Number(e.target.value) };
                        setScales(next);
                      }}
                    />
                    <Input
                      label={idx === 0 ? "Max" : undefined}
                      type="number"
                      step="0.01"
                      value={scale.maxScore}
                      onChange={(e) => {
                        const next = [...scales];
                        next[idx] = { ...next[idx], maxScore: Number(e.target.value) };
                        setScales(next);
                      }}
                    />
                    <Input
                      label={idx === 0 ? "Remark" : undefined}
                      value={scale.remark}
                      onChange={(e) => {
                        const next = [...scales];
                        next[idx] = { ...next[idx], remark: e.target.value };
                        setScales(next);
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={saving}>
              Save Grading Configuration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

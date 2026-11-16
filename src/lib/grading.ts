export interface AssessmentComponent {
  key: string;
  label: string;
  maxScore: number;
}

export interface GradingPresetDefinition {
  id: string;
  name: string;
  description: string;
  components: AssessmentComponent[];
}

export const GRADING_PRESETS: GradingPresetDefinition[] = [
  {
    id: "CA1_CA2_EXAM",
    name: "Standard (CA1 20% + CA2 20% + Exam 60%)",
    description: "Two continuous assessments (20 marks each) and one final exam (60 marks).",
    components: [
      { key: "ca1", label: "CA 1", maxScore: 20 },
      { key: "ca2", label: "CA 2", maxScore: 20 },
      { key: "exam", label: "Exam", maxScore: 60 },
    ],
  },
  {
    id: "CA_EXAM",
    name: "Two-Part (CA 40% + Exam 60%)",
    description: "Single combined continuous assessment (40 marks) and final exam (60 marks).",
    components: [
      { key: "ca", label: "Continuous Assessment", maxScore: 40 },
      { key: "exam", label: "Exam", maxScore: 60 },
    ],
  },
  {
    id: "THREE_CA_EXAM",
    name: "Tri-CA (CA1 10% + CA2 10% + CA3 20% + Exam 60%)",
    description: "Three continuous assessments totaling 40 marks plus a 60-mark exam.",
    components: [
      { key: "ca1", label: "CA 1", maxScore: 10 },
      { key: "ca2", label: "CA 2", maxScore: 10 },
      { key: "ca3", label: "CA 3", maxScore: 20 },
      { key: "exam", label: "Exam", maxScore: 60 },
    ],
  },
];

export const DEFAULT_GRADING_SCALES = [
  { grade: "A", minScore: 70, maxScore: 100, gradePoint: 5.0, remark: "Excellent" },
  { grade: "B", minScore: 60, maxScore: 69.99, gradePoint: 4.0, remark: "Very Good" },
  { grade: "C", minScore: 50, maxScore: 59.99, gradePoint: 3.0, remark: "Good" },
  { grade: "D", minScore: 45, maxScore: 49.99, gradePoint: 2.0, remark: "Pass" },
  { grade: "E", minScore: 40, maxScore: 44.99, gradePoint: 1.0, remark: "Fair" },
  { grade: "F", minScore: 0, maxScore: 39.99, gradePoint: 0.0, remark: "Needs Improvement" },
];

export function getPresetById(presetId: string): GradingPresetDefinition {
  return GRADING_PRESETS.find((p) => p.id === presetId) ?? GRADING_PRESETS[0];
}

export function calculateGrade(
  total: number,
  scales: Array<{ grade: string; minScore: number; maxScore: number; remark: string }>
): { grade: string; remark: string } {
  const sorted = [...scales].sort((a, b) => b.minScore - a.minScore);
  for (const band of sorted) {
    if (total >= band.minScore && total <= band.maxScore) {
      return { grade: band.grade, remark: band.remark };
    }
  }
  const fallback = sorted[sorted.length - 1];
  return fallback
    ? { grade: fallback.grade, remark: fallback.remark }
    : { grade: "F", remark: "Needs Improvement" };
}

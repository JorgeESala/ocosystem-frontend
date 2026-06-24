export type ScoreTone = "good" | "warn" | "bad" | "idle";

export const scoreToTone = (score: number | null | undefined): ScoreTone => {
  if (score == null || Number.isNaN(score)) {
    return "idle";
  }
  if (score >= 80) {
    return "good";
  }
  if (score >= 60) {
    return "warn";
  }
  return "bad";
};

export const TONE_CLASSES: Record<ScoreTone, string> = {
  good: "text-emerald-300",
  warn: "text-amber-300",
  bad: "text-rose-300",
  idle: "text-slate-400",
};

export const TONE_BG_CLASSES: Record<ScoreTone, string> = {
  good: "bg-emerald-900/30 ring-1 ring-emerald-700/40",
  warn: "bg-amber-900/30 ring-1 ring-amber-700/40",
  bad: "bg-rose-900/30 ring-1 ring-rose-700/40",
  idle: "bg-slate-800 ring-1 ring-slate-700/60",
};

export const TONE_BAR_CLASSES: Record<ScoreTone, string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-rose-500",
  idle: "bg-slate-600",
};

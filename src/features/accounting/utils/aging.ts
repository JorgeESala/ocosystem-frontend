export type AgingBucket = "0-7" | "8-14" | "15-30" | "30+";

export const getAgingDays = (isoDate: string, now = Date.now()): number => {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.max(0, Math.ceil((now - time) / (1000 * 60 * 60 * 24)));
};

export const getAgingBucket = (days: number): AgingBucket => {
  if (days <= 7) return "0-7";
  if (days <= 14) return "8-14";
  if (days <= 30) return "15-30";
  return "30+";
};

export const AGING_BUCKET_LABEL: Record<AgingBucket, string> = {
  "0-7": "0-7 días",
  "8-14": "8-14 días",
  "15-30": "15-30 días",
  "30+": "+30 días",
};

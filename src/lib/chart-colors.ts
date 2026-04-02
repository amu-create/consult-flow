// 차트에서 사용할 hex 색상 매핑
export const STATUS_CHART_COLORS: Record<string, string> = {
  NEW_INQUIRY: "#3b82f6",    // blue-500
  INITIAL_CONSULT: "#0ea5e9", // sky-500
  IN_PROGRESS: "#eab308",     // yellow-500
  TRIAL_BOOKED: "#f97316",    // orange-500
  TRIAL_DONE: "#f59e0b",      // amber-500
  REGISTERED: "#22c55e",      // green-500
  DROPPED: "#6b7280",         // gray-500
  ON_HOLD: "#a855f7",         // purple-500
};

export const SOURCE_CHART_COLORS: Record<string, string> = {
  KAKAO: "#FEE500",
  PHONE: "#3b82f6",
  VISIT: "#22c55e",
  REFERRAL: "#f97316",
  ONLINE: "#8b5cf6",
  FLYER: "#ec4899",
  OTHER: "#6b7280",
};

export const CHART_PALETTE = [
  "#3b82f6", "#22c55e", "#f97316", "#8b5cf6",
  "#ec4899", "#eab308", "#14b8a6", "#f43f5e",
  "#0ea5e9", "#a855f7",
];

// 퍼널 순서 (활성 상태만)
export const FUNNEL_ORDER = [
  "NEW_INQUIRY",
  "INITIAL_CONSULT",
  "IN_PROGRESS",
  "TRIAL_BOOKED",
  "TRIAL_DONE",
  "REGISTERED",
] as const;

// 리드 상태 (8개 - NEGOTIATING 제거)
export const LEAD_STATUS = {
  NEW_INQUIRY: "NEW_INQUIRY",
  INITIAL_CONSULT: "INITIAL_CONSULT",
  IN_PROGRESS: "IN_PROGRESS",
  TRIAL_BOOKED: "TRIAL_BOOKED",
  TRIAL_DONE: "TRIAL_DONE",
  REGISTERED: "REGISTERED",
  DROPPED: "DROPPED",
  ON_HOLD: "ON_HOLD",
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW_INQUIRY: "신규문의",
  INITIAL_CONSULT: "초기상담",
  IN_PROGRESS: "상담진행",
  TRIAL_BOOKED: "체험예약",
  TRIAL_DONE: "체험완료",
  REGISTERED: "등록완료",
  DROPPED: "이탈",
  ON_HOLD: "보류",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW_INQUIRY: "bg-blue-100 text-blue-800",
  INITIAL_CONSULT: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  TRIAL_BOOKED: "bg-orange-100 text-orange-800",
  TRIAL_DONE: "bg-amber-100 text-amber-800",
  REGISTERED: "bg-green-100 text-green-800",
  DROPPED: "bg-gray-100 text-gray-800",
  ON_HOLD: "bg-purple-100 text-purple-800",
};

// 상태 전이 맵 (NEGOTIATING 제거 반영)
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW_INQUIRY: ["INITIAL_CONSULT"],
  INITIAL_CONSULT: ["IN_PROGRESS", "TRIAL_BOOKED", "DROPPED", "ON_HOLD"],
  IN_PROGRESS: ["TRIAL_BOOKED", "REGISTERED", "DROPPED", "ON_HOLD"],
  TRIAL_BOOKED: ["TRIAL_DONE", "DROPPED", "ON_HOLD"],
  TRIAL_DONE: ["REGISTERED", "DROPPED", "ON_HOLD"],
  ON_HOLD: ["INITIAL_CONSULT", "IN_PROGRESS", "DROPPED"],
  REGISTERED: [],
  DROPPED: [],
};

// 상담 채널
export const CHANNELS = {
  KAKAO: "카카오톡",
  PHONE: "전화",
  SMS: "문자",
  VISIT: "방문",
  OTHER: "기타",
} as const;

// 문의 경로
export const INQUIRY_SOURCES = {
  KAKAO: "카카오톡",
  PHONE: "전화",
  VISIT: "방문",
  REFERRAL: "지인 소개",
  ONLINE: "온라인",
  FLYER: "전단지",
  OTHER: "기타",
} as const;

// 태스크 유형
export const TASK_TYPES = {
  CALL: "전화 연락",
  SMS: "문자 발송",
  KAKAO: "카톡 메시지",
  VISIT_REMIND: "방문 리마인드",
  SEND_INFO: "자료 전달",
  OTHER: "기타",
} as const;

// 태스크 상태
export const TASK_STATUS = {
  PENDING: "대기",
  COMPLETED: "완료",
  OVERDUE: "기한 초과",
  CANCELLED: "취소",
} as const;

// 우선순위
export const PRIORITIES = {
  LOW: "낮음",
  NORMAL: "보통",
  HIGH: "높음",
  URGENT: "긴급",
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

// 이탈 사유 (QUALITY → NO_RESPONSE 교체)
export const DROP_OFF_REASONS = {
  TIME: "시간표 불일치",
  PRICE: "수강료 부담",
  COMPETITOR: "타 학원 등록",
  CHILD_REJECT: "아이 거부",
  PARENT_DISAGREE: "부모 의견 불일치",
  DISTANCE: "거리/교통",
  DELAYED_FOLLOWUP: "후속 연락 지연",
  TIMING: "시기 아님",
  NO_RESPONSE: "연락두절/무응답",
  OTHER: "기타",
} as const;

// 관심 신호
export const INTEREST_SIGNALS: Record<string, { label: string; score: number }> = {
  VISITED: { label: "방문 상담", score: 3 },
  TRIAL_REQUESTED: { label: "체험 요청", score: 3 },
  PRICE_ASKED: { label: "수강료 문의", score: 2 },
  SCHEDULE_CHECKED: { label: "시간표 확인", score: 2 },
  ENROLLMENT_TIMING: { label: "등록 시점 질문", score: 2 },
  QUICK_RESPONSE: { label: "빠른 응답", score: 1 },
  ADDITIONAL_QUESTION: { label: "추가 질문", score: 1 },
  SLOW_RESPONSE: { label: "느린 응답", score: -1 },
  COMPARING: { label: "타 학원 비교", score: -1 },
  PRICE_CONCERN: { label: "가격 부담 표현", score: -1 },
};

// 관심도 등급
export function getInterestLevel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 9) return { label: "등록 임박", color: "bg-red-100 text-red-800" };
  if (score >= 6) return { label: "높음", color: "bg-orange-100 text-orange-800" };
  if (score >= 3) return { label: "보통", color: "bg-yellow-100 text-yellow-800" };
  return { label: "차가움", color: "bg-blue-100 text-blue-800" };
}

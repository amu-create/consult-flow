import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) });
const prisma = new PrismaClient({ adapter });

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Users
  const owner = await prisma.user.create({
    data: { name: "박원장", email: "owner@consultflow.kr", password: hash("demo1234"), role: "OWNER" },
  });
  const manager = await prisma.user.create({
    data: { name: "김실장", email: "manager@consultflow.kr", password: hash("demo1234"), role: "MANAGER" },
  });
  const staff = await prisma.user.create({
    data: { name: "이선생", email: "staff@consultflow.kr", password: hash("demo1234"), role: "STAFF" },
  });

  // ---- 리드 데이터 (25명, 6개월 분산) ----

  // 1. 홍길동 - IN_PROGRESS (30일 전 등록)
  const lead1 = await prisma.lead.create({
    data: {
      studentName: "홍길동", grade: "중2", subject: "영어",
      parentName: "홍어머니", parentPhone: "010-1234-5678", parentRelation: "어머니",
      inquirySource: "KAKAO", status: "IN_PROGRESS", interestScore: 6,
      assignedTo: owner.id, createdAt: daysAgo(30), updatedAt: daysAgo(1),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead1.id, channel: "KAKAO", content: "카카오톡으로 중2 영어 수업 문의. 현재 다른 학원 없음.", interestSignals: JSON.stringify(["QUICK_RESPONSE"]), createdBy: owner.id, createdAt: daysAgo(30) },
  });
  await prisma.consultation.create({
    data: { leadId: lead1.id, channel: "PHONE", content: "어머니와 전화 상담. 시간표 확인 원함. 수강료 문의함.", interestSignals: JSON.stringify(["PRICE_ASKED", "SCHEDULE_CHECKED"]), createdBy: owner.id, createdAt: daysAgo(25) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead1.id, assignedTo: owner.id, taskType: "VISIT_REMIND", description: "방문 상담 리마인드 전화", dueDate: daysAgo(-1), priority: "HIGH", status: "PENDING" },
  });
  await prisma.statusLog.create({ data: { leadId: lead1.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: owner.id, createdAt: daysAgo(28) } });
  await prisma.statusLog.create({ data: { leadId: lead1.id, fromStatus: "INITIAL_CONSULT", toStatus: "IN_PROGRESS", changedBy: owner.id, createdAt: daysAgo(20) } });

  // 2. 이서연 - TRIAL_BOOKED (45일 전)
  const lead2 = await prisma.lead.create({
    data: {
      studentName: "이서연", grade: "고1", subject: "수학",
      parentName: "이아버지", parentPhone: "010-2345-6789", parentRelation: "아버지",
      inquirySource: "PHONE", status: "TRIAL_BOOKED", interestScore: 8,
      assignedTo: manager.id, createdAt: daysAgo(45), updatedAt: daysAgo(2),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead2.id, channel: "PHONE", content: "전화 문의. 수학 성적 향상 희망. 내신 3등급.", interestSignals: JSON.stringify(["PRICE_ASKED"]), createdBy: manager.id, createdAt: daysAgo(45) },
  });
  await prisma.consultation.create({
    data: { leadId: lead2.id, channel: "VISIT", content: "방문 상담 완료. 시간표 확인, 체험수업 예약.", interestSignals: JSON.stringify(["VISITED", "TRIAL_REQUESTED", "SCHEDULE_CHECKED"]), createdBy: manager.id, createdAt: daysAgo(40) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead2.id, assignedTo: manager.id, taskType: "SMS", description: "체험수업 전날 문자 발송", dueDate: daysAgo(-2), priority: "NORMAL", status: "PENDING" },
  });

  // 3. 박지호 - NEW_INQUIRY (2일 전)
  const lead3 = await prisma.lead.create({
    data: {
      studentName: "박지호", grade: "초6", subject: "영어",
      parentName: "박어머니", parentPhone: "010-3456-7890",
      inquirySource: "KAKAO", status: "NEW_INQUIRY", interestScore: 1,
      assignedTo: owner.id, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead3.id, channel: "KAKAO", content: "초6 영어 수업 문의. 커리큘럼 질문.", interestSignals: JSON.stringify(["ADDITIONAL_QUESTION"]), createdBy: owner.id, createdAt: daysAgo(2) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead3.id, assignedTo: owner.id, taskType: "CALL", description: "전화해서 상세 상담", dueDate: new Date(), priority: "NORMAL", status: "PENDING" },
  });

  // 4. 최윤아 - TRIAL_DONE (60일 전)
  const lead4 = await prisma.lead.create({
    data: {
      studentName: "최윤아", grade: "중3", subject: "수학",
      parentName: "최어머니", parentPhone: "010-4567-8901",
      inquirySource: "VISIT", status: "TRIAL_DONE", interestScore: 9,
      assignedTo: manager.id, createdAt: daysAgo(60), updatedAt: daysAgo(3),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead4.id, channel: "VISIT", content: "방문 상담. 수학 1등급 목표. 매우 적극적.", interestSignals: JSON.stringify(["VISITED", "PRICE_ASKED", "ENROLLMENT_TIMING"]), createdBy: manager.id, createdAt: daysAgo(55) },
  });
  await prisma.consultation.create({
    data: { leadId: lead4.id, channel: "PHONE", content: "체험 후 통화. 아이 만족. 등록 의사 있음.", interestSignals: JSON.stringify(["TRIAL_REQUESTED", "QUICK_RESPONSE"]), createdBy: manager.id, createdAt: daysAgo(50) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead4.id, assignedTo: manager.id, taskType: "SEND_INFO", description: "수강료 및 시간표 안내 발송", dueDate: daysAgo(-1), priority: "HIGH", status: "PENDING" },
  });

  // 5. 장민수 - DROPPED (90일 전, 시간 불일치)
  const lead5 = await prisma.lead.create({
    data: {
      studentName: "장민수", grade: "중1", subject: "영어",
      parentName: "장아버지", parentPhone: "010-5678-9012", parentRelation: "아버지",
      inquirySource: "PHONE", status: "DROPPED", interestScore: 3,
      assignedTo: owner.id, createdAt: daysAgo(90), updatedAt: daysAgo(80),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead5.id, channel: "PHONE", content: "영어 기초반 관심. 시간표 확인 요청.", interestSignals: JSON.stringify(["SCHEDULE_CHECKED"]), createdBy: owner.id, createdAt: daysAgo(90) },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead5.id, reasons: JSON.stringify(["TIME"]), detailMemo: "저녁반 시간이 안 맞아서 포기", canRetry: false, createdBy: owner.id },
  });
  await prisma.statusLog.create({ data: { leadId: lead5.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: owner.id, createdAt: daysAgo(88) } });
  await prisma.statusLog.create({ data: { leadId: lead5.id, fromStatus: "INITIAL_CONSULT", toStatus: "DROPPED", changedBy: owner.id, reason: "시간표 불일치", createdAt: daysAgo(80) } });

  // 6. 김하윤 - INITIAL_CONSULT (방치 리드, 4일 전 마지막 업데이트)
  await prisma.lead.create({
    data: {
      studentName: "김하윤", grade: "중1", subject: "수학",
      parentName: "김어머니", parentPhone: "010-6789-0123",
      inquirySource: "ONLINE", status: "INITIAL_CONSULT", interestScore: 4,
      assignedTo: owner.id, createdAt: daysAgo(10), updatedAt: daysAgo(4),
    },
  });

  // 7. 정다인 - REGISTERED (120일 전 등록, 카카오 경로)
  const lead7 = await prisma.lead.create({
    data: {
      studentName: "정다인", grade: "고2", subject: "영어",
      parentName: "정어머니", parentPhone: "010-7890-1234", parentRelation: "어머니",
      inquirySource: "KAKAO", status: "REGISTERED", interestScore: 10,
      assignedTo: manager.id, createdAt: daysAgo(120), updatedAt: daysAgo(100),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead7.id, channel: "KAKAO", content: "카톡으로 영어 수업 문의. 내신 대비 원함.", interestSignals: JSON.stringify(["QUICK_RESPONSE", "PRICE_ASKED"]), createdBy: manager.id, createdAt: daysAgo(120) },
  });
  await prisma.consultation.create({
    data: { leadId: lead7.id, channel: "VISIT", content: "방문 상담 후 바로 등록 결정.", interestSignals: JSON.stringify(["VISITED", "ENROLLMENT_TIMING"]), createdBy: manager.id, createdAt: daysAgo(110) },
  });
  await prisma.statusLog.create({ data: { leadId: lead7.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: manager.id, createdAt: daysAgo(118) } });
  await prisma.statusLog.create({ data: { leadId: lead7.id, fromStatus: "INITIAL_CONSULT", toStatus: "IN_PROGRESS", changedBy: manager.id, createdAt: daysAgo(112) } });
  await prisma.statusLog.create({ data: { leadId: lead7.id, fromStatus: "IN_PROGRESS", toStatus: "REGISTERED", changedBy: manager.id, createdAt: daysAgo(100) } });
  await prisma.followUpTask.create({
    data: { leadId: lead7.id, assignedTo: manager.id, taskType: "CALL", description: "등록 환영 전화", dueDate: daysAgo(99), priority: "NORMAL", status: "COMPLETED", completedAt: daysAgo(99) },
  });

  // 8. 윤서준 - REGISTERED (80일 전, 방문 경로)
  const lead8 = await prisma.lead.create({
    data: {
      studentName: "윤서준", grade: "초5", subject: "수학",
      parentName: "윤아버지", parentPhone: "010-8901-2345", parentRelation: "아버지",
      inquirySource: "VISIT", status: "REGISTERED", interestScore: 9,
      assignedTo: staff.id, createdAt: daysAgo(80), updatedAt: daysAgo(60),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead8.id, channel: "VISIT", content: "직접 방문. 수학 선행 원함.", interestSignals: JSON.stringify(["VISITED", "SCHEDULE_CHECKED"]), createdBy: staff.id, createdAt: daysAgo(80) },
  });
  await prisma.statusLog.create({ data: { leadId: lead8.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: staff.id, createdAt: daysAgo(78) } });
  await prisma.statusLog.create({ data: { leadId: lead8.id, fromStatus: "INITIAL_CONSULT", toStatus: "TRIAL_BOOKED", changedBy: staff.id, createdAt: daysAgo(72) } });
  await prisma.statusLog.create({ data: { leadId: lead8.id, fromStatus: "TRIAL_BOOKED", toStatus: "TRIAL_DONE", changedBy: staff.id, createdAt: daysAgo(65) } });
  await prisma.statusLog.create({ data: { leadId: lead8.id, fromStatus: "TRIAL_DONE", toStatus: "REGISTERED", changedBy: staff.id, createdAt: daysAgo(60) } });

  // 9. 강지우 - DROPPED (70일 전, 가격)
  const lead9 = await prisma.lead.create({
    data: {
      studentName: "강지우", grade: "중2", subject: "수학",
      parentName: "강어머니", parentPhone: "010-9012-3456",
      inquirySource: "REFERRAL", status: "DROPPED", interestScore: 4,
      assignedTo: owner.id, createdAt: daysAgo(70), updatedAt: daysAgo(55),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead9.id, channel: "PHONE", content: "지인 소개로 연락. 수강료 비교 중.", interestSignals: JSON.stringify(["COMPARING", "PRICE_CONCERN"]), createdBy: owner.id, createdAt: daysAgo(70) },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead9.id, reasons: JSON.stringify(["PRICE", "COMPETITOR"]), detailMemo: "근처 학원이 더 저렴해서 결정", canRetry: true, createdBy: owner.id },
  });
  await prisma.statusLog.create({ data: { leadId: lead9.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: owner.id, createdAt: daysAgo(68) } });
  await prisma.statusLog.create({ data: { leadId: lead9.id, fromStatus: "INITIAL_CONSULT", toStatus: "DROPPED", changedBy: owner.id, reason: "수강료 부담", createdAt: daysAgo(55) } });

  // 10. 송예린 - REGISTERED (50일 전, 소개)
  const lead10 = await prisma.lead.create({
    data: {
      studentName: "송예린", grade: "고1", subject: "영어",
      parentName: "송어머니", parentPhone: "010-0123-4567", parentRelation: "어머니",
      inquirySource: "REFERRAL", status: "REGISTERED", interestScore: 10,
      assignedTo: manager.id, createdAt: daysAgo(50), updatedAt: daysAgo(35),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead10.id, channel: "PHONE", content: "정다인 학생 어머니 소개로 연락.", interestSignals: JSON.stringify(["QUICK_RESPONSE", "ENROLLMENT_TIMING"]), createdBy: manager.id, createdAt: daysAgo(50) },
  });
  await prisma.statusLog.create({ data: { leadId: lead10.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: manager.id, createdAt: daysAgo(48) } });
  await prisma.statusLog.create({ data: { leadId: lead10.id, fromStatus: "INITIAL_CONSULT", toStatus: "IN_PROGRESS", changedBy: manager.id, createdAt: daysAgo(42) } });
  await prisma.statusLog.create({ data: { leadId: lead10.id, fromStatus: "IN_PROGRESS", toStatus: "REGISTERED", changedBy: manager.id, createdAt: daysAgo(35) } });

  // 11. 한민재 - DROPPED (40일 전, 무응답)
  const lead11 = await prisma.lead.create({
    data: {
      studentName: "한민재", grade: "중3", subject: "영어",
      parentName: "한아버지", parentPhone: "010-1111-2222",
      inquirySource: "ONLINE", status: "DROPPED", interestScore: 2,
      assignedTo: staff.id, createdAt: daysAgo(40), updatedAt: daysAgo(25),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead11.id, channel: "KAKAO", content: "온라인 문의. 카톡 답변 후 무응답.", interestSignals: JSON.stringify(["SLOW_RESPONSE"]), createdBy: staff.id, createdAt: daysAgo(40) },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead11.id, reasons: JSON.stringify(["NO_RESPONSE", "DELAYED_FOLLOWUP"]), canRetry: true, createdBy: staff.id },
  });
  await prisma.statusLog.create({ data: { leadId: lead11.id, fromStatus: "NEW_INQUIRY", toStatus: "DROPPED", changedBy: staff.id, reason: "연락두절", createdAt: daysAgo(25) } });

  // 12. 오수빈 - IN_PROGRESS (15일 전, 온라인)
  const lead12 = await prisma.lead.create({
    data: {
      studentName: "오수빈", grade: "초4", subject: "영어",
      parentName: "오어머니", parentPhone: "010-2222-3333", parentRelation: "어머니",
      inquirySource: "ONLINE", status: "IN_PROGRESS", interestScore: 5,
      assignedTo: staff.id, createdAt: daysAgo(15), updatedAt: daysAgo(5),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead12.id, channel: "PHONE", content: "전화 상담. 영어 파닉스 관심.", interestSignals: JSON.stringify(["ADDITIONAL_QUESTION", "SCHEDULE_CHECKED"]), createdBy: staff.id, createdAt: daysAgo(12) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead12.id, assignedTo: staff.id, taskType: "SEND_INFO", description: "파닉스 커리큘럼 자료 발송", dueDate: daysAgo(-1), priority: "NORMAL", status: "PENDING" },
  });

  // 13. 임채원 - REGISTERED (150일 전, 전단지)
  const lead13 = await prisma.lead.create({
    data: {
      studentName: "임채원", grade: "중1", subject: "수학",
      parentName: "임어머니", parentPhone: "010-3333-4444",
      inquirySource: "FLYER", status: "REGISTERED", interestScore: 8,
      assignedTo: owner.id, createdAt: daysAgo(150), updatedAt: daysAgo(130),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead13.id, channel: "PHONE", content: "전단지 보고 연락. 수학 보습 원함.", interestSignals: JSON.stringify(["PRICE_ASKED"]), createdBy: owner.id, createdAt: daysAgo(150) },
  });
  await prisma.statusLog.create({ data: { leadId: lead13.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: owner.id, createdAt: daysAgo(148) } });
  await prisma.statusLog.create({ data: { leadId: lead13.id, fromStatus: "INITIAL_CONSULT", toStatus: "TRIAL_BOOKED", changedBy: owner.id, createdAt: daysAgo(140) } });
  await prisma.statusLog.create({ data: { leadId: lead13.id, fromStatus: "TRIAL_BOOKED", toStatus: "TRIAL_DONE", changedBy: owner.id, createdAt: daysAgo(135) } });
  await prisma.statusLog.create({ data: { leadId: lead13.id, fromStatus: "TRIAL_DONE", toStatus: "REGISTERED", changedBy: owner.id, createdAt: daysAgo(130) } });

  // 14. 서하영 - DROPPED (100일 전, 아이 거부)
  const lead14 = await prisma.lead.create({
    data: {
      studentName: "서하영", grade: "초5", subject: "영어",
      parentName: "서어머니", parentPhone: "010-4444-5555",
      inquirySource: "KAKAO", status: "DROPPED", interestScore: 5,
      assignedTo: manager.id, createdAt: daysAgo(100), updatedAt: daysAgo(85),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead14.id, channel: "VISIT", content: "방문 체험 후 아이가 거부감 표시.", interestSignals: JSON.stringify(["VISITED"]), createdBy: manager.id, createdAt: daysAgo(90) },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead14.id, reasons: JSON.stringify(["CHILD_REJECT"]), detailMemo: "체험수업 후 아이가 수업 방식에 거부감", canRetry: false, createdBy: manager.id },
  });
  await prisma.statusLog.create({ data: { leadId: lead14.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: manager.id, createdAt: daysAgo(98) } });
  await prisma.statusLog.create({ data: { leadId: lead14.id, fromStatus: "INITIAL_CONSULT", toStatus: "TRIAL_BOOKED", changedBy: manager.id, createdAt: daysAgo(92) } });
  await prisma.statusLog.create({ data: { leadId: lead14.id, fromStatus: "TRIAL_BOOKED", toStatus: "TRIAL_DONE", changedBy: manager.id, createdAt: daysAgo(88) } });
  await prisma.statusLog.create({ data: { leadId: lead14.id, fromStatus: "TRIAL_DONE", toStatus: "DROPPED", changedBy: manager.id, reason: "아이 거부", createdAt: daysAgo(85) } });

  // 15. 배준호 - ON_HOLD (20일 전)
  const lead15 = await prisma.lead.create({
    data: {
      studentName: "배준호", grade: "고2", subject: "수학",
      parentName: "배아버지", parentPhone: "010-5555-6666", parentRelation: "아버지",
      inquirySource: "PHONE", status: "ON_HOLD", interestScore: 5,
      assignedTo: staff.id, createdAt: daysAgo(20), updatedAt: daysAgo(8),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead15.id, channel: "PHONE", content: "시험 기간이라 다음 달에 시작 희망.", interestSignals: JSON.stringify(["PRICE_ASKED", "SCHEDULE_CHECKED"]), createdBy: staff.id, createdAt: daysAgo(20) },
  });
  await prisma.statusLog.create({ data: { leadId: lead15.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: staff.id, createdAt: daysAgo(18) } });
  await prisma.statusLog.create({ data: { leadId: lead15.id, fromStatus: "INITIAL_CONSULT", toStatus: "ON_HOLD", changedBy: staff.id, reason: "시험 기간, 다음달 재연락", createdAt: daysAgo(8) } });
  await prisma.followUpTask.create({
    data: { leadId: lead15.id, assignedTo: staff.id, taskType: "CALL", description: "시험 끝나면 재연락", dueDate: daysAgo(-10), priority: "NORMAL", status: "PENDING" },
  });

  // 16. 조은서 - NEW_INQUIRY (1일 전)
  const lead16 = await prisma.lead.create({
    data: {
      studentName: "조은서", grade: "초3", subject: "영어",
      parentName: "조어머니", parentPhone: "010-6666-7777",
      inquirySource: "REFERRAL", status: "NEW_INQUIRY", interestScore: 2,
      assignedTo: manager.id, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead16.id, channel: "KAKAO", content: "지인 소개로 카톡 문의. 영어 첫 시작.", interestSignals: JSON.stringify(["ADDITIONAL_QUESTION"]), createdBy: manager.id, createdAt: daysAgo(1) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead16.id, assignedTo: manager.id, taskType: "CALL", description: "전화 상담 진행", dueDate: new Date(), priority: "HIGH", status: "PENDING" },
  });

  // 17. 신재민 - INITIAL_CONSULT (5일 전)
  const lead17 = await prisma.lead.create({
    data: {
      studentName: "신재민", grade: "중2", subject: "영어",
      parentName: "신어머니", parentPhone: "010-7777-8888", parentRelation: "어머니",
      inquirySource: "VISIT", status: "INITIAL_CONSULT", interestScore: 4,
      assignedTo: owner.id, createdAt: daysAgo(5), updatedAt: daysAgo(3),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead17.id, channel: "VISIT", content: "직접 방문. 영어 회화 관심.", interestSignals: JSON.stringify(["VISITED", "ADDITIONAL_QUESTION"]), createdBy: owner.id, createdAt: daysAgo(5) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead17.id, assignedTo: owner.id, taskType: "KAKAO", description: "커리큘럼 자료 카톡 발송", dueDate: daysAgo(0), priority: "NORMAL", status: "PENDING" },
  });

  // 18. 유하린 - TRIAL_BOOKED (8일 전)
  const lead18 = await prisma.lead.create({
    data: {
      studentName: "유하린", grade: "초6", subject: "수학",
      parentName: "유아버지", parentPhone: "010-8888-9999", parentRelation: "아버지",
      inquirySource: "FLYER", status: "TRIAL_BOOKED", interestScore: 7,
      assignedTo: staff.id, createdAt: daysAgo(8), updatedAt: daysAgo(3),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead18.id, channel: "PHONE", content: "전단지 보고 연락. 수학 선행 원함.", interestSignals: JSON.stringify(["PRICE_ASKED", "TRIAL_REQUESTED"]), createdBy: staff.id, createdAt: daysAgo(8) },
  });
  await prisma.statusLog.create({ data: { leadId: lead18.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: staff.id, createdAt: daysAgo(7) } });
  await prisma.statusLog.create({ data: { leadId: lead18.id, fromStatus: "INITIAL_CONSULT", toStatus: "TRIAL_BOOKED", changedBy: staff.id, createdAt: daysAgo(3) } });

  // 19. 권민서 - DROPPED (35일 전, 거리)
  const lead19 = await prisma.lead.create({
    data: {
      studentName: "권민서", grade: "중1", subject: "수학",
      parentName: "권어머니", parentPhone: "010-9999-0000",
      inquirySource: "ONLINE", status: "DROPPED", interestScore: 3,
      assignedTo: owner.id, createdAt: daysAgo(35), updatedAt: daysAgo(28),
    },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead19.id, reasons: JSON.stringify(["DISTANCE", "TIME"]), detailMemo: "통학 거리가 너무 멀어서 포기", canRetry: false, createdBy: owner.id },
  });
  await prisma.statusLog.create({ data: { leadId: lead19.id, fromStatus: "NEW_INQUIRY", toStatus: "DROPPED", changedBy: owner.id, reason: "거리 문제", createdAt: daysAgo(28) } });

  // 20. 문서영 - REGISTERED (25일 전, 온라인)
  const lead20 = await prisma.lead.create({
    data: {
      studentName: "문서영", grade: "고1", subject: "수학",
      parentName: "문어머니", parentPhone: "010-1010-2020", parentRelation: "어머니",
      inquirySource: "ONLINE", status: "REGISTERED", interestScore: 9,
      assignedTo: staff.id, createdAt: daysAgo(25), updatedAt: daysAgo(10),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead20.id, channel: "KAKAO", content: "온라인 문의 후 카톡 상담.", interestSignals: JSON.stringify(["QUICK_RESPONSE", "PRICE_ASKED", "ENROLLMENT_TIMING"]), createdBy: staff.id, createdAt: daysAgo(25) },
  });
  await prisma.consultation.create({
    data: { leadId: lead20.id, channel: "VISIT", content: "방문 후 즉시 등록.", interestSignals: JSON.stringify(["VISITED", "TRIAL_REQUESTED"]), createdBy: staff.id, createdAt: daysAgo(15) },
  });
  await prisma.statusLog.create({ data: { leadId: lead20.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: staff.id, createdAt: daysAgo(23) } });
  await prisma.statusLog.create({ data: { leadId: lead20.id, fromStatus: "INITIAL_CONSULT", toStatus: "TRIAL_BOOKED", changedBy: staff.id, createdAt: daysAgo(18) } });
  await prisma.statusLog.create({ data: { leadId: lead20.id, fromStatus: "TRIAL_BOOKED", toStatus: "TRIAL_DONE", changedBy: staff.id, createdAt: daysAgo(13) } });
  await prisma.statusLog.create({ data: { leadId: lead20.id, fromStatus: "TRIAL_DONE", toStatus: "REGISTERED", changedBy: staff.id, createdAt: daysAgo(10) } });

  // 21. 양지훈 - DROPPED (60일 전, 부모 의견 불일치)
  const lead21 = await prisma.lead.create({
    data: {
      studentName: "양지훈", grade: "초6", subject: "영어",
      parentName: "양아버지", parentPhone: "010-2020-3030",
      inquirySource: "KAKAO", status: "DROPPED", interestScore: 4,
      assignedTo: manager.id, createdAt: daysAgo(60), updatedAt: daysAgo(48),
    },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead21.id, reasons: JSON.stringify(["PARENT_DISAGREE", "PRICE"]), detailMemo: "어머니는 원하지만 아버지가 반대", canRetry: true, createdBy: manager.id },
  });

  // 22. 노하은 - IN_PROGRESS (12일 전)
  const lead22 = await prisma.lead.create({
    data: {
      studentName: "노하은", grade: "중3", subject: "수학",
      parentName: "노어머니", parentPhone: "010-3030-4040", parentRelation: "어머니",
      inquirySource: "REFERRAL", status: "IN_PROGRESS", interestScore: 7,
      assignedTo: manager.id, createdAt: daysAgo(12), updatedAt: daysAgo(2),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead22.id, channel: "PHONE", content: "소개로 연락. 수학 내신 올리고 싶어함.", interestSignals: JSON.stringify(["QUICK_RESPONSE", "PRICE_ASKED", "SCHEDULE_CHECKED"]), createdBy: manager.id, createdAt: daysAgo(12) },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead22.id, assignedTo: manager.id, taskType: "VISIT_REMIND", description: "이번 주 방문 상담 예약 확인", dueDate: daysAgo(0), priority: "HIGH", status: "PENDING" },
  });

  // 23. 황시우 - DROPPED (20일 전, 타이밍)
  const lead23 = await prisma.lead.create({
    data: {
      studentName: "황시우", grade: "고2", subject: "영어",
      parentName: "황어머니", parentPhone: "010-4040-5050",
      inquirySource: "PHONE", status: "DROPPED", interestScore: 3,
      assignedTo: staff.id, createdAt: daysAgo(20), updatedAt: daysAgo(14),
    },
  });
  await prisma.dropOffReason.create({
    data: { leadId: lead23.id, reasons: JSON.stringify(["TIMING", "COMPETITOR"]), detailMemo: "학기 중 학원 변경 부담, 다음 학기 재검토", canRetry: true, createdBy: staff.id },
  });

  // 24. 전소율 - NEW_INQUIRY (오늘)
  const lead24 = await prisma.lead.create({
    data: {
      studentName: "전소율", grade: "초4", subject: "수학",
      parentName: "전어머니", parentPhone: "010-5050-6060", parentRelation: "어머니",
      inquirySource: "VISIT", status: "NEW_INQUIRY", interestScore: 3,
      assignedTo: staff.id, createdAt: new Date(), updatedAt: new Date(),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead24.id, channel: "VISIT", content: "학원 앞 지나가다 방문 문의. 수학 기초 보충 원함.", interestSignals: JSON.stringify(["VISITED"]), createdBy: staff.id },
  });
  await prisma.followUpTask.create({
    data: { leadId: lead24.id, assignedTo: staff.id, taskType: "CALL", description: "레벨테스트 일정 전화 안내", dueDate: daysAgo(-1), priority: "NORMAL", status: "PENDING" },
  });

  // 25. 구연우 - TRIAL_DONE (7일 전)
  const lead25 = await prisma.lead.create({
    data: {
      studentName: "구연우", grade: "중1", subject: "영어",
      parentName: "구어머니", parentPhone: "010-6060-7070", parentRelation: "어머니",
      inquirySource: "KAKAO", status: "TRIAL_DONE", interestScore: 8,
      assignedTo: owner.id, createdAt: daysAgo(18), updatedAt: daysAgo(2),
    },
  });
  await prisma.consultation.create({
    data: { leadId: lead25.id, channel: "KAKAO", content: "카톡 문의. 영어 리딩 프로그램 관심.", interestSignals: JSON.stringify(["QUICK_RESPONSE", "ADDITIONAL_QUESTION"]), createdBy: owner.id, createdAt: daysAgo(18) },
  });
  await prisma.consultation.create({
    data: { leadId: lead25.id, channel: "VISIT", content: "방문 체험 완료. 아이 반응 좋음.", interestSignals: JSON.stringify(["VISITED", "TRIAL_REQUESTED", "ENROLLMENT_TIMING"]), createdBy: owner.id, createdAt: daysAgo(7) },
  });
  await prisma.statusLog.create({ data: { leadId: lead25.id, fromStatus: "NEW_INQUIRY", toStatus: "INITIAL_CONSULT", changedBy: owner.id, createdAt: daysAgo(16) } });
  await prisma.statusLog.create({ data: { leadId: lead25.id, fromStatus: "INITIAL_CONSULT", toStatus: "TRIAL_BOOKED", changedBy: owner.id, createdAt: daysAgo(10) } });
  await prisma.statusLog.create({ data: { leadId: lead25.id, fromStatus: "TRIAL_BOOKED", toStatus: "TRIAL_DONE", changedBy: owner.id, createdAt: daysAgo(2) } });
  await prisma.followUpTask.create({
    data: { leadId: lead25.id, assignedTo: owner.id, taskType: "CALL", description: "등록 의사 확인 전화", dueDate: new Date(), priority: "URGENT", status: "PENDING" },
  });

  console.log("Seed data created: 3 users, 25 leads with consultations, tasks, and status logs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

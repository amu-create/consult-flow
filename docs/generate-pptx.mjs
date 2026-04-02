import pptxgen from "pptxgenjs";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "ConsultFlow";
pres.title = "ConsultFlow - 학원 상담 전환 OS 사업계획서";

// Colors
const BLUE = "2563EB";
const DARK = "1E293B";
const GRAY = "64748B";
const LIGHT = "F8FAFC";
const WHITE = "FFFFFF";
const GREEN = "22C55E";
const NAVY = "0F172A";
const BLUE_LIGHT = "DBEAFE";
const GREEN_LIGHT = "DCFCE7";

// Helpers
const mkShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

function addPageNum(slide, num) {
  slide.addText(`${num}`, { x: 9.2, y: 5.2, w: 0.5, h: 0.3, fontSize: 9, color: GRAY, align: "right" });
}

function sectionHeader(slide, title, subtitle, num) {
  slide.addText(title, { x: 0.7, y: 0.4, w: 8, h: 0.5, fontSize: 22, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.7, y: 0.9, w: 8, h: 0.35, fontSize: 12, fontFace: "Arial", color: GRAY, margin: 0 });
  }
  // Blue accent bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.25, w: 1.2, h: 0.04, fill: { color: BLUE } });
  addPageNum(slide, num);
}

// ========== SLIDE 1: Cover ==========
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  // Accent shape
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: BLUE } });
  // Logo block
  s.addShape(pres.shapes.RECTANGLE, { x: 1.2, y: 1.5, w: 0.7, h: 0.7, fill: { color: BLUE } });
  s.addText("CF", { x: 1.2, y: 1.5, w: 0.7, h: 0.7, fontSize: 20, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
  // Title
  s.addText("ConsultFlow", { x: 2.1, y: 1.5, w: 6, h: 0.7, fontSize: 36, fontFace: "Arial", bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText("학원 상담 전환 OS", { x: 1.2, y: 2.4, w: 7, h: 0.5, fontSize: 20, fontFace: "Arial", color: BLUE_LIGHT, margin: 0 });
  // Tagline
  s.addText('"상담은 했는데 등록은 안 되는 학원을 위한 솔루션"', { x: 1.2, y: 3.3, w: 7, h: 0.5, fontSize: 14, fontFace: "Arial", italic: true, color: GRAY, margin: 0 });
  // Presenter
  s.addText("발표자: _______________", { x: 1.2, y: 4.5, w: 5, h: 0.4, fontSize: 12, fontFace: "Arial", color: GRAY, margin: 0 });
  s.addText("청년창업지원금 심사용 사업계획서", { x: 1.2, y: 4.9, w: 5, h: 0.3, fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0 });
}

// ========== SLIDE 2: Problem Definition ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "문제 정의", "학원 업계의 구조적 전환율 문제", 2);

  // Big stat cards
  const cards = [
    { label: "학원 수", value: "~10만개", sub: "통계청 2023" },
    { label: "평균 전환율", value: "25~35%", sub: "문의 → 등록" },
    { label: "미전환 손실", value: "3,000억원", sub: "연간 시장 전체" },
  ];
  cards.forEach((c, i) => {
    const cx = 0.7 + i * 3;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.6, w: 2.7, h: 1.6, fill: { color: LIGHT }, shadow: mkShadow() });
    s.addText(c.value, { x: cx, y: 1.7, w: 2.7, h: 0.7, fontSize: 28, fontFace: "Arial", bold: true, color: BLUE, align: "center", valign: "middle" });
    s.addText(c.label, { x: cx, y: 2.3, w: 2.7, h: 0.4, fontSize: 12, fontFace: "Arial", color: DARK, align: "center" });
    s.addText(c.sub, { x: cx, y: 2.7, w: 2.7, h: 0.3, fontSize: 9, fontFace: "Arial", color: GRAY, align: "center" });
  });

  // Causes
  s.addText("주요 원인", { x: 0.7, y: 3.5, w: 3, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
  const causes = ["상담 이력 누락 — 누가 언제 뭘 말했는지 기록 없음", "후속 연락 지연 — 타이밍을 놓쳐 학부모 이탈", "관심도 파악 불가 — 등록 가능성 높은 리드 식별 불가"];
  s.addText(causes.map((c, i) => ({ text: c, options: { bullet: true, breakLine: i < causes.length - 1, fontSize: 11, color: DARK } })),
    { x: 0.7, y: 3.9, w: 8.5, h: 1.5, fontFace: "Arial", paraSpaceAfter: 6 });
}

// ========== SLIDE 3: Existing Solutions ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "기존 솔루션의 한계", "현재 시장에 학원 상담 전환 특화 도구가 없음", 3);

  const rows = [
    [
      { text: "솔루션", options: { bold: true, color: WHITE, fill: { color: BLUE }, fontSize: 11, fontFace: "Arial" } },
      { text: "한계", options: { bold: true, color: WHITE, fill: { color: BLUE }, fontSize: 11, fontFace: "Arial" } },
    ],
    [{ text: "엑셀 / 수기 관리", options: { fontSize: 11, fontFace: "Arial" } }, { text: "상담 이력 누락, 팔로업 망각, 데이터 분석 불가", options: { fontSize: 11, fontFace: "Arial" } }],
    [{ text: "네이버 예약", options: { fontSize: 11, fontFace: "Arial" } }, { text: "예약만 가능, 상담 프로세스 관리 없음", options: { fontSize: 11, fontFace: "Arial" } }],
    [{ text: "학원관리 앱 (클래스팅 등)", options: { fontSize: 11, fontFace: "Arial" } }, { text: "재원생 관리 중심, 신규 문의 전환에 약함", options: { fontSize: 11, fontFace: "Arial" } }],
    [{ text: "일반 CRM (허브스팟 등)", options: { fontSize: 11, fontFace: "Arial" } }, { text: "학원 특화 아님, 고가, 영어 인터페이스", options: { fontSize: 11, fontFace: "Arial" } }],
  ];
  s.addTable(rows, {
    x: 0.7, y: 1.6, w: 8.6, colW: [3, 5.6],
    border: { pt: 0.5, color: "E2E8F0" },
    rowH: [0.45, 0.55, 0.55, 0.55, 0.55],
    autoPage: false,
  });

  // Bottom insight
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.3, w: 8.6, h: 0.7, fill: { color: BLUE_LIGHT } });
  s.addText("→ 학원 상담 전환에 특화된 SaaS 도구가 시장에 부재", { x: 1, y: 4.3, w: 8, h: 0.7, fontSize: 13, fontFace: "Arial", bold: true, color: BLUE, valign: "middle", margin: 0 });
}

// ========== SLIDE 4: Solution ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "솔루션 소개", "ConsultFlow = 학원 상담 전환 특화 OS", 4);

  const features = [
    { title: "상담 퍼널 관리", desc: "문의 → 초기상담 → 체험 → 등록\n8단계 상태머신으로 전환 과정 완벽 추적", color: BLUE },
    { title: "AI 관심도 자동 측정", desc: "상담 기록의 10가지 신호를 분석하여\n등록 가능성 스코어 자동 산출", color: GREEN },
    { title: "후속 액션 강제", desc: "상담 기록 시 팔로업 태스크 필수 생성\n방치 리드 원천 차단", color: "F59E0B" },
  ];

  features.forEach((f, i) => {
    const cy = 1.6 + i * 1.2;
    // Color accent
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 0.08, h: 0.95, fill: { color: f.color } });
    // Card bg
    s.addShape(pres.shapes.RECTANGLE, { x: 0.78, y: cy, w: 8.52, h: 0.95, fill: { color: LIGHT } });
    // Number
    s.addShape(pres.shapes.OVAL, { x: 1.1, y: cy + 0.2, w: 0.5, h: 0.5, fill: { color: f.color } });
    s.addText(`${i + 1}`, { x: 1.1, y: cy + 0.2, w: 0.5, h: 0.5, fontSize: 16, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    // Text
    s.addText(f.title, { x: 1.9, y: cy + 0.05, w: 6, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
    s.addText(f.desc, { x: 1.9, y: cy + 0.4, w: 6, h: 0.5, fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0 });
  });

  // Bottom highlight
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.6, w: 8.6, h: 0.6, fill: { color: GREEN_LIGHT } });
  s.addText("핵심 가치: 상담 한 건도 놓치지 않는 전환 시스템", { x: 1, y: 4.6, w: 8, h: 0.6, fontSize: 12, fontFace: "Arial", bold: true, color: "15803D", valign: "middle", margin: 0 });
}

// ========== SLIDE 5: Demo - Dashboard ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "제품 데모 — 대시보드", "핵심 KPI를 한눈에 파악", 5);

  // Screenshot placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 3.3, fill: { color: "F1F5F9" }, line: { color: "CBD5E1", width: 1, dashType: "dash" } });
  s.addText("[ 대시보드 스크린샷 — 라이브 데모 시 실제 화면 시연 ]", { x: 0.7, y: 2.7, w: 8.6, h: 0.5, fontSize: 14, fontFace: "Arial", color: GRAY, align: "center" });

  // Feature highlights at bottom
  const kpis = ["전체 리드 현황", "전환율 / 방치 리드", "상태 분포 도넛 차트", "핵심 지표 카드"];
  kpis.forEach((k, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7 + i * 2.2, y: 4.9, w: 2, h: 0.4, fill: { color: BLUE_LIGHT } });
    s.addText(k, { x: 0.7 + i * 2.2, y: 4.9, w: 2, h: 0.4, fontSize: 9, fontFace: "Arial", color: BLUE, align: "center", valign: "middle" });
  });
}

// ========== SLIDE 6: Demo - Pipeline ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "제품 데모 — 파이프라인", "칸반 보드로 상태 관리", 6);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 3.3, fill: { color: "F1F5F9" }, line: { color: "CBD5E1", width: 1, dashType: "dash" } });
  s.addText("[ 칸반 보드 스크린샷 — 드래그앤드롭으로 상태 변경 ]", { x: 0.7, y: 2.7, w: 8.6, h: 0.5, fontSize: 14, fontFace: "Arial", color: GRAY, align: "center" });

  const points = ["드래그앤드롭 상태 변경", "유효 전이만 허용", "한눈에 보는 파이프라인"];
  points.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7 + i * 3, y: 4.9, w: 2.7, h: 0.4, fill: { color: BLUE_LIGHT } });
    s.addText(p, { x: 0.7 + i * 3, y: 4.9, w: 2.7, h: 0.4, fontSize: 9, fontFace: "Arial", color: BLUE, align: "center", valign: "middle" });
  });
}

// ========== SLIDE 7: Demo - Analytics ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "제품 데모 — 분석", "데이터 기반 의사결정 지원", 7);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 3.3, fill: { color: "F1F5F9" }, line: { color: "CBD5E1", width: 1, dashType: "dash" } });
  s.addText("[ 분석 대시보드 스크린샷 — 6종 차트 + KPI 카드 ]", { x: 0.7, y: 2.7, w: 8.6, h: 0.5, fontSize: 14, fontFace: "Arial", color: GRAY, align: "center" });

  const charts = ["전환 퍼널", "월별 트렌드", "문의 경로 분석", "이탈 사유 분석"];
  charts.forEach((c, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7 + i * 2.2, y: 4.9, w: 2, h: 0.4, fill: { color: GREEN_LIGHT } });
    s.addText(c, { x: 0.7 + i * 2.2, y: 4.9, w: 2, h: 0.4, fontSize: 9, fontFace: "Arial", color: "15803D", align: "center", valign: "middle" });
  });
}

// ========== SLIDE 8: Technical Differentiation ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "기술 차별점", "학원 전환에 특화된 4가지 핵심 기술", 8);

  const techs = [
    { title: "상태 머신 기반 전환 프로세스", desc: "잘못된 상태 전이 자동 차단\n8단계 상태 + 유효 전이 규칙으로 데이터 무결성 보장" },
    { title: "관심도 자동 스코어링", desc: "상담 기록에서 10종 신호를 가중치 합산\n등록 가능성 높은 리드를 자동 식별" },
    { title: "팔로업 강제 생성", desc: "상담 기록 시 다음 액션 필수 입력\n방치 리드를 원천 차단하는 구조적 장치" },
    { title: "이탈 사유 데이터 축적", desc: "복수 선택 + 재시도 플래그로\n이탈 패턴 분석 → 개선 인사이트 도출" },
  ];
  techs.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.7 + col * 4.5;
    const cy = 1.6 + row * 1.7;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.1, h: 1.4, fill: { color: LIGHT }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 0.07, h: 1.4, fill: { color: BLUE } });
    s.addText(t.title, { x: cx + 0.3, y: cy + 0.1, w: 3.6, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
    s.addText(t.desc, { x: cx + 0.3, y: cy + 0.5, w: 3.6, h: 0.7, fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0 });
  });
}

// ========== SLIDE 9: Market Size ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "시장 규모", "TAM → SAM → SOM", 9);

  // Three concentric-like cards
  const markets = [
    { label: "TAM", value: "3,600억원", desc: "한국 학원 10만개 × 월 3만원", w: 8.6, color: BLUE_LIGHT, textColor: BLUE },
    { label: "SAM", value: "2,160억원", desc: "중소규모 학원 6만개 × 월 3만원", w: 6.5, color: "E0E7FF", textColor: "4338CA" },
    { label: "SOM", value: "1.8억원", desc: "초기 3년 목표 500개 학원", w: 4.5, color: GREEN_LIGHT, textColor: "15803D" },
  ];
  markets.forEach((m, i) => {
    const cy = 1.6 + i * 1.2;
    const cx = (10 - m.w) / 2;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: m.w, h: 1, fill: { color: m.color } });
    s.addText(m.label, { x: cx + 0.3, y: cy + 0.05, w: 1.2, h: 0.9, fontSize: 18, fontFace: "Arial", bold: true, color: m.textColor, valign: "middle", margin: 0 });
    s.addText(m.value, { x: cx + 1.5, y: cy + 0.05, w: 2.5, h: 0.5, fontSize: 22, fontFace: "Arial", bold: true, color: DARK, valign: "middle", margin: 0 });
    s.addText(m.desc, { x: cx + 1.5, y: cy + 0.5, w: m.w - 2, h: 0.4, fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0 });
  });
}

// ========== SLIDE 10: Business Model ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "비즈니스 모델", "SaaS 월 구독 — 3단계 요금제", 10);

  const plans = [
    { name: "스타터", price: "무료", features: "리드 30건\n기본 기능", color: GRAY },
    { name: "프로", price: "월 29,000원", features: "무제한 리드\n분석 + CSV 내보내기", color: BLUE },
    { name: "비즈니스", price: "월 59,000원", features: "멀티지점 관리\n카카오/SMS 연동\n우선 지원", color: "7C3AED" },
  ];

  plans.forEach((p, i) => {
    const cx = 0.7 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.6, w: 2.8, h: 3.2, fill: { color: WHITE }, shadow: mkShadow(), line: { color: "E2E8F0", width: 1 } });
    // Color top bar
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.6, w: 2.8, h: 0.08, fill: { color: p.color } });
    s.addText(p.name, { x: cx, y: 1.8, w: 2.8, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: DARK, align: "center" });
    s.addText(p.price, { x: cx, y: 2.2, w: 2.8, h: 0.5, fontSize: 20, fontFace: "Arial", bold: true, color: p.color, align: "center" });
    s.addText(p.features, { x: cx + 0.3, y: 2.8, w: 2.2, h: 1.8, fontSize: 11, fontFace: "Arial", color: GRAY, align: "center" });
  });

  // Highlight best plan
  s.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 1.35, w: 2.8, h: 0.28, fill: { color: BLUE } });
  s.addText("추천", { x: 3.8, y: 1.35, w: 2.8, h: 0.28, fontSize: 10, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
}

// ========== SLIDE 11: Customer Acquisition ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "고객 확보 전략", "3단계 Go-to-Market", 11);

  const phases = [
    { phase: "Phase 1", period: "0~6개월", items: ["직접 영업 (학원 방문/전화)", "학원장 온라인 카페 활동", "무료 체험 (스타터 플랜)"] },
    { phase: "Phase 2", period: "6~12개월", items: ["콘텐츠 마케팅 (학원 운영 블로그)", "기존 고객 입소문 / 추천", "사례 연구 (Case Study) 공개"] },
    { phase: "Phase 3", period: "12~24개월", items: ["학원 컨설팅 업체 파트너십", "프랜차이즈 본사 B2B 영업", "교육 박람회 참가"] },
  ];

  phases.forEach((p, i) => {
    const cx = 0.7 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.6, w: 2.8, h: 3.3, fill: { color: LIGHT }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.6, w: 2.8, h: 0.55, fill: { color: BLUE } });
    s.addText(`${p.phase}`, { x: cx, y: 1.6, w: 2.8, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, align: "center" });
    s.addText(p.period, { x: cx, y: 1.88, w: 2.8, h: 0.25, fontSize: 10, fontFace: "Arial", color: BLUE_LIGHT, align: "center" });

    s.addText(p.items.map((item, j) => ({ text: item, options: { bullet: true, breakLine: j < p.items.length - 1, fontSize: 10, color: DARK } })),
      { x: cx + 0.2, y: 2.35, w: 2.4, h: 2.3, fontFace: "Arial", paraSpaceAfter: 8 });
  });
}

// ========== SLIDE 12: Financial Plan ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "재무 계획 (3년)", "2년차 상반기 BEP 달성 목표", 12);

  const headerOpts = { bold: true, color: WHITE, fill: { color: BLUE }, fontSize: 11, fontFace: "Arial", align: "center" };
  const cellOpts = { fontSize: 11, fontFace: "Arial", align: "center" };
  const rows = [
    [
      { text: "항목", options: headerOpts },
      { text: "1년차", options: headerOpts },
      { text: "2년차", options: headerOpts },
      { text: "3년차", options: headerOpts },
    ],
    [{ text: "유료 학원 수", options: cellOpts }, { text: "50개", options: cellOpts }, { text: "200개", options: cellOpts }, { text: "500개", options: cellOpts }],
    [{ text: "MRR", options: cellOpts }, { text: "145만원", options: cellOpts }, { text: "580만원", options: cellOpts }, { text: "1,450만원", options: cellOpts }],
    [{ text: "ARR", options: cellOpts }, { text: "1,740만원", options: cellOpts }, { text: "6,960만원", options: cellOpts }, { text: "1.74억원", options: { ...cellOpts, bold: true, color: GREEN } }],
    [{ text: "운영비용", options: cellOpts }, { text: "2,400만원", options: cellOpts }, { text: "4,800만원", options: cellOpts }, { text: "8,400만원", options: cellOpts }],
    [{ text: "손익", options: cellOpts }, { text: "-660만원", options: { ...cellOpts, color: "DC2626" } }, { text: "+2,160만원", options: { ...cellOpts, color: GREEN } }, { text: "+9,000만원", options: { ...cellOpts, bold: true, color: GREEN } }],
  ];

  s.addTable(rows, {
    x: 0.7, y: 1.6, w: 8.6, colW: [2.6, 2, 2, 2],
    border: { pt: 0.5, color: "E2E8F0" },
    rowH: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  });

  // Chart - simple bar
  s.addChart(pres.charts.BAR, [
    { name: "ARR", labels: ["1년차", "2년차", "3년차"], values: [1740, 6960, 17400] },
    { name: "비용", labels: ["1년차", "2년차", "3년차"], values: [2400, 4800, 8400] },
  ], {
    x: 0.7, y: 4.0, w: 8.6, h: 1.4,
    barDir: "col",
    chartColors: [BLUE, "94A3B8"],
    showLegend: true, legendPos: "r",
    catAxisLabelColor: GRAY, valAxisLabelColor: GRAY,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: false,
  });
}

// ========== SLIDE 13: Milestones ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "마일스톤", "주요 일정 계획", 13);

  const milestones = [
    { date: "2026 Q2", goal: "MVP 완성 + 베타 테스터 10개 학원 확보" },
    { date: "2026 Q3", goal: "정식 출시 + 카카오/SMS 연동" },
    { date: "2026 Q4", goal: "유료 전환 50개 학원 달성" },
    { date: "2027 Q1", goal: "시리즈A 준비 + 200개 학원" },
    { date: "2027 Q2", goal: "멀티지점 관리 + 프랜차이즈 영업 시작" },
  ];

  milestones.forEach((m, i) => {
    const cy = 1.6 + i * 0.75;
    // Timeline dot
    s.addShape(pres.shapes.OVAL, { x: 1.7, y: cy + 0.15, w: 0.22, h: 0.22, fill: { color: BLUE } });
    // Line connector
    if (i < milestones.length - 1) {
      s.addShape(pres.shapes.LINE, { x: 1.81, y: cy + 0.37, w: 0, h: 0.53, line: { color: BLUE_LIGHT, width: 2 } });
    }
    // Date
    s.addText(m.date, { x: 0.3, y: cy, w: 1.3, h: 0.5, fontSize: 12, fontFace: "Arial", bold: true, color: BLUE, align: "right", valign: "middle", margin: 0 });
    // Goal
    s.addShape(pres.shapes.RECTANGLE, { x: 2.2, y: cy, w: 7, h: 0.5, fill: { color: LIGHT } });
    s.addText(m.goal, { x: 2.4, y: cy, w: 6.6, h: 0.5, fontSize: 12, fontFace: "Arial", color: DARK, valign: "middle", margin: 0 });
  });
}

// ========== SLIDE 14: Team ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "팀 소개", '"학원 업계 pain point를 기술로 해결하는 팀"', 14);

  // Founder card
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.6, w: 4.1, h: 2.5, fill: { color: LIGHT }, shadow: mkShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.6, w: 4.1, h: 0.06, fill: { color: BLUE } });
  s.addShape(pres.shapes.OVAL, { x: 1.3, y: 1.9, w: 0.8, h: 0.8, fill: { color: BLUE } });
  s.addText("대표", { x: 1.3, y: 1.9, w: 0.8, h: 0.8, fontSize: 12, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
  s.addText("대표 / 개발", { x: 2.3, y: 1.95, w: 2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
  s.addText("(본인 정보 입력)", { x: 2.3, y: 2.3, w: 2, h: 0.3, fontSize: 11, fontFace: "Arial", color: GRAY, margin: 0 });
  s.addText([
    { text: "풀스택 개발 (Next.js, React, Prisma, TypeScript)", options: { bullet: true, breakLine: true, fontSize: 10 } },
    { text: "학원 업계 도메인 이해 + 기술 구현", options: { bullet: true, fontSize: 10 } },
  ], { x: 1, y: 2.8, w: 3.5, h: 1, fontFace: "Arial", color: DARK });

  // Hiring plan
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.6, w: 4.1, h: 2.5, fill: { color: LIGHT }, shadow: mkShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.6, w: 4.1, h: 0.06, fill: { color: GREEN } });
  s.addText("채용 예정 (지원금 활용)", { x: 5.4, y: 1.85, w: 3.7, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
  s.addText([
    { text: "UI/UX 디자이너 1명", options: { bullet: true, breakLine: true, fontSize: 11, bold: true } },
    { text: "사용자 경험 최적화, 랜딩페이지", options: { breakLine: true, fontSize: 10, color: GRAY, indentLevel: 1 } },
    { text: "마케터 1명", options: { bullet: true, breakLine: true, fontSize: 11, bold: true } },
    { text: "콘텐츠 마케팅, 학원장 커뮤니티 운영", options: { fontSize: 10, color: GRAY, indentLevel: 1 } },
  ], { x: 5.5, y: 2.35, w: 3.5, h: 1.5, fontFace: "Arial", color: DARK });

  // Tech stack
  s.addText("기술 스택", { x: 0.7, y: 4.4, w: 2, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
  const techs = ["Next.js", "React", "TypeScript", "Prisma", "Tailwind CSS", "SQLite"];
  techs.forEach((t, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7 + i * 1.5, y: 4.8, w: 1.3, h: 0.35, fill: { color: BLUE_LIGHT } });
    s.addText(t, { x: 0.7 + i * 1.5, y: 4.8, w: 1.3, h: 0.35, fontSize: 9, fontFace: "Arial", color: BLUE, align: "center", valign: "middle" });
  });
}

// ========== SLIDE 15: Fund Usage ==========
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  sectionHeader(s, "자금 사용 계획", "총 5,000만원 — 제품 · 인력 · 마케팅 · 운영", 15);

  // Pie chart
  s.addChart(pres.charts.PIE, [{
    name: "자금",
    labels: ["제품 개발", "인건비", "마케팅", "운영비"],
    values: [30, 40, 20, 10],
  }], {
    x: 0.3, y: 1.5, w: 4, h: 3.5,
    showPercent: true,
    showLegend: true,
    legendPos: "b",
    chartColors: [BLUE, GREEN, "F59E0B", "8B5CF6"],
  });

  // Detail cards
  const items = [
    { label: "제품 개발", amount: "1,500만원", pct: "30%", desc: "서버 인프라, API 연동\n(카카오, SMS, 결제)", color: BLUE },
    { label: "인건비", amount: "2,000만원", pct: "40%", desc: "디자이너 1명, 마케터 1명\n(6개월 기준)", color: GREEN },
    { label: "마케팅", amount: "1,000만원", pct: "20%", desc: "초기 고객 확보\n광고, 콘텐츠 제작", color: "F59E0B" },
    { label: "운영비", amount: "500만원", pct: "10%", desc: "사무실, 클라우드 비용\n기타 운영 경비", color: "8B5CF6" },
  ];

  items.forEach((item, i) => {
    const cy = 1.6 + i * 0.9;
    s.addShape(pres.shapes.RECTANGLE, { x: 5, y: cy, w: 4.5, h: 0.75, fill: { color: LIGHT } });
    s.addShape(pres.shapes.RECTANGLE, { x: 5, y: cy, w: 0.07, h: 0.75, fill: { color: item.color } });
    s.addText(item.label, { x: 5.3, y: cy + 0.03, w: 1.5, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: DARK, margin: 0 });
    s.addText(`${item.amount} (${item.pct})`, { x: 6.8, y: cy + 0.03, w: 2.5, h: 0.35, fontSize: 12, fontFace: "Arial", color: item.color, align: "right", margin: 0 });
    s.addText(item.desc, { x: 5.3, y: cy + 0.38, w: 4, h: 0.35, fontSize: 9, fontFace: "Arial", color: GRAY, margin: 0 });
  });

  // Total
  s.addShape(pres.shapes.RECTANGLE, { x: 5, y: 5.05, w: 4.5, h: 0.4, fill: { color: BLUE } });
  s.addText("합계: 5,000만원", { x: 5, y: 5.05, w: 4.5, h: 0.4, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
}

// Generate
const outPath = "D:/Users/Portfolio/consult-flow/docs/ConsultFlow_사업계획서.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("PPTX created:", outPath);
}).catch(err => {
  console.error("Error:", err);
});

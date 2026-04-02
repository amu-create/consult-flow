# ConsultFlow - 학원 상담 전환 OS

> 상담은 했는데 등록은 안 되는 학원을 위한 솔루션

학원 문의부터 등록까지의 전환 과정을 체계적으로 관리하는 SaaS 플랫폼입니다.
상담 누락 방지, AI 관심도 측정, 강제 팔로업으로 전환율을 높입니다.

---

## 핵심 기능

| 기능 | 설명 |
|------|------|
| **8단계 상담 퍼널** | 문의 → 초기상담 → 진행중 → 체험예약 → 체험완료 → 등록 완료. 상태머신으로 잘못된 전이 자동 차단 |
| **AI 관심도 스코어링** | 상담 기록의 10가지 신호를 분석하여 등록 가능성 자동 산출 |
| **팔로업 강제 생성** | 상담 기록 시 다음 액션 필수 입력 — 방치 리드 원천 차단 |
| **칸반 파이프라인** | 드래그앤드롭으로 리드 상태 변경, 전환 현황 한눈에 파악 |
| **전환 분석 대시보드** | 퍼널, 월별 트렌드, 문의 경로, 이탈 사유 등 6종 차트 |
| **이탈 패턴 분석** | 이탈 사유 복수 선택 + 재시도 플래그로 개선 인사이트 도출 |
| **CSV 내보내기** | 리드/상담 이력을 한국어 Excel 호환 CSV로 내보내기 |

---

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: SQLite (LibSQL) + Prisma 7
- **Charts**: Recharts
- **Drag & Drop**: HTML5 native (zero dependency)

---

## 시작하기

```bash
# 의존성 설치
npm install

# DB 마이그레이션 + 시드 데이터
npx prisma migrate dev
npx prisma db seed

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 랜딩 페이지
│   ├── dashboard/            # 대시보드
│   ├── leads/                # 리드 관리
│   │   ├── [id]/             # 리드 상세 (상담기록, 이력)
│   │   └── kanban/           # 칸반 파이프라인
│   ├── tasks/                # 팔로업 태스크
│   ├── analytics/            # 전환 분석 대시보드
│   ├── demo-guide/           # 데모 시나리오 가이드
│   └── api/                  # REST API (18개 엔드포인트)
├── components/
│   ├── charts/               # 6종 차트 컴포넌트
│   ├── ui/                   # shadcn/ui 컴포넌트
│   └── ...                   # 비즈니스 컴포넌트
├── lib/
│   ├── status-machine.ts     # 상태 전이 규칙
│   ├── interest-calculator.ts # 관심도 스코어링
│   └── constants.ts          # 상수 정의
└── prisma/
    ├── schema.prisma          # DB 스키마 (6 모델)
    └── seed.ts                # 25건 시드 데이터
```

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET/POST | `/api/leads` | 리드 목록 (페이지네이션) / 생성 |
| GET/PATCH | `/api/leads/[id]` | 리드 상세 / 수정 |
| POST | `/api/leads/[id]/status` | 상태 변경 (상태머신 검증) |
| GET/POST | `/api/leads/[id]/consultations` | 상담 기록 |
| GET/POST | `/api/leads/[id]/tasks` | 팔로업 태스크 |
| POST | `/api/leads/[id]/drop-off` | 이탈 처리 |
| GET | `/api/analytics/*` | 퍼널/트렌드/경로/이탈/직원/전환시간 |
| GET | `/api/export/*` | CSV 내보내기 (리드/상담) |

---

## 주요 설계 결정

1. **상태머신 패턴** — 리드 상태 전이를 코드로 강제하여 데이터 무결성 보장
2. **팔로업 강제** — 상담 기록 시 다음 액션 필수 → 방치 리드 구조적 차단
3. **관심도 10신호** — 가중치 기반 스코어링으로 전환 가능성 자동 판별
4. **제로 의존성 DnD** — HTML5 native drag-and-drop으로 번들 사이즈 최소화
5. **CSV BOM** — `\uFEFF` 접두어로 한국어 Excel 호환성 확보

---

## 라이선스

MIT

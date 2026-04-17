# ConsultFlow — 학원 상담 전환 OS

상태: 진행중
카테고리: 10_진행중
폴더명: consult-flow
목적: 학원 문의부터 등록까지 8단계 퍼널을 체계적으로 관리하는 SaaS — AI 관심도 스코어링, 강제 팔로업, 칸반 파이프라인, 이탈 패턴 분석으로 전환율 향상
실행 방법: npm run dev
로컬 주소: http://localhost:3000
주요 기술: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 7 (SQLite/LibSQL), Gemini API, Vercel Blob, Recharts, pptxgenjs
다음 할 일: fix: clean up audio transcript timestamps for readability
주의사항: .env 필수 — GEMINI_API_KEY 필수. 배포 시 TURSO_DATABASE_URL + TURSO_AUTH_TOKEN + VERCEL_BLOB_READ_WRITE_TOKEN 필요. 첫 실행 전 npx prisma migrate dev 및 npm run db:seed 실행 필요
검증 방법: npm run build / npm run lint / npm run db:studio
마지막 확인: 2026-04-16

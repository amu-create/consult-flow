"use client";

import { useState } from "react";
import Link from "next/link";

const DAYS = ["월", "화", "수", "목", "금", "토"];

const GRADES = [
  "초1", "초2", "초3", "초4", "초5", "초6",
  "중1", "중2", "중3",
  "고1", "고2", "고3",
];

const SUBJECTS = ["수학", "영어", "국어", "과학", "사회", "기타"];

export default function TrialRequestPage() {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    subject: "",
    parentName: "",
    parentPhone: "",
    preferredDays: [] as string[],
    inquiry: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/public/trial-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">신청이 완료되었습니다!</h2>
          <p className="text-gray-600">빠른 시일 내에 연락드리겠습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back to login */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-600 transition-colors"
          >
            &larr; 로그인 페이지로
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
              CF
            </div>
            <span className="text-lg font-bold text-gray-900">ConsultFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">체험 수업 신청</h1>
          <p className="text-gray-500 mt-1">아래 정보를 입력해 주시면 빠르게 안내해 드리겠습니다.</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학생 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentName"
              required
              value={form.studentName}
              onChange={handleChange}
              placeholder="홍길동"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학년 <span className="text-red-500">*</span>
            </label>
            <select
              name="grade"
              required
              value={form.grade}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white"
            >
              <option value="">학년을 선택해 주세요</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관심 과목 <span className="text-red-500">*</span>
            </label>
            <select
              name="subject"
              required
              value={form.subject}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white"
            >
              <option value="">과목을 선택해 주세요</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Parent Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학부모 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="parentName"
              required
              value={form.parentName}
              onChange={handleChange}
              placeholder="김부모"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="parentPhone"
              required
              value={form.parentPhone}
              onChange={handleChange}
              placeholder="010-1234-5678"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Preferred Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              희망 요일
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    form.preferredDays.includes(day)
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-violet-400"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              문의 사항
            </label>
            <textarea
              name="inquiry"
              value={form.inquiry}
              onChange={handleChange}
              placeholder="궁금한 점이 있으시면 자유롭게 작성해 주세요."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition"
          >
            {submitting ? "신청 중..." : "체험 수업 신청하기"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; ConsultFlow. 입력하신 정보는 상담 목적으로만 사용됩니다.
        </p>
      </div>
    </div>
  );
}

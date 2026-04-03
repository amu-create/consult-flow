"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

const COLORS = ["#7c3aed", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#9ca3af", "#ec4899", "#14b8a6"];

export interface SourceDataItem {
  source: string;
  label: string;
  total: number;
  registered: number;
  conversionRate: number;
}

export function SourceAnalysis({ data }: { data: SourceDataItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        데이터 없음
      </div>
    );
  }

  const pieData = data.map((s) => ({
    name: s.label,
    value: s.total,
  }));

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      {/* Pie: total distribution */}
      <div className="h-[280px]">
        <p className="text-xs text-muted-foreground mb-1 text-center">문의 분포</p>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(props: any) =>
                `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              fontSize={11}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}건`]}
              contentStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar: conversion rate */}
      <div className="h-[280px]">
        <p className="text-xs text-muted-foreground mb-1 text-center">전환율</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10, right: 30 }}
          >
            <XAxis type="number" fontSize={12} domain={[0, 100]} unit="%" />
            <YAxis
              type="category"
              dataKey="label"
              width={60}
              fontSize={11}
            />
            <Tooltip
              formatter={(value) => [`${value}%`]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="conversionRate" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList
                dataKey="conversionRate"
                position="right"
                fontSize={11}
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

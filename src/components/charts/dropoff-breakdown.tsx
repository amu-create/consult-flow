"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const RED_SHADES = [
  "#ef4444", "#dc2626", "#f87171", "#b91c1c", "#fca5a5",
  "#991b1b", "#fecaca", "#7f1d1d",
];

export interface DropoffDataItem {
  reason: string;
  label: string;
  count: number;
}

export function DropoffBreakdown({ data }: { data: DropoffDataItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        데이터 없음
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 30, right: 40 }}
        >
          <XAxis type="number" fontSize={12} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            fontSize={11}
          />
          <Tooltip
            formatter={(value) => [`${value}건`]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" name="건수" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={RED_SHADES[i % RED_SHADES.length]}
              />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fontSize={12}
              formatter={(value) => `${value}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

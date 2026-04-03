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

const STATUS_COLORS: Record<string, string> = {
  NEW_INQUIRY: "#3b82f6",
  CONSULTING: "#7c3aed",
  INITIAL_CONSULT: "#7c3aed",
  IN_PROGRESS: "#f59e0b",
  TRIAL_BOOKED: "#f59e0b",
  TRIAL_DONE: "#f59e0b",
  REGISTERED: "#22c55e",
  DROPPED: "#ef4444",
  ON_HOLD: "#9ca3af",
};

export interface FunnelDataItem {
  status: string;
  label: string;
  count: number;
}

export function ConversionFunnel({ data }: { data: FunnelDataItem[] }) {
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
          margin={{ left: 20, right: 40 }}
        >
          <XAxis type="number" fontSize={12} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={70}
            fontSize={12}
          />
          <Tooltip
            formatter={(value) => [`${value}명`]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? "#9ca3af"}
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

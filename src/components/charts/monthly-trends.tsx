"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface MonthlyTrendItem {
  month: string;
  newLeads: number;
  registered: number;
  dropped: number;
}

export function MonthlyTrends({ data }: { data: MonthlyTrendItem[] }) {
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
        <ComposedChart data={data} margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            verticalAlign="bottom"
          />
          <Bar
            dataKey="newLeads"
            name="신규 리드"
            fill="#7c3aed"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="registered"
            name="등록"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="dropped"
            name="이탈"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

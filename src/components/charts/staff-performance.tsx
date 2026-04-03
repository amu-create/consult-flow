"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

export interface StaffDataItem {
  userId: string;
  name: string;
  totalLeads: number;
  registered: number;
  dropped: number;
  conversionRate: number;
}

export function StaffPerformance({ data }: { data: StaffDataItem[] }) {
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
        <BarChart data={data} margin={{ left: 0, right: 10, top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(value, name) => [
              `${value}명`,
              `${name}`,
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            verticalAlign="bottom"
          />
          <Bar
            dataKey="registered"
            name="등록"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="conversionRate"
              position="top"
              fontSize={10}
              formatter={(value) => `${value}%`}
            />
          </Bar>
          <Bar
            dataKey="dropped"
            name="이탈"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

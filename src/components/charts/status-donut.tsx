"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  NEW_INQUIRY: "#3b82f6",
  INITIAL_CONSULT: "#7c3aed",
  CONSULTING: "#7c3aed",
  IN_PROGRESS: "#f59e0b",
  TRIAL_BOOKED: "#f59e0b",
  TRIAL_DONE: "#f59e0b",
  REGISTERED: "#22c55e",
  DROPPED: "#ef4444",
  ON_HOLD: "#9ca3af",
};

export interface StatusDonutItem {
  status: string;
  label: string;
  count: number;
}

export function StatusDonut({ data }: { data: StatusDonutItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        데이터 없음
      </div>
    );
  }

  const filtered = data.filter((d) => d.count > 0);
  const total = filtered.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        데이터 없음
      </div>
    );
  }

  const pieData = filtered.map((d) => ({
    name: d.label,
    value: d.count,
    status: d.status,
  }));

  return (
    <div className="w-full h-[280px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            paddingAngle={2}
          >
            {pieData.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? "#9ca3af"}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value}명 (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
              `${name}`,
            ]}
            contentStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">전체</p>
        </div>
      </div>
    </div>
  );
}

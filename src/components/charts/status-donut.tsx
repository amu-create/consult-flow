"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/chart-colors";
import { STATUS_LABELS, type LeadStatus } from "@/lib/constants";

interface StatusDonutProps {
  statusCounts: Record<string, number>;
}

export function StatusDonut({ statusCounts }: StatusDonutProps) {
  const data = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      name: STATUS_LABELS[status as LeadStatus] ?? status,
      value: count,
    }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full h-[240px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_CHART_COLORS[entry.status] ?? "#6b7280"}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value}명 (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
              name,
            ]}
            contentStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">전체 리드</p>
        </div>
      </div>
    </div>
  );
}

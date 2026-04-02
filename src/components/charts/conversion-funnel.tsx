"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/chart-colors";

interface FunnelStage {
  status: string;
  label: string;
  currentCount: number;
  totalReached: number;
}

export function ConversionFunnel({ stages }: { stages: FunnelStage[] }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stages} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" fontSize={12} />
          <YAxis
            type="category"
            dataKey="label"
            width={70}
            fontSize={12}
          />
          <Tooltip
            formatter={(value, name) => [
              `${value}명`,
              name === "totalReached" ? "누적 도달" : "현재",
            ]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="totalReached" name="누적 도달" radius={[0, 4, 4, 0]}>
            {stages.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_CHART_COLORS[entry.status] ?? "#6b7280"}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
          <Bar dataKey="currentCount" name="현재" radius={[0, 4, 4, 0]}>
            {stages.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_CHART_COLORS[entry.status] ?? "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

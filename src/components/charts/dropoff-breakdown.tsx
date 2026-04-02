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
import { CHART_PALETTE } from "@/lib/chart-colors";

interface ReasonData {
  code: string;
  label: string;
  count: number;
}

export function DropoffBreakdown({
  reasons,
  totalDropped,
}: {
  reasons: ReasonData[];
  totalDropped: number;
}) {
  return (
    <div className="w-full">
      <p className="text-xs text-muted-foreground mb-2">
        총 이탈 {totalDropped}건 (복수 사유 포함)
      </p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reasons} layout="vertical" margin={{ left: 30, right: 10 }}>
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
              {reasons.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

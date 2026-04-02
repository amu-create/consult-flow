"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SOURCE_CHART_COLORS, CHART_PALETTE } from "@/lib/chart-colors";

interface SourceData {
  source: string;
  label: string;
  total: number;
  registered: number;
  conversionRate: number;
}

export function SourceAnalysis({ sources }: { sources: SourceData[] }) {
  const pieData = sources.map((s) => ({
    name: s.label,
    value: s.total,
    source: s.source,
  }));

  return (
    <div className="w-full">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              dataKey="value"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(props: any) =>
                `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              fontSize={11}
            >
              {pieData.map((entry, i) => (
                <Cell
                  key={entry.source}
                  fill={SOURCE_CHART_COLORS[entry.source] ?? CHART_PALETTE[i % CHART_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}건`]}
              contentStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {sources.map((s) => (
          <div key={s.source} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-muted/50">
            <span>{s.label}</span>
            <span className="font-medium">{s.conversionRate}% 전환</span>
          </div>
        ))}
      </div>
    </div>
  );
}

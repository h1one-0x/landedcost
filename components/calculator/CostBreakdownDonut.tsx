"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { CalculationResult } from "@/types";

interface SegmentData {
  name: string;
  value: number;
  color: string;
}

const COLORS = {
  goods: "#388BFD",
  origin: "#2EA043",
  ocean: "#F0A500",
  insurance: "#D29922",
  tariffs: "#F85149",
  usDest: "#9B59B6",
  inland: "#E3892B",
  other: "#8B949E",
};

function CustomTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ payload: SegmentData }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text-primary">{data.name}</p>
      <p className="font-mono text-text-secondary">{formatCurrency(data.value)}</p>
    </div>
  );
}

export function CostBreakdownDonut({ result }: { result: CalculationResult | null }) {
  const segments = useMemo<SegmentData[]>(() => {
    if (!result) return [];
    return [
      { name: "Goods Value", value: result.goods_value, color: COLORS.goods },
      { name: "China Origin", value: result.origin_costs, color: COLORS.origin },
      { name: "Ocean Freight", value: result.ocean_total, color: COLORS.ocean },
      { name: "Insurance", value: result.insurance, color: COLORS.insurance },
      { name: "Tariffs & Duties", value: result.total_tariffs, color: COLORS.tariffs },
      { name: "US Destination", value: result.us_dest_flat, color: COLORS.usDest },
      { name: "US Inland", value: result.us_inland, color: COLORS.inland },
      { name: "Other", value: result.other_costs, color: COLORS.other },
    ].filter((s) => s.value > 0);
  }, [result]);

  const grandTotal = result?.grand_total ?? 0;

  if (!result || segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-text-muted">
        Add items to see cost breakdown
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={segments} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Total</p>
            <p className="text-lg font-bold font-mono text-accent">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {segments.map((segment) => {
          const pct = grandTotal > 0 ? segment.value / grandTotal : 0;
          return (
            <div key={segment.name} className="flex items-center gap-2 text-xs px-1 py-1 rounded hover:bg-hover transition-colors">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
              <span className="flex-1 text-text-secondary truncate">{segment.name}</span>
              <span className="font-mono text-text-primary shrink-0">{formatCurrency(segment.value)}</span>
              <span className="font-mono text-text-muted w-12 text-right shrink-0">{formatPercent(pct)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

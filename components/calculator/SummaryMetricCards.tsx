"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import type { CalculationResult } from "@/types";

interface MetricCardProps {
  label: string;
  primary: string;
  secondary?: string;
}

function MetricCard({ label, primary, secondary }: MetricCardProps) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{label}</p>
      <p className="text-2xl font-bold text-accent font-mono">{primary}</p>
      {secondary && <p className="text-sm text-text-secondary mt-1">{secondary}</p>}
    </div>
  );
}

export function SummaryMetricCards({ result }: { result: CalculationResult | null }) {
  if (!result) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Total Landed Cost", "Cost per CBM", "Avg. Landed Cost / Unit", "Total Duties & Tariffs"].map((label) => (
          <MetricCard key={label} label={label} primary="--" />
        ))}
      </div>
    );
  }

  const totalUnits = result.item_results.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Landed Cost"
        primary={formatCurrency(result.grand_total)}
        secondary={totalUnits > 0 ? `${formatCurrency(result.grand_total / totalUnits)} per unit` : undefined}
      />
      <MetricCard
        label="Cost per CBM"
        primary={result.total_cbm > 0 ? formatCurrency(result.cost_per_cbm) : "--"}
        secondary={`${result.total_cbm.toFixed(2)} CBM total`}
      />
      <MetricCard
        label="Avg. Landed Cost / Unit"
        primary={totalUnits > 0 ? formatCurrency(result.avg_landed_per_unit) : "--"}
        secondary={`${totalUnits.toLocaleString()} units total`}
      />
      <MetricCard
        label="Total Duties & Tariffs"
        primary={formatCurrency(result.total_tariffs)}
        secondary={`Duty ${formatCurrency(result.import_duty)} + MPF ${formatCurrency(result.mpf)} + HMF ${formatCurrency(result.hmf)}`}
      />
    </div>
  );
}

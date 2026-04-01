"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getContainer } from "@/lib/containers";
import { AlertTriangle } from "lucide-react";
import type { ContainerType } from "@/types";

interface ContainerFillVisualizationProps {
  totalCBM: number;
  totalKG: number;
  containerType: ContainerType;
}

function getFillColor(pct: number): string {
  if (pct > 100) return "#F85149";
  if (pct > 90) return "#E3892B";
  if (pct > 75) return "#D29922";
  return "#2EA043";
}

function getFillColorClass(pct: number): string {
  if (pct > 100) return "bg-red-500";
  if (pct > 90) return "bg-orange-500";
  if (pct > 75) return "bg-amber-500";
  return "bg-green-500";
}

export function ContainerFillVisualization({
  totalCBM,
  totalKG,
  containerType,
}: ContainerFillVisualizationProps) {
  const container = getContainer(containerType);
  const isLCL = containerType === "LCL";

  const volumePct = useMemo(() => {
    if (!container.volume_cbm) return 0;
    return Math.min((totalCBM / container.volume_cbm) * 100, 120);
  }, [totalCBM, container.volume_cbm]);

  const weightPct = useMemo(() => {
    if (!container.max_weight_kg) return 0;
    return Math.min((totalKG / container.max_weight_kg) * 100, 120);
  }, [totalKG, container.max_weight_kg]);

  const volumeColor = getFillColor(volumePct);
  const weightColor = getFillColor(weightPct);

  const weightExceedsButVolumeHasRoom =
    !isLCL &&
    container.max_weight_kg !== null &&
    container.volume_cbm !== null &&
    totalKG > container.max_weight_kg &&
    totalCBM <= container.volume_cbm;

  // Isometric box dimensions
  const boxW = 160;
  const boxH = 100;
  const boxD = 60;
  const originX = 40;
  const originY = 180;

  // Fill height as proportion of boxH (clamped to 100%)
  const fillFraction = isLCL ? 0 : Math.min(volumePct / 100, 1);
  const fillH = fillFraction * boxH;

  // Isometric vertices for the full box
  const frontBL = { x: originX, y: originY };
  const frontBR = { x: originX + boxW, y: originY };
  const frontTL = { x: originX, y: originY - boxH };
  const frontTR = { x: originX + boxW, y: originY - boxH };

  const topBL = frontTL;
  const topBR = frontTR;
  const topTL = { x: frontTL.x + boxD * 0.7, y: frontTL.y - boxD * 0.4 };
  const topTR = { x: frontTR.x + boxD * 0.7, y: frontTR.y - boxD * 0.4 };

  const sideBR = frontBR;
  const sideTR = frontTR;
  const sideBRback = { x: frontBR.x + boxD * 0.7, y: frontBR.y - boxD * 0.4 };
  const sideTRback = topTR;

  // Fill vertices (front face fill from bottom)
  const fillFrontTL = { x: originX, y: originY - fillH };
  const fillFrontTR = { x: originX + boxW, y: originY - fillH };

  // Fill top face
  const fillTopTL = { x: fillFrontTL.x + boxD * 0.7, y: fillFrontTL.y - boxD * 0.4 };
  const fillTopTR = { x: fillFrontTR.x + boxD * 0.7, y: fillFrontTR.y - boxD * 0.4 };

  // Fill side face
  const fillSideTR = fillFrontTR;
  const fillSideTRback = fillTopTR;

  return (
    <div className="space-y-4">
      {!isLCL && (
        <div className="flex justify-center">
          <svg
            viewBox="0 20 300 200"
            className="w-full max-w-[280px] h-auto"
            aria-label={`Container fill: ${volumePct.toFixed(1)}% volume`}
          >
            {/* Fill - front face */}
            {fillFraction > 0 && (
              <>
                <polygon
                  points={`${frontBL.x},${frontBL.y} ${frontBR.x},${frontBR.y} ${fillFrontTR.x},${fillFrontTR.y} ${fillFrontTL.x},${fillFrontTL.y}`}
                  fill={volumeColor}
                  opacity={0.6}
                  className="transition-all duration-500 ease-out"
                />
                {/* Fill - top face */}
                <polygon
                  points={`${fillFrontTL.x},${fillFrontTL.y} ${fillFrontTR.x},${fillFrontTR.y} ${fillTopTR.x},${fillTopTR.y} ${fillTopTL.x},${fillTopTL.y}`}
                  fill={volumeColor}
                  opacity={0.4}
                  className="transition-all duration-500 ease-out"
                />
                {/* Fill - side face */}
                <polygon
                  points={`${frontBR.x},${frontBR.y} ${sideBRback.x},${sideBRback.y} ${fillSideTRback.x},${fillSideTRback.y} ${fillSideTR.x},${fillSideTR.y}`}
                  fill={volumeColor}
                  opacity={0.5}
                  className="transition-all duration-500 ease-out"
                />
              </>
            )}

            {/* Box outline - front face */}
            <polygon
              points={`${frontBL.x},${frontBL.y} ${frontBR.x},${frontBR.y} ${frontTR.x},${frontTR.y} ${frontTL.x},${frontTL.y}`}
              fill="none"
              stroke="#484F58"
              strokeWidth="1.5"
            />
            {/* Box outline - top face */}
            <polygon
              points={`${topBL.x},${topBL.y} ${topBR.x},${topBR.y} ${topTR.x},${topTR.y} ${topTL.x},${topTL.y}`}
              fill="none"
              stroke="#484F58"
              strokeWidth="1.5"
            />
            {/* Box outline - side face */}
            <polygon
              points={`${sideBR.x},${sideBR.y} ${sideBRback.x},${sideBRback.y} ${sideTRback.x},${sideTRback.y} ${sideTR.x},${sideTR.y}`}
              fill="none"
              stroke="#484F58"
              strokeWidth="1.5"
            />

            {/* Container label */}
            <text
              x={originX + boxW / 2}
              y={originY + 18}
              textAnchor="middle"
              className="fill-text-muted text-[11px]"
            >
              {container.label}
            </text>

            {/* Fill percentage */}
            {fillFraction > 0 && (
              <text
                x={originX + boxW / 2}
                y={originY - boxH / 2}
                textAnchor="middle"
                className="fill-text-primary text-sm font-bold"
              >
                {volumePct.toFixed(1)}%
              </text>
            )}
          </svg>
        </div>
      )}

      {/* Gauge bars */}
      <div className="space-y-3">
        {/* Volume gauge */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Volume</span>
            <span className="font-mono">
              {totalCBM.toFixed(1)} CBM
              {!isLCL && container.volume_cbm
                ? ` / ${container.volume_cbm} CBM (${volumePct.toFixed(1)}%)`
                : ""}
            </span>
          </div>
          {!isLCL && (
            <div className="h-2 w-full rounded-full bg-elevated overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  getFillColorClass(volumePct)
                )}
                style={{ width: `${Math.min(volumePct, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Weight gauge */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Weight</span>
            <span className="font-mono">
              {totalKG.toLocaleString("en-US")} kg
              {!isLCL && container.max_weight_kg
                ? ` / ${container.max_weight_kg.toLocaleString("en-US")} kg (${weightPct.toFixed(1)}%)`
                : ""}
            </span>
          </div>
          {!isLCL && (
            <div className="h-2 w-full rounded-full bg-elevated overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  getFillColorClass(weightPct)
                )}
                style={{ width: `${Math.min(weightPct, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Warning if weight exceeds capacity but volume has room */}
      {weightExceedsButVolumeHasRoom && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Weight exceeds container capacity even though volume has room.
            Consider splitting into multiple containers or choosing a larger
            container type.
          </span>
        </div>
      )}
    </div>
  );
}

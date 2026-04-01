"use client";

import React, { useState, useCallback, useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEFAULT_COSTS } from "@/stores/shipmentStore";
import type { ShipmentCosts } from "@/types";
import {
  ChevronDown,
  RotateCcw,
  Info,
  ClipboardCheck,
  Ship,
  Anchor,
  Shield,
  Landmark,
  Scale,
  Truck,
  MoreHorizontal,
  Plane,
  Package,
} from "lucide-react";

interface FieldDef {
  key: keyof ShipmentCosts;
  label: string;
  tooltip: string;
  isPercent?: boolean;
  hideIfLCL?: boolean;
  lclLabel?: string;
  /** Which modes this field applies to. If omitted, applies to 'ocean' only. */
  modes?: ('ocean' | 'ddp' | 'air')[];
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  fields: FieldDef[];
  warning?: React.ReactNode;
  /** Which modes this section applies to. If omitted, applies to all. */
  modes?: ('ocean' | 'ddp' | 'air')[];
}

const SECTIONS: SectionDef[] = [
  // ── Per-kg Freight (DDP + Air) ─────────────────────────
  {
    id: "per_kg_freight",
    title: "Freight Rate",
    icon: <Package className="h-4 w-4" />,
    iconColor: "text-teal-400",
    modes: ['ddp', 'air'],
    fields: [
      { key: "freight_per_kg_usd", label: "Rate per kg", tooltip: "Shipping cost per kilogram", modes: ['ddp', 'air'] },
      { key: "pickup_fee_usd", label: "Pickup Fee", tooltip: "Collection/pickup fee at origin", modes: ['ddp', 'air'] },
      { key: "delivery_fee_usd", label: "Delivery Fee", tooltip: "Last-mile delivery fee at destination", modes: ['ddp', 'air'] },
    ],
  },
  // ── Ocean-specific sections ────────────────────────────
  {
    id: "goods",
    title: "Goods & Inspection",
    icon: <ClipboardCheck className="h-4 w-4" />,
    iconColor: "text-blue-400",
    modes: ['ocean'],
    fields: [
      { key: "factory_inspection_usd", label: "Factory Inspection", tooltip: "Pre-shipment inspection fee at the factory", modes: ['ocean'] },
    ],
  },
  {
    id: "china_origin",
    title: "China Origin",
    icon: <Ship className="h-4 w-4" />,
    iconColor: "text-emerald-400",
    modes: ['ocean'],
    fields: [
      { key: "china_inland_freight_usd", label: "China Inland Freight", tooltip: "Trucking cost from factory to port of loading", modes: ['ocean'] },
      { key: "export_customs_usd", label: "Export Customs", tooltip: "Export customs clearance and documentation", modes: ['ocean', 'air'] },
      { key: "china_thc_usd", label: "China THC", tooltip: "Terminal handling charges at Chinese port", modes: ['ocean'] },
      { key: "bl_doc_fee_usd", label: "B/L Doc Fee", tooltip: "Bill of Lading documentation fee", modes: ['ocean'] },
      { key: "origin_agent_fee_usd", label: "Origin Agent Fee", tooltip: "Freight forwarder / agent fee at origin", modes: ['ocean'] },
    ],
  },
  {
    id: "ocean_freight",
    title: "Ocean Freight",
    icon: <Anchor className="h-4 w-4" />,
    iconColor: "text-cyan-400",
    modes: ['ocean'],
    fields: [
      { key: "ocean_freight_usd", label: "Ocean Freight", tooltip: "Base ocean freight charge", lclLabel: "Rate per CBM", modes: ['ocean'] },
      { key: "bunker_surcharge_usd", label: "Bunker Surcharge (BAF)", tooltip: "Bunker adjustment factor surcharge", hideIfLCL: true, modes: ['ocean'] },
      { key: "currency_adj_factor_usd", label: "Currency Adj. Factor (CAF)", tooltip: "Currency adjustment factor", hideIfLCL: true, modes: ['ocean'] },
      { key: "peak_season_surcharge_usd", label: "Peak Season Surcharge", tooltip: "Peak season surcharge (PSS), typically May-Oct", hideIfLCL: true, modes: ['ocean'] },
    ],
  },
  // ── Shared sections ────────────────────────────────────
  {
    id: "insurance",
    title: "Insurance",
    icon: <Shield className="h-4 w-4" />,
    iconColor: "text-violet-400",
    fields: [
      { key: "marine_insurance_pct", label: "Insurance (% of value)", tooltip: "Insurance rate as decimal (e.g. 0.004 = 0.4%)", isPercent: true, modes: ['ocean', 'ddp', 'air'] },
    ],
  },
  {
    id: "us_dest",
    title: "US Destination",
    icon: <Landmark className="h-4 w-4" />,
    iconColor: "text-indigo-400",
    modes: ['ocean', 'air'],
    fields: [
      { key: "us_thc_usd", label: "US THC", tooltip: "Terminal handling charges at US port", modes: ['ocean'] },
      { key: "us_customs_clearance_usd", label: "US Customs Clearance", tooltip: "Customs brokerage fee for US import clearance", modes: ['ocean', 'air'] },
      { key: "isf_filing_fee_usd", label: "ISF Filing Fee", tooltip: "Importer Security Filing fee", modes: ['ocean'] },
      { key: "customs_bond_usd", label: "Customs Bond", tooltip: "Continuous or single-entry customs bond fee", modes: ['ocean', 'air'] },
    ],
  },
  {
    id: "tariffs",
    title: "Tariffs & Duties",
    icon: <Scale className="h-4 w-4" />,
    iconColor: "text-amber-400",
    modes: ['ocean', 'air'],
    fields: [
      { key: "mfn_duty_pct", label: "MFN Duty Rate", tooltip: "Most Favored Nation duty rate (decimal, e.g. 0.05 = 5%)", isPercent: true, modes: ['ocean', 'air'] },
      { key: "section_301_duty_pct", label: "Section 301 Duty", tooltip: "Additional tariff under Section 301 (decimal, e.g. 0.25 = 25%)", isPercent: true, modes: ['ocean', 'air'] },
      { key: "mpf_pct", label: "MPF Rate", tooltip: "Merchandise Processing Fee: 0.3464% of FOB value", isPercent: true, modes: ['ocean', 'air'] },
      { key: "hmf_pct", label: "HMF Rate", tooltip: "Harbor Maintenance Fee: 0.125% of FOB value", isPercent: true, modes: ['ocean', 'air'] },
    ],
    warning: (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300 leading-relaxed">
        <strong className="text-amber-400">Section 301 Tariffs:</strong> Most
        goods from China currently carry a 25% additional tariff. This is applied
        on top of the standard MFN rate. Electronics may be at 7.5% or exempt.
        Always verify with your customs broker.
      </div>
    ),
  },
  {
    id: "us_inland",
    title: "US Inland",
    icon: <Truck className="h-4 w-4" />,
    iconColor: "text-rose-400",
    modes: ['ocean'],
    fields: [
      { key: "drayage_usd", label: "Drayage", tooltip: "Container trucking from port to warehouse", modes: ['ocean'] },
      { key: "warehouse_unloading_usd", label: "Warehouse Unloading", tooltip: "Warehouse receiving and unloading fee", modes: ['ocean'] },
    ],
  },
  {
    id: "other",
    title: "Other",
    icon: <MoreHorizontal className="h-4 w-4" />,
    iconColor: "text-gray-400",
    fields: [
      { key: "currency_exchange_fee_pct", label: "Currency Exchange Fee", tooltip: "Bank fee for currency conversion (decimal, e.g. 0.01 = 1%)", isPercent: true, modes: ['ocean', 'ddp', 'air'] },
      { key: "bank_wire_fee_usd", label: "Bank Wire Fee", tooltip: "Wire transfer fee for international payment", modes: ['ocean', 'ddp', 'air'] },
      { key: "miscellaneous_usd", label: "Miscellaneous", tooltip: "Any other costs not covered above", modes: ['ocean', 'ddp', 'air'] },
    ],
  },
];

/** Compute the subtotal of dollar-denominated fields in a section */
function sectionSubtotal(costs: ShipmentCosts, fields: FieldDef[], isLCL: boolean, mode: 'ocean' | 'ddp' | 'air'): number {
  return fields
    .filter((f) => !f.isPercent && !(f.hideIfLCL && isLCL) && (!f.modes || f.modes.includes(mode)))
    .reduce((sum, f) => sum + (costs[f.key] || 0), 0);
}

interface CostInputAccordionProps {
  costs: ShipmentCosts;
  onUpdate: (field: string, value: number) => void;
  isLCL: boolean;
  shippingMode: 'ocean' | 'ddp' | 'air';
}

export function CostInputAccordion({ costs, onUpdate, isLCL, shippingMode }: CostInputAccordionProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(shippingMode === 'ocean' ? ["china_origin", "ocean_freight"] : ["per_kg_freight"])
  );

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resetSection = useCallback(
    (section: SectionDef, e: React.MouseEvent) => {
      e.stopPropagation();
      for (const field of section.fields) {
        if (!field.modes || field.modes.includes(shippingMode)) {
          onUpdate(field.key, DEFAULT_COSTS[field.key]);
        }
      }
    },
    [onUpdate, shippingMode]
  );

  const handleFieldChange = useCallback(
    (key: string, raw: string) => {
      const cleaned = raw.replace(/[^0-9.\-]/g, "");
      const parsed = parseFloat(cleaned);
      onUpdate(key, isNaN(parsed) ? 0 : parsed);
    },
    [onUpdate]
  );

  // Filter sections for current mode
  const visibleSections = useMemo(() => {
    return SECTIONS.filter((section) => {
      if (!section.modes) return true;
      return section.modes.includes(shippingMode);
    });
  }, [shippingMode]);

  // Compute grand total of all fixed (non-percent) costs
  const grandTotalCosts = useMemo(() => {
    return visibleSections.reduce((total, section) => {
      return total + sectionSubtotal(costs, section.fields, isLCL, shippingMode);
    }, 0);
  }, [costs, isLCL, shippingMode, visibleSections]);

  return (
    <div className="space-y-1">
      {/* DDP info banner */}
      {shippingMode === 'ddp' && (
        <div className="rounded-md border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-xs text-teal-300 leading-relaxed mb-2">
          <strong className="text-teal-400">DDP Mode:</strong> Duties and tariffs are included in the per-kg shipping rate.
          You only need to set the freight rate, pickup, and delivery fees.
        </div>
      )}

      {/* Air info banner */}
      {shippingMode === 'air' && (
        <div className="rounded-md border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-xs text-sky-300 leading-relaxed mb-2">
          <strong className="text-sky-400">Air Freight:</strong> Chargeable weight is the greater of actual weight or volumetric weight
          (CBM × 167). Duties and customs clearance still apply separately.
        </div>
      )}

      {/* Grand Total Banner */}
      <div className="rounded-lg border border-accent/30 bg-accent-dim p-4 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Total Fixed Costs</p>
            <p className="text-xs text-text-secondary mt-0.5">Sum of all dollar-amount fees (excludes % rates applied to goods value)</p>
          </div>
          <p className="text-2xl font-bold font-mono text-accent">{formatCurrency(grandTotalCosts)}</p>
        </div>
      </div>

      {visibleSections.map((section) => {
        const visibleFields = section.fields.filter(
          (f) => !(f.hideIfLCL && isLCL) && (!f.modes || f.modes.includes(shippingMode))
        );
        if (visibleFields.length === 0) return null;

        const isOpen = openSections.has(section.id);
        const subtotal = sectionSubtotal(costs, section.fields, isLCL, shippingMode);
        const hasDollarFields = visibleFields.some((f) => !f.isPercent);

        return (
          <div key={section.id} className="rounded-lg border border-border-subtle bg-surface overflow-hidden">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-hover transition-colors"
            >
              <span className={cn("shrink-0", section.iconColor)}>{section.icon}</span>
              <span className="flex-1 text-sm font-medium text-text-primary">{section.title}</span>

              {hasDollarFields && subtotal > 0 && (
                <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {formatCurrency(subtotal)}
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-text-muted hover:text-text-primary"
                onClick={(e) => resetSection(section, e)}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <ChevronDown className={cn("h-4 w-4 text-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {/* Section body */}
            <div className={cn("grid transition-all duration-200 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 space-y-3">
                  {section.warning && section.warning}
                  {visibleFields.map((field) => {
                    const value = costs[field.key];
                    const displayLabel = isLCL && field.lclLabel ? field.lclLabel : field.label;

                    return (
                      <div key={field.key} className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor={field.key} className="text-xs text-text-secondary">
                            {displayLabel}
                          </Label>
                          <span title={field.tooltip}>
                            <Info className="h-3 w-3 text-text-muted cursor-help" />
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted select-none">
                            {field.isPercent ? "%" : "$"}
                          </span>
                          <Input
                            id={field.key}
                            type="text"
                            inputMode="decimal"
                            mono
                            className="pl-7 h-8 text-sm"
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {hasDollarFields && visibleFields.length > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                      <span className="text-xs text-text-muted">Section subtotal</span>
                      <span className="font-mono text-sm font-medium text-text-primary">{formatCurrency(subtotal)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

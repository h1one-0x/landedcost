"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShipmentStore } from "@/stores/shipmentStore";
import { useCalculation } from "@/hooks/useCalculation";
import { useAuth } from "@/lib/auth-context";
import { createShipment, updateShipment, getShipment } from "@/lib/supabase-db";
import { CONTAINERS, SHIPPING_MODE_GROUPS, getShippingMode, isPerKg } from "@/lib/containers";
import { CHINA_PORTS, US_PORTS } from "@/lib/ports";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ContainerType, CalculationResult } from "@/types";

import TopBar from "@/components/layout/TopBar";
import { ContainerFillVisualization } from "@/components/calculator/ContainerFillVisualization";
import { CostInputAccordion } from "@/components/calculator/CostInputAccordion";
import { ItemsDataGrid } from "@/components/calculator/ItemsDataGrid";
import { SummaryMetricCards } from "@/components/calculator/SummaryMetricCards";
import { CostBreakdownDonut } from "@/components/calculator/CostBreakdownDonut";
import { FileUploadZone } from "@/components/upload/FileUploadZone";

import { exportToXlsx, exportToCsv } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Save, Calculator, FileDown, FileSpreadsheet, Loader2, Share2, Check, FileText } from "lucide-react";

const originPortOptions = CHINA_PORTS.map((p) => ({ label: p.name, value: p.code, sublabel: p.code }));
const destPortOptions = US_PORTS.map((p) => ({ label: p.name, value: p.code, sublabel: p.code }));

export default function NewShipmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 text-accent animate-spin" /></div>}>
      <NewShipmentContent />
    </Suspense>
  );
}

function NewShipmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");
  const { user } = useAuth();

  const items = useShipmentStore((s) => s.items);
  const costs = useShipmentStore((s) => s.costs);
  const containerType = useShipmentStore((s) => s.containerType);
  const shipmentName = useShipmentStore((s) => s.shipmentName);
  const originPort = useShipmentStore((s) => s.originPort);
  const destinationPort = useShipmentStore((s) => s.destinationPort);

  const setItems = useShipmentStore((s) => s.setItems);
  const updateCost = useShipmentStore((s) => s.updateCost);
  const setCosts = useShipmentStore((s) => s.setCosts);
  const setContainerType = useShipmentStore((s) => s.setContainerType);
  const setShipmentName = useShipmentStore((s) => s.setShipmentName);
  const setOriginPort = useShipmentStore((s) => s.setOriginPort);
  const setDestinationPort = useShipmentStore((s) => s.setDestinationPort);
  const reset = useShipmentStore((s) => s.reset);

  const result = useCalculation();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shippingDate, setShippingDate] = useState("");

  // Load existing shipment if ?load=id
  useEffect(() => {
    if (!loadId) return;
    getShipment(loadId).then((data) => {
      if (!data) return;
      setShipmentName(data.name);
      setContainerType(data.container_type as ContainerType);
      setOriginPort(data.origin_port);
      setDestinationPort(data.destination_port);
      if (data.shipping_date) setShippingDate(data.shipping_date);

      if (data.shipment_items?.length) {
        setItems(
          data.shipment_items.map((i: Record<string, unknown>) => ({
            id: i.id as string,
            product_name: i.product_name as string,
            sku: (i.sku as string) || "",
            hs_code: (i.hs_code as string) || "",
            unit_price_usd: Number(i.unit_price_usd),
            quantity: Number(i.quantity),
            weight_kg: Number(i.weight_kg),
            length_cm: Number(i.length_cm),
            width_cm: Number(i.width_cm),
            height_cm: Number(i.height_cm),
          }))
        );
      }

      const c = data.shipment_costs?.[0];
      if (c) {
        setCosts({
          factory_inspection_usd: Number(c.factory_inspection_usd),
          china_inland_freight_usd: Number(c.china_inland_freight_usd),
          export_customs_usd: Number(c.export_customs_usd),
          china_thc_usd: Number(c.china_thc_usd),
          bl_doc_fee_usd: Number(c.bl_doc_fee_usd),
          origin_agent_fee_usd: Number(c.origin_agent_fee_usd),
          ocean_freight_usd: Number(c.ocean_freight_usd),
          bunker_surcharge_usd: Number(c.bunker_surcharge_usd),
          currency_adj_factor_usd: Number(c.currency_adj_factor_usd),
          peak_season_surcharge_usd: Number(c.peak_season_surcharge_usd),
          marine_insurance_pct: Number(c.marine_insurance_pct),
          us_thc_usd: Number(c.us_thc_usd),
          us_customs_clearance_usd: Number(c.us_customs_clearance_usd),
          isf_filing_fee_usd: Number(c.isf_filing_fee_usd),
          customs_bond_usd: Number(c.customs_bond_usd),
          mfn_duty_pct: Number(c.mfn_duty_pct),
          section_301_duty_pct: Number(c.section_301_duty_pct),
          mpf_pct: Number(c.mpf_pct),
          hmf_pct: Number(c.hmf_pct),
          drayage_usd: Number(c.drayage_usd),
          warehouse_unloading_usd: Number(c.warehouse_unloading_usd),
          currency_exchange_fee_pct: Number(c.currency_exchange_fee_pct),
          bank_wire_fee_usd: Number(c.bank_wire_fee_usd),
          miscellaneous_usd: Number(c.miscellaneous_usd),
          freight_per_kg_usd: Number(c.freight_per_kg_usd ?? 5),
          pickup_fee_usd: Number(c.pickup_fee_usd ?? 50),
          delivery_fee_usd: Number(c.delivery_fee_usd ?? 50),
        });
      }

      if (data.share_token) {
        setShareUrl(`${window.location.origin}/share/${data.share_token}`);
      }
    });
  }, [loadId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(status: "draft" | "confirmed" = "draft") {
    if (!user) return;
    if (!shipmentName.trim()) {
      alert("Please enter a shipment name before saving.");
      return;
    }
    if (status === "confirmed" && items.length === 0) {
      alert("Please add at least one product before confirming a shipment.");
      return;
    }
    setSaving(true);
    try {
      const r = result ?? {
        goods_value: 0, total_kg: 0, total_cbm: 0,
        fill_volume_pct: null, fill_weight_pct: null,
        origin_costs: 0, ocean_total: 0, insurance: 0,
        us_dest_flat: 0, total_tariffs: 0, us_inland: 0,
        other_costs: 0, grand_total: 0, cost_per_cbm: 0,
        avg_landed_per_unit: 0,
      };

      const saveParams = {
        userId: user.id,
        name: shipmentName.trim(),
        containerType,
        originPort,
        destinationPort,
        shippingDate: shippingDate || undefined,
        status,
        items,
        costs,
        result: {
          goods_value: r.goods_value,
          total_kg: r.total_kg,
          total_cbm: r.total_cbm,
          fill_volume_pct: r.fill_volume_pct,
          fill_weight_pct: r.fill_weight_pct,
          origin_costs: r.origin_costs,
          ocean_total: r.ocean_total,
          insurance: r.insurance,
          us_dest_flat: r.us_dest_flat,
          total_tariffs: r.total_tariffs,
          us_inland: r.us_inland,
          other_costs: r.other_costs,
          grand_total: r.grand_total,
          cost_per_cbm: r.cost_per_cbm,
          avg_landed_per_unit: r.avg_landed_per_unit,
        },
      };

      const shipment = loadId
        ? await updateShipment(loadId, saveParams)
        : await createShipment(saveParams);
      setSaved(true);
      setShareUrl(`${window.location.origin}/share/${shipment.share_token}`);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save shipment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyShareLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalCBM = useMemo(
    () => items.reduce((s, i) => s + (i.length_cm * i.width_cm * i.height_cm / 1_000_000) * i.quantity, 0),
    [items]
  );
  const totalKG = useMemo(
    () => items.reduce((s, i) => s + i.weight_kg * i.quantity, 0),
    [items]
  );

  const isLCL = containerType === "LCL";
  const shippingMode = getShippingMode(containerType);
  const perKgMode = isPerKg(containerType);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar breadcrumbs={[{ label: "Dashboard", href: "/app" }, { label: loadId ? "Edit Shipment" : "New Shipment" }]} />

      <main className="flex-1 px-6 py-6 space-y-8">
        {/* Shipment Header */}
        <section className="space-y-4">
          <Input
            value={shipmentName || ""}
            onChange={(e) => setShipmentName(e.target.value)}
            placeholder="New Shipment"
            className="text-2xl font-bold border-none bg-transparent px-0 h-auto py-1 focus:ring-0 focus:border-b focus:border-accent placeholder:text-text-muted"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-text-secondary">Shipping Mode</Label>
              <Select value={containerType} onChange={(e) => setContainerType(e.target.value as ContainerType)}>
                {SHIPPING_MODE_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.types.map((type) => (
                      <option key={type} value={type}>{CONTAINERS[type].label}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-secondary">Origin Port</Label>
              <Autocomplete
                value={originPort}
                onChange={setOriginPort}
                options={originPortOptions}
                placeholder="Type to search..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-secondary">Destination Port</Label>
              <Autocomplete
                value={destinationPort}
                onChange={setDestinationPort}
                options={destPortOptions}
                placeholder="Type to search..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-secondary">Shipping Date</Label>
              <Input type="date" value={shippingDate} onChange={(e) => setShippingDate(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Main Tabs */}
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <FileUploadZone onImport={(importedItems) => setItems(importedItems)} />
                <ItemsDataGrid items={items} onItemsChange={setItems} />
              </div>
              <div className="hidden lg:block">
                <div className="sticky top-20 space-y-4">
                  {perKgMode ? (
                    <div className="rounded-lg border border-border-subtle bg-surface p-5">
                      <h3 className="text-sm font-medium text-text-primary mb-4">Weight Summary</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Total Weight</span>
                          <span className="font-mono text-lg font-semibold text-accent">{totalKG.toFixed(1)} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Total Volume</span>
                          <span className="font-mono text-sm text-text-primary">{totalCBM.toFixed(3)} CBM</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Items</span>
                          <span className="font-mono text-sm text-text-primary">{items.length} products</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border-subtle bg-surface p-5">
                      <h3 className="text-sm font-medium text-text-primary mb-4">Container Fill</h3>
                      <ContainerFillVisualization totalCBM={totalCBM} totalKG={totalKG} containerType={containerType} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CostInputAccordion costs={costs} onUpdate={(field, value) => updateCost(field as keyof typeof costs, value)} isLCL={isLCL} shippingMode={shippingMode} />
              </div>
              <div>
                <div className="sticky top-20 rounded-lg border border-border-subtle bg-surface p-5">
                  {perKgMode ? (
                    <>
                      <h3 className="text-sm font-medium text-text-primary mb-4">Weight Summary</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Total Weight</span>
                          <span className="font-mono text-lg font-semibold text-accent">{totalKG.toFixed(1)} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Total Volume</span>
                          <span className="font-mono text-sm text-text-primary">{totalCBM.toFixed(3)} CBM</span>
                        </div>
                        {shippingMode === 'air' && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">Volumetric Weight</span>
                            <span className="font-mono text-sm text-text-primary">{(totalCBM * 167).toFixed(1)} kg</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                          <span className="text-xs text-text-secondary">Est. Freight Cost</span>
                          <span className="font-mono text-lg font-bold text-accent">
                            {formatCurrency(costs.freight_per_kg_usd * (shippingMode === 'air' ? Math.max(totalKG, totalCBM * 167) : totalKG))}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-text-primary mb-4">Container Fill</h3>
                      <ContainerFillVisualization totalCBM={totalCBM} totalKG={totalKG} containerType={containerType} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-6">
              <SummaryMetricCards result={result} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border border-border-subtle bg-surface p-5">
                  <h3 className="text-sm font-medium text-text-primary mb-4">Cost Breakdown</h3>
                  <CostBreakdownDonut result={result} />
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface p-5">
                  <h3 className="text-sm font-medium text-text-primary mb-4">Per-Item Landed Cost</h3>
                  <PerItemResultsTable result={result} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-6">
          <div className="flex items-center gap-2">
            {result && (
              <>
                <Button variant="secondary" onClick={() => exportToXlsx({ shipmentName: shipmentName || "Shipment", containerType, originPort, destinationPort, shippingDate, costs, result })}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export XLSX
                </Button>
                <Button variant="secondary" onClick={() => exportToCsv({ shipmentName: shipmentName || "Shipment", containerType, originPort, destinationPort, shippingDate, costs, result })}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </>
            )}
            {shareUrl && (
              <Button variant="secondary" onClick={handleCopyShareLink}>
                {copied ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Share2 className="mr-2 h-4 w-4" />}
                {copied ? "Link Copied!" : "Copy Share Link"}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => handleSave("draft")} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saved ? "Saved!" : "Save Draft"}
            </Button>
            <Button variant="default" onClick={() => handleSave("confirmed")} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
              Calculate &amp; Save
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function PerItemResultsTable({ result }: { result: CalculationResult | null }) {
  if (!result || result.item_results.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-text-muted">
        Add products and costs to see per-item results
      </div>
    );
  }

  const { item_results, grand_total } = result;
  const totalQty = item_results.reduce((s, i) => s + i.quantity, 0);
  const totalGoodsValue = item_results.reduce((s, i) => s + i.unit_price_usd * i.quantity, 0);
  const totalLanded = item_results.reduce((s, i) => s + i.total_landed_usd, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left">
            <th className="pb-2 pr-4 text-xs font-medium text-text-muted">Product</th>
            <th className="pb-2 pr-4 text-xs font-medium text-text-muted text-right">Qty</th>
            <th className="pb-2 pr-4 text-xs font-medium text-text-muted text-right">Unit Price</th>
            <th className="pb-2 pr-4 text-xs font-medium text-text-muted text-right">Landed/Unit</th>
            <th className="pb-2 pr-4 text-xs font-medium text-text-muted text-right">Total Landed</th>
            <th className="pb-2 text-xs font-medium text-text-muted text-right">Share</th>
          </tr>
        </thead>
        <tbody>
          {item_results.map((item) => (
            <tr key={item.id} className="border-b border-border-subtle/50 hover:bg-hover transition-colors">
              <td className="py-2.5 pr-4 text-text-primary truncate max-w-[180px]">{item.product_name}</td>
              <td className="py-2.5 pr-4 text-right font-mono text-text-secondary">{item.quantity.toLocaleString()}</td>
              <td className="py-2.5 pr-4 text-right font-mono text-text-secondary">{formatCurrency(item.unit_price_usd)}</td>
              <td className="py-2.5 pr-4 text-right font-mono text-accent font-medium">{formatCurrency(item.landed_per_unit_usd)}</td>
              <td className="py-2.5 pr-4 text-right font-mono text-text-primary">{formatCurrency(item.total_landed_usd)}</td>
              <td className="py-2.5 text-right font-mono text-text-secondary">{formatPercent(grand_total > 0 ? item.total_landed_usd / grand_total : 0)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border-subtle font-medium">
            <td className="pt-3 pr-4 text-text-primary">Totals</td>
            <td className="pt-3 pr-4 text-right font-mono text-text-primary">{totalQty.toLocaleString()}</td>
            <td className="pt-3 pr-4 text-right font-mono text-text-secondary">{formatCurrency(totalGoodsValue)}</td>
            <td className="pt-3 pr-4 text-right font-mono text-accent font-bold">{totalQty > 0 ? formatCurrency(totalLanded / totalQty) : "--"}</td>
            <td className="pt-3 pr-4 text-right font-mono text-text-primary font-bold">{formatCurrency(totalLanded)}</td>
            <td className="pt-3 text-right font-mono text-text-secondary">{formatPercent(1)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

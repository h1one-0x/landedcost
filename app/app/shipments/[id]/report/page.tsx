import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { calculateLandedCost } from "@/lib/calculator";
import { getContainer, getShippingMode } from "@/lib/containers";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ShipmentItem, ShipmentCosts, ContainerType } from "@/types";
import ReportActions from "./ReportActions";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: shipment } = await supabase
    .from("shipments")
    .select(`
      *,
      shipment_items(*),
      shipment_costs(*),
      shipment_results(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!shipment) return notFound();

  const items: ShipmentItem[] = (shipment.shipment_items ?? []).map((i: Record<string, unknown>, idx: number) => ({
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
    source_url: (i.source_url as string) || undefined,
    image_url: (i.image_url as string) || undefined,
    sort_order: idx,
  }));

  const c = shipment.shipment_costs?.[0];
  const costs: ShipmentCosts = c
    ? {
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
      }
    : {
        factory_inspection_usd: 300, china_inland_freight_usd: 300, export_customs_usd: 100,
        china_thc_usd: 100, bl_doc_fee_usd: 75, origin_agent_fee_usd: 150,
        ocean_freight_usd: 2500, bunker_surcharge_usd: 0, currency_adj_factor_usd: 0,
        peak_season_surcharge_usd: 0, marine_insurance_pct: 0.004, us_thc_usd: 450,
        us_customs_clearance_usd: 225, isf_filing_fee_usd: 55, customs_bond_usd: 100,
        mfn_duty_pct: 0, section_301_duty_pct: 0.25, mpf_pct: 0.003464, hmf_pct: 0.00125,
        drayage_usd: 500, warehouse_unloading_usd: 350, currency_exchange_fee_pct: 0.01,
        bank_wire_fee_usd: 35, miscellaneous_usd: 0, freight_per_kg_usd: 5,
        pickup_fee_usd: 50, delivery_fee_usd: 50,
      };

  const containerType = shipment.container_type as ContainerType;
  const container = getContainer(containerType);
  const mode = getShippingMode(containerType);
  const isLCL = containerType === "LCL";

  const result = calculateLandedCost(items, costs, container, mode, isLCL);

  const createdDate = new Date(shipment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const breakdown = [
    { category: "Goods Value", amount: result.goods_value, pct: result.breakdown.goods_value_pct },
    { category: "Origin Costs", amount: result.origin_costs, pct: result.breakdown.origin_pct },
    { category: "Ocean / Air Freight", amount: result.ocean_total, pct: result.breakdown.ocean_pct },
    { category: "Insurance", amount: result.insurance, pct: result.breakdown.insurance_pct },
    { category: "Destination Fees", amount: result.us_dest_flat, pct: result.breakdown.us_dest_pct },
    { category: "Duties & Tariffs", amount: result.total_tariffs, pct: result.breakdown.tariffs_pct },
    { category: "Inland Delivery", amount: result.us_inland, pct: result.breakdown.inland_pct },
    { category: "Other Costs", amount: result.other_costs, pct: result.breakdown.other_pct },
  ];

  return (
    <>
      <style>{`
        @media print {
          aside, header, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; }
          .print-bg-white { background: white !important; color: black !important; border-color: #e5e7eb !important; }
          .print-text-black { color: black !important; }
          .print-text-gray { color: #4b5563 !important; }
        }
      `}</style>

      <div className="flex flex-col">
        <ReportActions
          shipmentId={id}
          shipmentName={shipment.name}
          containerType={containerType}
          originPort={shipment.origin_port}
          destinationPort={shipment.destination_port}
          shippingDate={shipment.shipping_date}
          costs={costs}
          result={result}
        />

        <div className="print-container mx-auto w-full max-w-4xl p-6">
          <div className="print-bg-white rounded-lg border border-border-subtle bg-surface p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="print-text-black text-2xl font-bold text-text-primary">
                  Landed Cost Report
                </h1>
                <p className="print-text-gray mt-1 text-sm text-text-secondary">
                  {shipment.name}
                </p>
              </div>
              <div className="text-right">
                <p className="print-text-black text-sm font-medium text-text-primary">
                  {containerType} | {shipment.origin_port} &rarr; {shipment.destination_port}
                </p>
                <p className="print-text-gray mt-0.5 text-xs text-text-secondary">
                  {createdDate}
                </p>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Goods Value", value: result.goods_value },
                { label: "Total Duties", value: result.total_tariffs },
                { label: "Total Freight", value: result.ocean_total },
                { label: "Grand Total", value: result.grand_total, highlight: true },
              ].map((metric) => (
                <div key={metric.label} className="print-bg-white rounded-lg border border-border-subtle bg-elevated p-4">
                  <p className="print-text-gray text-xs text-text-secondary">{metric.label}</p>
                  <p className={`print-text-black mt-1 font-mono text-lg font-bold ${metric.highlight ? "text-accent" : "text-text-primary"}`}>
                    {formatCurrency(metric.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Key Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { label: "Total CBM", value: `${result.total_cbm.toFixed(3)} m³` },
                { label: "Total Weight", value: `${result.total_kg.toFixed(1)} kg` },
                { label: "Cost per CBM", value: formatCurrency(result.cost_per_cbm) },
                { label: "Cost per kg", value: formatCurrency(result.cost_per_kg) },
                { label: "Avg Landed/Unit", value: formatCurrency(result.avg_landed_per_unit) },
              ].map((m) => (
                <div key={m.label} className="print-bg-white rounded-lg border border-border-subtle bg-elevated/50 p-3">
                  <p className="print-text-gray text-xs text-text-secondary">{m.label}</p>
                  <p className="print-text-black mt-0.5 font-mono text-sm font-semibold text-text-primary">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Cost Breakdown Table */}
            <div className="mt-8">
              <h2 className="print-text-black text-lg font-semibold text-text-primary">Cost Breakdown</h2>
              <div className="mt-3 overflow-hidden rounded-lg border border-border-subtle">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="print-bg-white border-b border-border-subtle bg-elevated">
                      <th className="print-text-gray px-4 py-3 text-left font-medium text-text-secondary">Category</th>
                      <th className="print-text-gray px-4 py-3 text-right font-medium text-text-secondary">Amount</th>
                      <th className="print-text-gray px-4 py-3 text-right font-medium text-text-secondary">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((row, i) => (
                      <tr key={row.category} className={`print-bg-white border-b border-border-subtle ${i % 2 === 0 ? "bg-surface" : "bg-elevated/30"}`}>
                        <td className="print-text-black px-4 py-3 text-text-primary">{row.category}</td>
                        <td className="print-text-black px-4 py-3 text-right font-mono text-text-primary">{formatCurrency(row.amount)}</td>
                        <td className="print-text-gray px-4 py-3 text-right text-text-secondary">{formatPercent(row.pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="print-bg-white border-t-2 border-accent/30 bg-accent/5">
                      <td className="print-text-black px-4 py-3 font-semibold text-text-primary">Grand Total</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-accent">{formatCurrency(result.grand_total)}</td>
                      <td className="print-text-gray px-4 py-3 text-right font-semibold text-text-secondary">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Product Details Table */}
            {result.item_results.length > 0 && (
              <div className="mt-8">
                <h2 className="print-text-black text-lg font-semibold text-text-primary">Product Details</h2>
                <div className="mt-3 overflow-hidden rounded-lg border border-border-subtle">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="print-bg-white border-b border-border-subtle bg-elevated">
                        <th className="print-text-gray px-4 py-3 text-left font-medium text-text-secondary">Product</th>
                        <th className="print-text-gray px-4 py-3 text-left font-medium text-text-secondary">SKU</th>
                        <th className="print-text-gray px-4 py-3 text-right font-medium text-text-secondary">Qty</th>
                        <th className="print-text-gray px-4 py-3 text-right font-medium text-text-secondary">Unit Price</th>
                        <th className="print-text-gray px-4 py-3 text-right font-medium text-text-secondary">Landed/Unit</th>
                        <th className="print-text-gray px-4 py-3 text-right font-medium text-text-secondary">Total Landed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.item_results.map((product, i) => (
                        <tr key={product.id} className={`print-bg-white border-b border-border-subtle ${i % 2 === 0 ? "bg-surface" : "bg-elevated/30"}`}>
                          <td className="print-text-black px-4 py-3 font-medium text-text-primary">{product.product_name}</td>
                          <td className="print-text-gray px-4 py-3 font-mono text-xs text-text-secondary">{product.sku || "-"}</td>
                          <td className="print-text-black px-4 py-3 text-right text-text-primary">{product.quantity.toLocaleString()}</td>
                          <td className="print-text-black px-4 py-3 text-right font-mono text-text-primary">{formatCurrency(product.unit_price_usd)}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-accent">{formatCurrency(product.landed_per_unit_usd)}</td>
                          <td className="print-text-black px-4 py-3 text-right font-mono font-semibold text-text-primary">{formatCurrency(product.total_landed_usd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 border-t border-border-subtle pt-4 text-center">
              <p className="print-text-gray text-xs text-text-secondary">
                Generated by LandedCost &mdash; {createdDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

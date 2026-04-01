import { Anchor, Lock, FileSpreadsheet, Package, ArrowRight, Box } from "lucide-react";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/utils";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedShipmentPage({ params }: SharePageProps) {
  const { token } = await params;

  const supabase = await createServerClient();
  const { data: shipment } = await supabase
    .from("shipments")
    .select(`
      *,
      shipment_items(*),
      shipment_costs(*),
      shipment_results(*)
    `)
    .eq("share_token", token)
    .single();

  if (!shipment) return notFound();

  const items = shipment.shipment_items ?? [];
  const results = shipment.shipment_results?.[0];
  const grandTotal = results ? Number(results.grand_total_usd) : 0;
  const goodsValue = results ? Number(results.total_goods_value_usd) : 0;
  const totalTariffs = results ? Number(results.total_tariffs_usd) : 0;
  const oceanTotal = results ? Number(results.total_ocean_usd) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border-subtle/50 bg-surface/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-6 h-6 text-accent" />
            <span className="font-serif text-lg text-text-primary tracking-tight">
              LandedCost
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Lock className="w-4 h-4" />
            <span>Read-only view</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-surface border border-border-subtle rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl text-text-primary mb-1">
                {shipment.name}
              </h1>
              <div className="flex items-center gap-3 text-text-secondary text-sm mt-2">
                <span className="flex items-center gap-1">
                  <Box className="w-4 h-4" />
                  {shipment.container_type}
                </span>
                <span className="flex items-center gap-1">
                  {shipment.origin_port}
                  <ArrowRight className="w-3 h-3" />
                  {shipment.destination_port}
                </span>
              </div>
            </div>
            <div className="bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
              Shared Link
            </div>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total FOB", value: formatCurrency(goodsValue) },
              { label: "Duties & Tariffs", value: formatCurrency(totalTariffs) },
              { label: "Ocean Freight", value: formatCurrency(oceanTotal) },
              { label: "Total Landed", value: formatCurrency(grandTotal) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-elevated rounded-xl p-4 border border-border-subtle/50"
              >
                <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="font-mono text-accent text-2xl font-semibold">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Line Items Table */}
          <div className="bg-elevated rounded-xl border border-border-subtle/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle/50 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              <span className="text-text-primary font-medium text-sm">
                Line Items ({items.length})
              </span>
            </div>
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle/50 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary">Product</th>
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary">SKU</th>
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary">HS Code</th>
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary text-right">Qty</th>
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary text-right">Unit Price</th>
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary text-right">Weight (kg)</th>
                      <th className="px-5 py-3 text-xs font-medium text-text-secondary text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: Record<string, unknown>) => (
                      <tr key={item.id as string} className="border-b border-border-subtle/30 hover:bg-surface/50 transition-colors">
                        <td className="px-5 py-3 text-text-primary">{item.product_name as string}</td>
                        <td className="px-5 py-3 text-text-secondary font-mono text-xs">{(item.sku as string) || "-"}</td>
                        <td className="px-5 py-3 text-text-secondary font-mono text-xs">{(item.hs_code as string) || "-"}</td>
                        <td className="px-5 py-3 text-right font-mono text-text-primary">{Number(item.quantity).toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-mono text-text-primary">{formatCurrency(Number(item.unit_price_usd))}</td>
                        <td className="px-5 py-3 text-right font-mono text-text-secondary">{Number(item.weight_kg).toFixed(1)}</td>
                        <td className="px-5 py-3 text-right font-mono text-accent font-medium">
                          {formatCurrency(Number(item.unit_price_usd) * Number(item.quantity))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border-subtle">
                      <td colSpan={3} className="px-5 py-3 font-medium text-text-primary">Totals</td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-text-primary">
                        {items.reduce((s: number, i: Record<string, unknown>) => s + Number(i.quantity), 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3"></td>
                      <td className="px-5 py-3 text-right font-mono text-text-secondary">
                        {items.reduce((s: number, i: Record<string, unknown>) => s + Number(i.weight_kg) * Number(i.quantity), 0).toFixed(1)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-accent">
                        {formatCurrency(goodsValue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                <p className="text-text-secondary">No line items in this shipment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-text-secondary text-sm">
            This is a read-only view shared via{" "}
            <span className="text-accent">LandedCost</span>.{" "}
            <a href="/" className="text-accent hover:underline">
              Create your own calculations &rarr;
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

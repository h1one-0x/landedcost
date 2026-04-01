// ============================================================
// LandedCost SaaS – Shipment Export (XLSX / CSV)
// ============================================================

import * as XLSX from 'xlsx';
import type { CalculationResult, ShipmentCosts } from '@/types';

export interface ExportShipmentData {
  shipmentName: string;
  containerType: string;
  originPort: string;
  destinationPort: string;
  shippingDate?: string;
  costs: ShipmentCosts;
  result: CalculationResult;
}

function buildWorkbook(data: ExportShipmentData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ─────────────────────────────────────
  const summaryRows = [
    ['LandedCost Report'],
    [],
    ['Shipment Name', data.shipmentName],
    ['Container Type', data.containerType],
    ['Origin Port', data.originPort],
    ['Destination Port', data.destinationPort],
    ['Shipping Date', data.shippingDate || 'N/A'],
    [],
    ['Cost Category', 'Amount (USD)', '% of Total'],
    ['Goods Value', data.result.goods_value, data.result.breakdown.goods_value_pct],
    ['Origin Costs', data.result.origin_costs, data.result.breakdown.origin_pct],
    ['Ocean / Air Freight', data.result.ocean_total, data.result.breakdown.ocean_pct],
    ['Insurance', data.result.insurance, data.result.breakdown.insurance_pct],
    ['US Destination Fees', data.result.us_dest_flat, data.result.breakdown.us_dest_pct],
    ['Duties & Tariffs', data.result.total_tariffs, data.result.breakdown.tariffs_pct],
    ['  - Import Duty', data.result.import_duty, ''],
    ['  - MPF', data.result.mpf, ''],
    ['  - HMF', data.result.hmf, ''],
    ['US Inland', data.result.us_inland, data.result.breakdown.inland_pct],
    ['Other Costs', data.result.other_costs, data.result.breakdown.other_pct],
    [],
    ['Grand Total', data.result.grand_total, 1],
    [],
    ['Key Metrics', 'Value'],
    ['Total Volume (CBM)', data.result.total_cbm],
    ['Total Weight (kg)', data.result.total_kg],
    ['Cost per CBM', data.result.cost_per_cbm],
    ['Cost per kg', data.result.cost_per_kg],
    ['Avg Landed Cost per Unit', data.result.avg_landed_per_unit],
  ];

  if (data.result.fill_volume_pct !== null) {
    summaryRows.push(['Container Fill (Volume)', data.result.fill_volume_pct]);
  }
  if (data.result.fill_weight_pct !== null) {
    summaryRows.push(['Container Fill (Weight)', data.result.fill_weight_pct]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);

  // Set column widths
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }];

  // Format percentage cells (column C, rows 10-21)
  for (let r = 9; r <= 21; r++) {
    const cell = wsSummary[XLSX.utils.encode_cell({ r, c: 2 })];
    if (cell && typeof cell.v === 'number' && cell.v <= 1) {
      cell.z = '0.0%';
    }
  }

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Line Items ──────────────────────────────────
  if (data.result.item_results.length > 0) {
    const itemHeaders = [
      'Product Name', 'Source Link', 'SKU', 'HS Code', 'Quantity',
      'Unit Price (USD)', 'Weight (kg)',
      'L (cm)', 'W (cm)', 'H (cm)', 'Volume (CBM)',
      'Overhead/Unit (USD)', 'Landed/Unit (USD)', 'Total Landed (USD)', 'Share %'
    ];

    const itemRows = data.result.item_results.map(item => [
      item.product_name,
      item.source_url || '',
      item.sku || '',
      item.hs_code || '',
      item.quantity,
      item.unit_price_usd,
      item.weight_kg,
      item.length_cm,
      item.width_cm,
      item.height_cm,
      item.volume_cbm,
      item.overhead_per_unit_usd,
      item.landed_per_unit_usd,
      item.total_landed_usd,
      item.share_pct,
    ]);

    // Add totals row
    const totalQty = data.result.item_results.reduce((s, i) => s + i.quantity, 0);
    const totalWeight = data.result.item_results.reduce((s, i) => s + i.weight_kg * i.quantity, 0);
    const totalVolume = data.result.item_results.reduce((s, i) => s + i.volume_cbm, 0);
    const totalLanded = data.result.item_results.reduce((s, i) => s + i.total_landed_usd, 0);

    itemRows.push([
      'TOTALS', '', '', '', totalQty, '', totalWeight,
      '', '', '', totalVolume,
      '', totalQty > 0 ? totalLanded / totalQty : 0, totalLanded, 1,
    ]);

    const wsItems = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows]);
    wsItems['!cols'] = [
      { wch: 30 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
      { wch: 16 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
      { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items');
  }

  // ── Sheet 3: Cost Inputs ─────────────────────────────────
  const costRows = [
    ['Cost Input Parameter', 'Value'],
    [],
    ['China Origin'],
    ['Factory Inspection (USD)', data.costs.factory_inspection_usd],
    ['China Inland Freight (USD)', data.costs.china_inland_freight_usd],
    ['Export Customs (USD)', data.costs.export_customs_usd],
    ['China THC (USD)', data.costs.china_thc_usd],
    ['B/L Doc Fee (USD)', data.costs.bl_doc_fee_usd],
    ['Origin Agent Fee (USD)', data.costs.origin_agent_fee_usd],
    [],
    ['Ocean Freight'],
    ['Ocean Freight (USD)', data.costs.ocean_freight_usd],
    ['Bunker Surcharge (USD)', data.costs.bunker_surcharge_usd],
    ['Currency Adjustment Factor (USD)', data.costs.currency_adj_factor_usd],
    ['Peak Season Surcharge (USD)', data.costs.peak_season_surcharge_usd],
    [],
    ['DDP / Air'],
    ['Freight per kg (USD)', data.costs.freight_per_kg_usd],
    ['Pickup Fee (USD)', data.costs.pickup_fee_usd],
    ['Delivery Fee (USD)', data.costs.delivery_fee_usd],
    [],
    ['Insurance'],
    ['Marine Insurance (%)', data.costs.marine_insurance_pct],
    [],
    ['US Destination'],
    ['US THC (USD)', data.costs.us_thc_usd],
    ['US Customs Clearance (USD)', data.costs.us_customs_clearance_usd],
    ['ISF Filing Fee (USD)', data.costs.isf_filing_fee_usd],
    ['Customs Bond (USD)', data.costs.customs_bond_usd],
    [],
    ['Tariffs'],
    ['MFN Duty (%)', data.costs.mfn_duty_pct],
    ['Section 301 Duty (%)', data.costs.section_301_duty_pct],
    ['MPF (%)', data.costs.mpf_pct],
    ['HMF (%)', data.costs.hmf_pct],
    [],
    ['US Inland'],
    ['Drayage (USD)', data.costs.drayage_usd],
    ['Warehouse Unloading (USD)', data.costs.warehouse_unloading_usd],
    [],
    ['Other'],
    ['Currency Exchange Fee (%)', data.costs.currency_exchange_fee_pct],
    ['Bank Wire Fee (USD)', data.costs.bank_wire_fee_usd],
    ['Miscellaneous (USD)', data.costs.miscellaneous_usd],
  ];

  const wsCosts = XLSX.utils.aoa_to_sheet(costRows);
  wsCosts['!cols'] = [{ wch: 34 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Cost Inputs');

  return wb;
}

/**
 * Export shipment data as XLSX and trigger browser download.
 */
export function exportToXlsx(data: ExportShipmentData): void {
  const wb = buildWorkbook(data);
  const filename = `${sanitizeFilename(data.shipmentName)}_landed_cost.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export shipment data as CSV (summary + items combined) and trigger browser download.
 */
export function exportToCsv(data: ExportShipmentData): void {
  const wb = buildWorkbook(data);
  // Export the Summary sheet as CSV
  const filename = `${sanitizeFilename(data.shipmentName)}_landed_cost.csv`;
  XLSX.writeFile(wb, filename, { bookType: 'csv' });
}

function sanitizeFilename(name: string): string {
  return (name || 'shipment')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 60);
}

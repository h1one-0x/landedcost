import type {
  ShipmentItem,
  ShipmentCosts,
  ContainerSpec,
  CalculationResult,
  ItemResult,
  CostBreakdown,
} from '@/types';

function safeDivide(n: number, d: number): number {
  return d === 0 ? 0 : n / d;
}

export function calculateLandedCost(
  items: ShipmentItem[],
  costs: ShipmentCosts,
  container: ContainerSpec,
  shippingMode: 'ocean' | 'ddp' | 'air',
  isLCL: boolean,
): CalculationResult {
  // 1. Goods value
  const goodsValue = items.reduce((s, i) => s + i.unit_price_usd * i.quantity, 0);

  // 2. Volume & weight
  const totalCBM = items.reduce(
    (s, i) => s + (i.length_cm * i.width_cm * i.height_cm / 1_000_000) * i.quantity, 0
  );
  const totalKG = items.reduce((s, i) => s + i.weight_kg * i.quantity, 0);

  const fillVolumePct = container.volume_cbm ? totalCBM / container.volume_cbm : null;
  const fillWeightPct = container.max_weight_kg ? totalKG / container.max_weight_kg : null;

  let originCosts: number;
  let oceanTotal: number;
  let insurance: number;
  let usDestFlat: number;
  let totalTariffs: number;
  let importDuty: number;
  let mpf: number;
  let hmf: number;
  let usInland: number;
  let otherCosts: number;

  if (shippingMode === 'ddp') {
    // ── DDP Mode ──────────────────────────────────────────
    // Freight = per-kg rate * total weight
    // Duties are INCLUDED in the DDP rate
    // Minimal origin/destination costs (just pickup + delivery)
    originCosts = costs.pickup_fee_usd;
    oceanTotal = costs.freight_per_kg_usd * totalKG;
    insurance = (goodsValue + oceanTotal) * costs.marine_insurance_pct;
    usDestFlat = costs.delivery_fee_usd;
    // DDP = duties included in freight rate, no separate tariffs
    importDuty = 0;
    mpf = 0;
    hmf = 0;
    totalTariffs = 0;
    usInland = 0; // delivery fee covers this
    otherCosts =
      goodsValue * costs.currency_exchange_fee_pct +
      costs.bank_wire_fee_usd +
      costs.miscellaneous_usd;
  } else if (shippingMode === 'air') {
    // ── Air Freight Mode ─────────────────────────────────
    // Freight = per-kg rate * max(actual weight, volumetric weight)
    // Volumetric weight for air = CBM * 167 (industry standard dim factor)
    const volumetricKG = totalCBM * 167;
    const chargeableKG = Math.max(totalKG, volumetricKG);

    originCosts = costs.pickup_fee_usd + costs.export_customs_usd;
    oceanTotal = costs.freight_per_kg_usd * chargeableKG;
    insurance = (goodsValue + oceanTotal) * costs.marine_insurance_pct;

    // Air still needs customs clearance, but no THC/ISF
    usDestFlat =
      costs.us_customs_clearance_usd +
      costs.customs_bond_usd +
      costs.delivery_fee_usd;

    // Tariffs still apply for air freight
    const fobValue = goodsValue;
    importDuty = fobValue * (costs.mfn_duty_pct + costs.section_301_duty_pct);
    mpf = Math.max(31.67, Math.min(614.35, fobValue * costs.mpf_pct));
    hmf = fobValue * costs.hmf_pct;
    totalTariffs = importDuty + mpf + hmf;

    usInland = 0; // delivery fee covers last mile
    otherCosts =
      goodsValue * costs.currency_exchange_fee_pct +
      costs.bank_wire_fee_usd +
      costs.miscellaneous_usd;
  } else {
    // ── Ocean Mode (FCL / LCL) ───────────────────────────
    const cifValue = goodsValue + costs.china_inland_freight_usd + costs.ocean_freight_usd;

    originCosts =
      costs.factory_inspection_usd +
      costs.china_inland_freight_usd +
      costs.export_customs_usd +
      costs.china_thc_usd +
      costs.bl_doc_fee_usd +
      costs.origin_agent_fee_usd;

    oceanTotal = isLCL
      ? costs.ocean_freight_usd * totalCBM
      : costs.ocean_freight_usd +
        costs.bunker_surcharge_usd +
        costs.currency_adj_factor_usd +
        costs.peak_season_surcharge_usd;

    insurance = cifValue * costs.marine_insurance_pct;

    usDestFlat =
      costs.us_thc_usd +
      costs.us_customs_clearance_usd +
      costs.isf_filing_fee_usd +
      costs.customs_bond_usd;

    const fobValue = goodsValue;
    importDuty = fobValue * (costs.mfn_duty_pct + costs.section_301_duty_pct);
    mpf = Math.max(31.67, Math.min(614.35, fobValue * costs.mpf_pct));
    hmf = fobValue * costs.hmf_pct;
    totalTariffs = importDuty + mpf + hmf;

    usInland = costs.drayage_usd + costs.warehouse_unloading_usd;

    otherCosts =
      goodsValue * costs.currency_exchange_fee_pct +
      costs.bank_wire_fee_usd +
      costs.miscellaneous_usd;
  }

  // Grand total
  const grandTotal =
    goodsValue + originCosts + oceanTotal + insurance +
    usDestFlat + totalTariffs + usInland + otherCosts;

  // Per-item allocation (proportional to goods value)
  const itemResults: ItemResult[] = items.map(item => {
    const itemValue = item.unit_price_usd * item.quantity;
    const share = safeDivide(itemValue, goodsValue);
    const allocatedCosts = (grandTotal - goodsValue) * share;
    const totalItemLanded = itemValue + allocatedCosts;
    return {
      ...item,
      volume_cbm: (item.length_cm * item.width_cm * item.height_cm / 1_000_000) * item.quantity,
      total_landed_usd: totalItemLanded,
      landed_per_unit_usd: safeDivide(totalItemLanded, item.quantity),
      overhead_per_unit_usd: safeDivide(allocatedCosts, item.quantity),
      share_pct: share,
    };
  });

  const breakdown: CostBreakdown = {
    goods_value_pct: safeDivide(goodsValue, grandTotal),
    origin_pct: safeDivide(originCosts, grandTotal),
    ocean_pct: safeDivide(oceanTotal, grandTotal),
    insurance_pct: safeDivide(insurance, grandTotal),
    tariffs_pct: safeDivide(totalTariffs, grandTotal),
    us_dest_pct: safeDivide(usDestFlat, grandTotal),
    inland_pct: safeDivide(usInland, grandTotal),
    other_pct: safeDivide(otherCosts, grandTotal),
  };

  return {
    goods_value: goodsValue,
    total_cbm: totalCBM,
    total_kg: totalKG,
    fill_volume_pct: fillVolumePct,
    fill_weight_pct: fillWeightPct,
    origin_costs: originCosts,
    ocean_total: oceanTotal,
    insurance,
    us_dest_flat: usDestFlat,
    total_tariffs: totalTariffs,
    import_duty: importDuty,
    mpf,
    hmf,
    us_inland: usInland,
    other_costs: otherCosts,
    grand_total: grandTotal,
    cost_per_cbm: safeDivide(grandTotal, totalCBM),
    cost_per_kg: safeDivide(grandTotal, totalKG),
    avg_landed_per_unit: safeDivide(grandTotal, items.reduce((s, i) => s + i.quantity, 0)),
    item_results: itemResults,
    breakdown,
  };
}

// ============================================================
// LandedCost SaaS – Core Type Definitions
// ============================================================

/** Supported shipping mode types */
export type ContainerType = '20ST' | '40ST' | '40HQ' | '20RF' | '40RF' | 'LCL' | 'FAST_DDP' | 'SEA_DDP' | 'AIR';

/** Physical & cost spec for a single shipping mode */
export interface ContainerSpec {
  label: string;
  volume_cbm: number | null;
  max_weight_kg: number | null;
  dims: string;
  typical_freight_usd: number;
  mode: 'ocean' | 'ddp' | 'air';
}

// ── Shipment Item ──────────────────────────────────────────

export interface ShipmentItem {
  id: string;
  shipment_id?: string;
  sku?: string;
  product_name: string;
  hs_code?: string;
  unit_price_usd: number;
  quantity: number;
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  source_url?: string;
  image_url?: string;
  sort_order?: number;
}

// ── Shipment Costs (mirrors DB shipment_costs columns) ─────

export interface ShipmentCosts {
  // China Origin
  factory_inspection_usd: number;
  china_inland_freight_usd: number;
  export_customs_usd: number;
  china_thc_usd: number;
  bl_doc_fee_usd: number;
  origin_agent_fee_usd: number;
  // Ocean Freight
  ocean_freight_usd: number;
  bunker_surcharge_usd: number;
  currency_adj_factor_usd: number;
  peak_season_surcharge_usd: number;
  // Insurance
  marine_insurance_pct: number;
  // US Destination
  us_thc_usd: number;
  us_customs_clearance_usd: number;
  isf_filing_fee_usd: number;
  customs_bond_usd: number;
  // Tariffs
  mfn_duty_pct: number;
  section_301_duty_pct: number;
  mpf_pct: number;
  hmf_pct: number;
  // US Inland
  drayage_usd: number;
  warehouse_unloading_usd: number;
  // Other
  currency_exchange_fee_pct: number;
  bank_wire_fee_usd: number;
  miscellaneous_usd: number;
  // DDP / Air per-kg rate
  freight_per_kg_usd: number;
  pickup_fee_usd: number;
  delivery_fee_usd: number;
}

// ── Item-level result ──────────────────────────────────────

export interface ItemResult extends ShipmentItem {
  volume_cbm: number;
  total_landed_usd: number;
  landed_per_unit_usd: number;
  overhead_per_unit_usd: number;
  share_pct: number;
}

// ── Cost Breakdown (percentage of total) ───────────────────

export interface CostBreakdown {
  goods_value_pct: number;
  origin_pct: number;
  ocean_pct: number;
  insurance_pct: number;
  tariffs_pct: number;
  us_dest_pct: number;
  inland_pct: number;
  other_pct: number;
}

// ── Calculation Result ────────────────────────────────────

export interface CalculationResult {
  goods_value: number;
  total_cbm: number;
  total_kg: number;
  fill_volume_pct: number | null;
  fill_weight_pct: number | null;
  origin_costs: number;
  ocean_total: number;
  insurance: number;
  us_dest_flat: number;
  total_tariffs: number;
  import_duty: number;
  mpf: number;
  hmf: number;
  us_inland: number;
  other_costs: number;
  grand_total: number;
  cost_per_cbm: number;
  cost_per_kg: number;
  avg_landed_per_unit: number;
  item_results: ItemResult[];
  breakdown: CostBreakdown;
}

// ── Shipment ─────────────────────────────────────────────

export type ShipmentStatus = 'draft' | 'confirmed' | 'archived';

export interface Shipment {
  id: string;
  user_id: string;
  name: string;
  status: ShipmentStatus;
  container_type: ContainerType;
  origin_port: string;
  destination_port: string;
  shipping_date?: string;
  share_token: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ── User Profile ────────────────────────────────────────

export interface Profile {
  id: string;
  company_name?: string;
  email?: string;
  default_markup_pct: number;
}

// ── HS Tariff Rate ──────────────────────────────────────

export interface HsTariffRate {
  hs_code: string;
  description: string;
  mfn_duty_pct: number;
  section_301_pct: number;
  notes?: string;
}

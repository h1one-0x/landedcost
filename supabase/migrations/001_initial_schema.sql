-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  company_name TEXT,
  email TEXT,
  default_markup_pct NUMERIC DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shipment sessions
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  container_type TEXT NOT NULL,
  origin_port TEXT DEFAULT 'Shanghai',
  destination_port TEXT DEFAULT 'Los Angeles',
  shipping_date DATE,
  share_token UUID DEFAULT gen_random_uuid(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products inside a shipment
CREATE TABLE shipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments ON DELETE CASCADE,
  sku TEXT,
  product_name TEXT NOT NULL,
  hs_code TEXT,
  unit_price_usd NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC NOT NULL,
  length_cm NUMERIC NOT NULL,
  width_cm NUMERIC NOT NULL,
  height_cm NUMERIC NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- All cost inputs for a shipment
CREATE TABLE shipment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments ON DELETE CASCADE UNIQUE,
  factory_inspection_usd NUMERIC DEFAULT 300,
  china_inland_freight_usd NUMERIC DEFAULT 300,
  export_customs_usd NUMERIC DEFAULT 100,
  china_thc_usd NUMERIC DEFAULT 100,
  bl_doc_fee_usd NUMERIC DEFAULT 75,
  origin_agent_fee_usd NUMERIC DEFAULT 150,
  ocean_freight_usd NUMERIC DEFAULT 2500,
  bunker_surcharge_usd NUMERIC DEFAULT 0,
  currency_adj_factor_usd NUMERIC DEFAULT 0,
  peak_season_surcharge_usd NUMERIC DEFAULT 0,
  marine_insurance_pct NUMERIC DEFAULT 0.004,
  us_thc_usd NUMERIC DEFAULT 450,
  us_customs_clearance_usd NUMERIC DEFAULT 225,
  isf_filing_fee_usd NUMERIC DEFAULT 55,
  customs_bond_usd NUMERIC DEFAULT 100,
  mfn_duty_pct NUMERIC DEFAULT 0,
  section_301_duty_pct NUMERIC DEFAULT 0.25,
  mpf_pct NUMERIC DEFAULT 0.003464,
  hmf_pct NUMERIC DEFAULT 0.00125,
  drayage_usd NUMERIC DEFAULT 500,
  warehouse_unloading_usd NUMERIC DEFAULT 350,
  currency_exchange_fee_pct NUMERIC DEFAULT 0.01,
  bank_wire_fee_usd NUMERIC DEFAULT 35,
  miscellaneous_usd NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cached calculation results
CREATE TABLE shipment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments ON DELETE CASCADE UNIQUE,
  total_goods_value_usd NUMERIC,
  total_weight_kg NUMERIC,
  total_volume_cbm NUMERIC,
  fill_volume_pct NUMERIC,
  fill_weight_pct NUMERIC,
  total_origin_costs_usd NUMERIC,
  total_ocean_usd NUMERIC,
  total_insurance_usd NUMERIC,
  total_us_destination_usd NUMERIC,
  total_tariffs_usd NUMERIC,
  total_us_inland_usd NUMERIC,
  total_other_usd NUMERIC,
  grand_total_usd NUMERIC,
  cost_per_cbm_usd NUMERIC,
  avg_landed_cost_per_unit NUMERIC,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- HS Code tariff reference
CREATE TABLE hs_tariff_rates (
  hs_code TEXT PRIMARY KEY,
  description TEXT,
  mfn_duty_pct NUMERIC DEFAULT 0,
  section_301_pct NUMERIC DEFAULT 0.25,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shipments_user_id ON shipments(user_id);
CREATE INDEX idx_shipments_share_token ON shipments(share_token);
CREATE INDEX idx_shipment_items_shipment_id ON shipment_items(shipment_id);
CREATE INDEX idx_shipment_costs_shipment_id ON shipment_costs(shipment_id);
CREATE INDEX idx_shipment_results_shipment_id ON shipment_results(shipment_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shipment_costs_updated_at BEFORE UPDATE ON shipment_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

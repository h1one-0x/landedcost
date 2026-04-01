-- Add new cost columns for DDP and Air freight modes
ALTER TABLE shipment_costs
  ADD COLUMN IF NOT EXISTS freight_per_kg_usd NUMERIC DEFAULT 5,
  ADD COLUMN IF NOT EXISTS pickup_fee_usd NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS delivery_fee_usd NUMERIC DEFAULT 50;

-- Add cost_per_kg to results
ALTER TABLE shipment_results
  ADD COLUMN IF NOT EXISTS cost_per_kg_usd NUMERIC;

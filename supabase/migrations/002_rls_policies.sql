-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_results ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Shipments: users own their shipments
CREATE POLICY "Users own their shipments" ON shipments FOR ALL USING (auth.uid() = user_id);
-- NOTE: Share token access is handled server-side (createServerClient bypasses RLS).
-- No public SELECT policy needed — all client-side access requires ownership.

-- Shipment items: access through shipment ownership
CREATE POLICY "Users can manage their shipment items" ON shipment_items FOR ALL
  USING (EXISTS (SELECT 1 FROM shipments WHERE shipments.id = shipment_items.shipment_id AND shipments.user_id = auth.uid()));

-- Shipment costs: access through shipment ownership
CREATE POLICY "Users can manage their shipment costs" ON shipment_costs FOR ALL
  USING (EXISTS (SELECT 1 FROM shipments WHERE shipments.id = shipment_costs.shipment_id AND shipments.user_id = auth.uid()));

-- Shipment results: access through shipment ownership
CREATE POLICY "Users can manage their shipment results" ON shipment_results FOR ALL
  USING (EXISTS (SELECT 1 FROM shipments WHERE shipments.id = shipment_results.shipment_id AND shipments.user_id = auth.uid()));

-- HS tariff rates: public read-only
ALTER TABLE hs_tariff_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HS tariff rates are public" ON hs_tariff_rates FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

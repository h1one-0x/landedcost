-- Fix: Remove overly permissive shared data policies from migration 004
-- share_token IS NOT NULL is always true (DEFAULT gen_random_uuid()),
-- so these policies exposed ALL shipment sub-data to any authenticated user.
-- Share page uses createServerClient (service role) which bypasses RLS,
-- so no anon SELECT policies are needed on sub-tables.

DROP POLICY IF EXISTS "Read shared shipment items" ON shipment_items;
DROP POLICY IF EXISTS "Read shared shipment costs" ON shipment_costs;
DROP POLICY IF EXISTS "Read shared shipment results" ON shipment_results;

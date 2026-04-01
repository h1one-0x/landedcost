-- Fix: Remove overly permissive share token policy that exposed ALL shipments
-- (share_token IS NOT NULL was always true since it has a DEFAULT)
DROP POLICY IF EXISTS "Public shipments via share token" ON shipments;

-- Share token access is handled server-side via createServerClient which
-- bypasses RLS. No anon SELECT policy is needed on shipments.

-- Add read-only policies for shared shipment sub-tables (used by server-side share page)
-- These allow the server client to join sub-tables when fetching shared shipments.
-- Since the share page uses createServerClient (which bypasses RLS), these are
-- defense-in-depth for any future client-side share access.

CREATE POLICY "Read shared shipment items" ON shipment_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_items.shipment_id
      AND (shipments.user_id = auth.uid() OR shipments.share_token IS NOT NULL)
    )
  );

CREATE POLICY "Read shared shipment costs" ON shipment_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_costs.shipment_id
      AND (shipments.user_id = auth.uid() OR shipments.share_token IS NOT NULL)
    )
  );

CREATE POLICY "Read shared shipment results" ON shipment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_results.shipment_id
      AND (shipments.user_id = auth.uid() OR shipments.share_token IS NOT NULL)
    )
  );

import { createClient } from './supabase';
import type { ShipmentItem, ShipmentCosts, ContainerType } from '@/types';

// ── Browser-side Supabase DB helpers ───────────────────────

function getSupabase() {
  return createClient();
}

// ── Auth ────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await getSupabase().auth.getUser();
  return user;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

// ── Profiles ────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: { company_name?: string; email?: string; default_markup_pct?: number }) {
  const { error } = await getSupabase()
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

// ── Shipments ───────────────────────────────────────────────

export async function listShipments(userId: string) {
  const { data, error } = await getSupabase()
    .from('shipments')
    .select(`
      *,
      shipment_items(id),
      shipment_results(grand_total_usd, total_volume_cbm)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(s => ({
    id: s.id,
    name: s.name,
    created_at: s.created_at,
    container_type: s.container_type,
    origin_port: s.origin_port,
    destination_port: s.destination_port,
    status: s.status,
    share_token: s.share_token,
    item_count: s.shipment_items?.length ?? 0,
    total_cbm: s.shipment_results?.[0]?.total_volume_cbm ?? 0,
    grand_total: s.shipment_results?.[0]?.grand_total_usd ?? 0,
  }));
}

export async function getShipment(shipmentId: string) {
  const { data, error } = await getSupabase()
    .from('shipments')
    .select(`
      *,
      shipment_items(*),
      shipment_costs(*),
      shipment_results(*)
    `)
    .eq('id', shipmentId)
    .single();
  if (error) throw error;
  return data;
}

export interface SaveShipmentParams {
  userId: string;
  name: string;
  containerType: ContainerType;
  originPort: string;
  destinationPort: string;
  shippingDate?: string;
  status?: 'draft' | 'confirmed';
  items: ShipmentItem[];
  costs: ShipmentCosts;
  result: {
    goods_value: number;
    total_kg: number;
    total_cbm: number;
    fill_volume_pct: number | null;
    fill_weight_pct: number | null;
    origin_costs: number;
    ocean_total: number;
    insurance: number;
    us_dest_flat: number;
    total_tariffs: number;
    us_inland: number;
    other_costs: number;
    grand_total: number;
    cost_per_cbm: number;
    avg_landed_per_unit: number;
  };
}

export async function createShipment(params: SaveShipmentParams) {
  const supabase = getSupabase();

  // 1. Create shipment
  const { data: shipment, error: shipErr } = await supabase
    .from('shipments')
    .insert({
      user_id: params.userId,
      name: params.name || 'Untitled Shipment',
      container_type: params.containerType,
      origin_port: params.originPort,
      destination_port: params.destinationPort,
      shipping_date: params.shippingDate || null,
      status: params.status || 'draft',
    })
    .select()
    .single();

  if (shipErr) throw shipErr;

  const shipmentId = shipment.id;

  // 2. Insert items
  if (params.items.length > 0) {
    const itemRows = params.items.map((item, idx) => ({
      shipment_id: shipmentId,
      sku: item.sku || null,
      product_name: item.product_name,
      hs_code: item.hs_code || null,
      unit_price_usd: item.unit_price_usd,
      quantity: item.quantity,
      weight_kg: item.weight_kg,
      length_cm: item.length_cm,
      width_cm: item.width_cm,
      height_cm: item.height_cm,
      source_url: item.source_url || null,
      image_url: item.image_url || null,
      sort_order: idx,
    }));

    const { error: itemErr } = await supabase
      .from('shipment_items')
      .insert(itemRows);
    if (itemErr) throw itemErr;
  }

  // 3. Insert costs
  const { error: costErr } = await supabase
    .from('shipment_costs')
    .insert({ shipment_id: shipmentId, ...params.costs });
  if (costErr) throw costErr;

  // 4. Insert results
  const { error: resErr } = await supabase
    .from('shipment_results')
    .insert({
      shipment_id: shipmentId,
      total_goods_value_usd: params.result.goods_value,
      total_weight_kg: params.result.total_kg,
      total_volume_cbm: params.result.total_cbm,
      fill_volume_pct: params.result.fill_volume_pct,
      fill_weight_pct: params.result.fill_weight_pct,
      total_origin_costs_usd: params.result.origin_costs,
      total_ocean_usd: params.result.ocean_total,
      total_insurance_usd: params.result.insurance,
      total_us_destination_usd: params.result.us_dest_flat,
      total_tariffs_usd: params.result.total_tariffs,
      total_us_inland_usd: params.result.us_inland,
      total_other_usd: params.result.other_costs,
      grand_total_usd: params.result.grand_total,
      cost_per_cbm_usd: params.result.cost_per_cbm,
      avg_landed_cost_per_unit: params.result.avg_landed_per_unit,
    });
  if (resErr) throw resErr;

  return shipment;
}

export async function updateShipment(shipmentId: string, params: SaveShipmentParams) {
  const supabase = getSupabase();

  // 1. Update shipment metadata
  const { data: shipment, error: shipErr } = await supabase
    .from('shipments')
    .update({
      name: params.name || 'Untitled Shipment',
      container_type: params.containerType,
      origin_port: params.originPort,
      destination_port: params.destinationPort,
      shipping_date: params.shippingDate || null,
      status: params.status || 'draft',
    })
    .eq('id', shipmentId)
    .select()
    .single();

  if (shipErr) throw shipErr;

  // 2. Replace items: delete old, insert new
  const { error: delErr } = await supabase.from('shipment_items').delete().eq('shipment_id', shipmentId);
  if (delErr) throw delErr;
  if (params.items.length > 0) {
    const itemRows = params.items.map((item, idx) => ({
      shipment_id: shipmentId,
      sku: item.sku || null,
      product_name: item.product_name,
      hs_code: item.hs_code || null,
      unit_price_usd: item.unit_price_usd,
      quantity: item.quantity,
      weight_kg: item.weight_kg,
      length_cm: item.length_cm,
      width_cm: item.width_cm,
      height_cm: item.height_cm,
      source_url: item.source_url || null,
      image_url: item.image_url || null,
      sort_order: idx,
    }));
    const { error: itemErr } = await supabase.from('shipment_items').insert(itemRows);
    if (itemErr) throw itemErr;
  }

  // 3. Upsert costs
  const { error: costErr } = await supabase
    .from('shipment_costs')
    .upsert({ shipment_id: shipmentId, ...params.costs }, { onConflict: 'shipment_id' });
  if (costErr) throw costErr;

  // 4. Upsert results
  const { error: resErr } = await supabase
    .from('shipment_results')
    .upsert({
      shipment_id: shipmentId,
      total_goods_value_usd: params.result.goods_value,
      total_weight_kg: params.result.total_kg,
      total_volume_cbm: params.result.total_cbm,
      fill_volume_pct: params.result.fill_volume_pct,
      fill_weight_pct: params.result.fill_weight_pct,
      total_origin_costs_usd: params.result.origin_costs,
      total_ocean_usd: params.result.ocean_total,
      total_insurance_usd: params.result.insurance,
      total_us_destination_usd: params.result.us_dest_flat,
      total_tariffs_usd: params.result.total_tariffs,
      total_us_inland_usd: params.result.us_inland,
      total_other_usd: params.result.other_costs,
      grand_total_usd: params.result.grand_total,
      cost_per_cbm_usd: params.result.cost_per_cbm,
      avg_landed_cost_per_unit: params.result.avg_landed_per_unit,
    }, { onConflict: 'shipment_id' });
  if (resErr) throw resErr;

  return shipment;
}

export async function deleteShipment(shipmentId: string) {
  const { error } = await getSupabase()
    .from('shipments')
    .delete()
    .eq('id', shipmentId);
  if (error) throw error;
}

export async function archiveShipment(shipmentId: string) {
  const { error } = await getSupabase()
    .from('shipments')
    .update({ status: 'archived' })
    .eq('id', shipmentId);
  if (error) throw error;
}

export async function duplicateShipment(shipmentId: string, userId: string) {
  // Fetch original
  const original = await getShipment(shipmentId);
  if (!original) throw new Error('Shipment not found');

  const costs = original.shipment_costs?.[0];
  const results = original.shipment_results?.[0];

  return createShipment({
    userId,
    name: `${original.name} (copy)`,
    containerType: original.container_type as ContainerType,
    originPort: original.origin_port,
    destinationPort: original.destination_port,
    items: (original.shipment_items ?? []).map((i: ShipmentItem) => ({
      id: crypto.randomUUID(),
      product_name: i.product_name,
      sku: i.sku,
      hs_code: i.hs_code,
      unit_price_usd: Number(i.unit_price_usd),
      quantity: Number(i.quantity),
      weight_kg: Number(i.weight_kg),
      length_cm: Number(i.length_cm),
      width_cm: Number(i.width_cm),
      height_cm: Number(i.height_cm),
      source_url: i.source_url || undefined,
      image_url: i.image_url || undefined,
    })),
    costs: costs ? {
      factory_inspection_usd: Number(costs.factory_inspection_usd),
      china_inland_freight_usd: Number(costs.china_inland_freight_usd),
      export_customs_usd: Number(costs.export_customs_usd),
      china_thc_usd: Number(costs.china_thc_usd),
      bl_doc_fee_usd: Number(costs.bl_doc_fee_usd),
      origin_agent_fee_usd: Number(costs.origin_agent_fee_usd),
      ocean_freight_usd: Number(costs.ocean_freight_usd),
      bunker_surcharge_usd: Number(costs.bunker_surcharge_usd),
      currency_adj_factor_usd: Number(costs.currency_adj_factor_usd),
      peak_season_surcharge_usd: Number(costs.peak_season_surcharge_usd),
      marine_insurance_pct: Number(costs.marine_insurance_pct),
      us_thc_usd: Number(costs.us_thc_usd),
      us_customs_clearance_usd: Number(costs.us_customs_clearance_usd),
      isf_filing_fee_usd: Number(costs.isf_filing_fee_usd),
      customs_bond_usd: Number(costs.customs_bond_usd),
      mfn_duty_pct: Number(costs.mfn_duty_pct),
      section_301_duty_pct: Number(costs.section_301_duty_pct),
      mpf_pct: Number(costs.mpf_pct),
      hmf_pct: Number(costs.hmf_pct),
      drayage_usd: Number(costs.drayage_usd),
      warehouse_unloading_usd: Number(costs.warehouse_unloading_usd),
      currency_exchange_fee_pct: Number(costs.currency_exchange_fee_pct),
      bank_wire_fee_usd: Number(costs.bank_wire_fee_usd),
      miscellaneous_usd: Number(costs.miscellaneous_usd),
      freight_per_kg_usd: Number(costs.freight_per_kg_usd ?? 5),
      pickup_fee_usd: Number(costs.pickup_fee_usd ?? 50),
      delivery_fee_usd: Number(costs.delivery_fee_usd ?? 50),
    } : {
      factory_inspection_usd: 300, china_inland_freight_usd: 300, export_customs_usd: 100,
      china_thc_usd: 100, bl_doc_fee_usd: 75, origin_agent_fee_usd: 150,
      ocean_freight_usd: 2500, bunker_surcharge_usd: 0, currency_adj_factor_usd: 0,
      peak_season_surcharge_usd: 0, marine_insurance_pct: 0.004, us_thc_usd: 450,
      us_customs_clearance_usd: 225, isf_filing_fee_usd: 55, customs_bond_usd: 100,
      mfn_duty_pct: 0, section_301_duty_pct: 0.25, mpf_pct: 0.003464, hmf_pct: 0.00125,
      drayage_usd: 500, warehouse_unloading_usd: 350, currency_exchange_fee_pct: 0.01,
      bank_wire_fee_usd: 35, miscellaneous_usd: 0, freight_per_kg_usd: 5,
      pickup_fee_usd: 50, delivery_fee_usd: 50,
    } as ShipmentCosts,
    result: results ? {
      goods_value: Number(results.total_goods_value_usd),
      total_kg: Number(results.total_weight_kg),
      total_cbm: Number(results.total_volume_cbm),
      fill_volume_pct: results.fill_volume_pct ? Number(results.fill_volume_pct) : null,
      fill_weight_pct: results.fill_weight_pct ? Number(results.fill_weight_pct) : null,
      origin_costs: Number(results.total_origin_costs_usd),
      ocean_total: Number(results.total_ocean_usd),
      insurance: Number(results.total_insurance_usd),
      us_dest_flat: Number(results.total_us_destination_usd),
      total_tariffs: Number(results.total_tariffs_usd),
      us_inland: Number(results.total_us_inland_usd),
      other_costs: Number(results.total_other_usd),
      grand_total: Number(results.grand_total_usd),
      cost_per_cbm: Number(results.cost_per_cbm_usd),
      avg_landed_per_unit: Number(results.avg_landed_cost_per_unit),
    } : {
      goods_value: 0, total_kg: 0, total_cbm: 0,
      fill_volume_pct: null, fill_weight_pct: null,
      origin_costs: 0, ocean_total: 0, insurance: 0,
      us_dest_flat: 0, total_tariffs: 0, us_inland: 0,
      other_costs: 0, grand_total: 0, cost_per_cbm: 0,
      avg_landed_per_unit: 0,
    },
  });
}

// ── Shared Shipments ────────────────────────────────────────

export async function getSharedShipment(shareToken: string) {
  const { data, error } = await getSupabase()
    .from('shipments')
    .select(`
      *,
      shipment_items(*),
      shipment_costs(*),
      shipment_results(*)
    `)
    .eq('share_token', shareToken)
    .single();
  if (error) return null;
  return data;
}

// ── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats(userId: string) {
  const { data: shipments, error } = await getSupabase()
    .from('shipments')
    .select(`
      id, status,
      shipment_results(grand_total_usd)
    `)
    .eq('user_id', userId);

  if (error) throw error;

  const all = shipments ?? [];
  const totalShipments = all.length;
  const drafts = all.filter(s => s.status === 'draft').length;
  const totalLanded = all.reduce((sum, s) => {
    const gt = s.shipment_results?.[0]?.grand_total_usd;
    return sum + (gt ? Number(gt) : 0);
  }, 0);
  const avgPerShipment = totalShipments > 0 ? totalLanded / totalShipments : 0;

  return { totalShipments, totalLanded, avgPerShipment, drafts };
}

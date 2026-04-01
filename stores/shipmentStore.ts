import { create } from 'zustand';
import type { ShipmentItem, ShipmentCosts, ContainerType } from '@/types';

// ── Default Cost Values (match DB schema defaults) ───────

export const DEFAULT_COSTS: ShipmentCosts = {
  // China Origin
  factory_inspection_usd: 300,
  china_inland_freight_usd: 300,
  export_customs_usd: 100,
  china_thc_usd: 100,
  bl_doc_fee_usd: 75,
  origin_agent_fee_usd: 150,
  // Ocean Freight
  ocean_freight_usd: 2500,
  bunker_surcharge_usd: 0,
  currency_adj_factor_usd: 0,
  peak_season_surcharge_usd: 0,
  // Insurance
  marine_insurance_pct: 0.004,
  // US Destination
  us_thc_usd: 450,
  us_customs_clearance_usd: 225,
  isf_filing_fee_usd: 55,
  customs_bond_usd: 100,
  // Tariffs
  mfn_duty_pct: 0,
  section_301_duty_pct: 0.25,
  mpf_pct: 0.003464,
  hmf_pct: 0.00125,
  // US Inland
  drayage_usd: 500,
  warehouse_unloading_usd: 350,
  // Other
  currency_exchange_fee_pct: 0.01,
  bank_wire_fee_usd: 35,
  miscellaneous_usd: 0,
  // DDP / Air per-kg
  freight_per_kg_usd: 5,
  pickup_fee_usd: 50,
  delivery_fee_usd: 50,
};

export interface ShipmentState {
  items: ShipmentItem[];
  costs: ShipmentCosts;
  containerType: ContainerType;
  shipmentName: string;
  originPort: string;
  destinationPort: string;
  notes: string;
  status: 'draft' | 'confirmed' | 'archived';

  setItems: (items: ShipmentItem[]) => void;
  addItem: (item: ShipmentItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShipmentItem>) => void;

  setCosts: (costs: ShipmentCosts) => void;
  updateCost: <K extends keyof ShipmentCosts>(key: K, value: ShipmentCosts[K]) => void;

  setContainerType: (type: ContainerType) => void;
  setShipmentName: (name: string) => void;
  setOriginPort: (port: string) => void;
  setDestinationPort: (port: string) => void;
  setNotes: (notes: string) => void;
  setStatus: (status: 'draft' | 'confirmed' | 'archived') => void;

  reset: () => void;
}

const INITIAL_STATE = {
  items: [] as ShipmentItem[],
  costs: { ...DEFAULT_COSTS },
  containerType: '40HQ' as ContainerType,
  shipmentName: '',
  originPort: 'Shanghai',
  destinationPort: 'Los Angeles',
  notes: '',
  status: 'draft' as const,
};

export const useShipmentStore = create<ShipmentState>((set) => ({
  ...INITIAL_STATE,

  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateItem: (id, updates) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)) })),

  setCosts: (costs) => set({ costs }),
  updateCost: (key, value) => set((s) => ({ costs: { ...s.costs, [key]: value } })),

  setContainerType: (containerType) => set({ containerType }),
  setShipmentName: (shipmentName) => set({ shipmentName }),
  setOriginPort: (originPort) => set({ originPort }),
  setDestinationPort: (destinationPort) => set({ destinationPort }),
  setNotes: (notes) => set({ notes }),
  setStatus: (status) => set({ status }),

  reset: () => set({ ...INITIAL_STATE, costs: { ...DEFAULT_COSTS } }),
}));

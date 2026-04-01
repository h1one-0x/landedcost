// ============================================================
// LandedCost SaaS – Shipping Mode Specifications
// ============================================================

import type { ContainerSpec } from '@/types';

export const CONTAINERS = {
  '20ST': {
    label: "20' Standard",
    volume_cbm: 25.4,
    max_weight_kg: 21_700,
    dims: '5.89 × 2.35 × 2.36 m',
    typical_freight_usd: 1_500,
    mode: 'ocean' as const,
  },
  '40ST': {
    label: "40' Standard",
    volume_cbm: 67.6,
    max_weight_kg: 26_500,
    dims: '12.03 × 2.35 × 2.36 m',
    typical_freight_usd: 2_500,
    mode: 'ocean' as const,
  },
  '40HQ': {
    label: "40' High Cube",
    volume_cbm: 76.3,
    max_weight_kg: 26_460,
    dims: '12.03 × 2.35 × 2.69 m',
    typical_freight_usd: 2_700,
    mode: 'ocean' as const,
  },
  '20RF': {
    label: "20' Reefer",
    volume_cbm: 24.8,
    max_weight_kg: 21_600,
    dims: '5.44 × 2.27 × 2.25 m',
    typical_freight_usd: 3_500,
    mode: 'ocean' as const,
  },
  '40RF': {
    label: "40' Reefer",
    volume_cbm: 59.5,
    max_weight_kg: 26_460,
    dims: '11.56 × 2.27 × 2.25 m',
    typical_freight_usd: 5_500,
    mode: 'ocean' as const,
  },
  'LCL': {
    label: 'LCL (per CBM)',
    volume_cbm: null,
    max_weight_kg: null,
    dims: 'Rate charged per m³',
    typical_freight_usd: 65,
    mode: 'ocean' as const,
  },
  'FAST_DDP': {
    label: 'Fast DDP (per kg)',
    volume_cbm: null,
    max_weight_kg: null,
    dims: 'Express courier, duties included',
    typical_freight_usd: 8,
    mode: 'ddp' as const,
  },
  'SEA_DDP': {
    label: 'Sea DDP (per kg)',
    volume_cbm: null,
    max_weight_kg: null,
    dims: 'Sea freight, duties included',
    typical_freight_usd: 3,
    mode: 'ddp' as const,
  },
  'AIR': {
    label: 'Air Freight (per kg)',
    volume_cbm: null,
    max_weight_kg: null,
    dims: 'Air cargo, per kg rate',
    typical_freight_usd: 5,
    mode: 'air' as const,
  },
} as const;

import type { ContainerType } from '@/types';

/** All valid container type keys */
export const CONTAINER_TYPES = Object.keys(CONTAINERS) as ContainerType[];

/** Grouped for UI display */
export const SHIPPING_MODE_GROUPS = [
  {
    label: 'Ocean FCL',
    types: ['20ST', '40ST', '40HQ', '20RF', '40RF'] as ContainerType[],
  },
  {
    label: 'Ocean LCL',
    types: ['LCL'] as ContainerType[],
  },
  {
    label: 'DDP (Door-to-Door, Duties Paid)',
    types: ['FAST_DDP', 'SEA_DDP'] as ContainerType[],
  },
  {
    label: 'Air Freight',
    types: ['AIR'] as ContainerType[],
  },
];

/**
 * Look up the specification for a given container type.
 */
export function getContainer(type: ContainerType): ContainerSpec {
  return CONTAINERS[type] as ContainerSpec;
}

/** Check if this shipping mode is DDP (duties included in rate) */
export function isDDP(type: ContainerType): boolean {
  return CONTAINERS[type].mode === 'ddp';
}

/** Check if this shipping mode is priced per kg */
export function isPerKg(type: ContainerType): boolean {
  const mode = CONTAINERS[type].mode;
  return mode === 'ddp' || mode === 'air';
}

/** Get the shipping mode category */
export function getShippingMode(type: ContainerType): 'ocean' | 'ddp' | 'air' {
  return CONTAINERS[type].mode;
}

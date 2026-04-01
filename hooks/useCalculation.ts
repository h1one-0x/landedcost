'use client';

import { useState, useEffect, useRef } from 'react';
import { useShipmentStore } from '@/stores/shipmentStore';
import { getContainer, getShippingMode } from '@/lib/containers';
import { calculateLandedCost } from '@/lib/calculator';
import type { CalculationResult } from '@/types';

const DEBOUNCE_MS = 300;

/**
 * Reactively calculates landed cost whenever items, costs, or
 * container type change. Supports ocean, DDP, and air modes.
 */
export function useCalculation(): CalculationResult | null {
  const items = useShipmentStore((s) => s.items);
  const costs = useShipmentStore((s) => s.costs);
  const containerType = useShipmentStore((s) => s.containerType);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const container = getContainer(containerType);
      const isLCL = containerType === 'LCL';
      const mode = getShippingMode(containerType);

      if (items.length === 0) {
        const calc = calculateLandedCost([], costs, container, mode, isLCL);
        const hasAnyCost = calc.grand_total > 0;
        setResult(hasAnyCost ? calc : null);
      } else {
        const calc = calculateLandedCost(items, costs, container, mode, isLCL);
        setResult(calc);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, costs, containerType]);

  return result;
}

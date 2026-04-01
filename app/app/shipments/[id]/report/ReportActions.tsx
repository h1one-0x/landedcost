"use client";

import { Printer, FileSpreadsheet, FileDown } from "lucide-react";
import { exportToXlsx, exportToCsv } from "@/lib/export";
import type { ShipmentCosts, CalculationResult, ContainerType } from "@/types";

interface ReportActionsProps {
  shipmentId: string;
  shipmentName: string;
  containerType: ContainerType;
  originPort: string;
  destinationPort: string;
  shippingDate?: string;
  costs: ShipmentCosts;
  result: CalculationResult;
}

export default function ReportActions({
  shipmentId,
  shipmentName,
  containerType,
  originPort,
  destinationPort,
  shippingDate,
  costs,
  result,
}: ReportActionsProps) {
  const exportData = {
    shipmentName,
    containerType,
    originPort,
    destinationPort,
    shippingDate,
    costs,
    result,
  };

  return (
    <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-surface px-6 py-3">
      <div className="flex items-center gap-2 text-sm">
        <a
          href={`/app/new-shipment?load=${shipmentId}`}
          className="text-text-secondary hover:text-text-primary"
        >
          &larr; Back to Shipment
        </a>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </button>
        <button
          type="button"
          onClick={() => exportToXlsx(exportData)}
          className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Export XLSX
        </button>
        <button
          type="button"
          onClick={() => exportToCsv(exportData)}
          className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
        >
          <FileDown className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>
    </div>
  );
}

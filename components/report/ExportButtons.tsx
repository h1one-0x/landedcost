"use client";

import { Download, FileText, FileSpreadsheet, Printer, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
  shipmentName?: string;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export default function ExportButtons({
  shipmentName,
  onExportPDF,
  onExportExcel,
}: ExportButtonsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg-base transition-opacity hover:opacity-90">
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => {
            if (onExportPDF) {
              onExportPDF();
            } else {
              alert("PDF export — coming soon");
            }
          }}
        >
          <FileText className="mr-2 h-4 w-4 text-red-400" />
          Download PDF Report
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            if (onExportExcel) {
              onExportExcel();
            } else {
              alert("Excel export — coming soon");
            }
          }}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-400" />
          Download Excel
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4 text-blue-400" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

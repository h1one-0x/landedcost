"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ColumnMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  mappings: Record<string, string>;
  data: Record<string, unknown>[];
  onConfirm: (mappings: Record<string, string>) => void;
}

interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
}

const TARGET_FIELDS: TargetFieldDef[] = [
  { key: "product_name", label: "Product Name", required: true },
  { key: "sku", label: "SKU", required: false },
  { key: "hs_code", label: "HS Code", required: false },
  { key: "unit_price_usd", label: "Unit Price (USD)", required: true },
  { key: "quantity", label: "Quantity", required: true },
  { key: "weight_kg", label: "Weight (kg)", required: false },
  { key: "dimensions_combined", label: "Dimensions LxWxH (combined)", required: false },
  { key: "length_cm", label: "Length (cm)", required: false },
  { key: "width_cm", label: "Width (cm)", required: false },
  { key: "height_cm", label: "Height (cm)", required: false },
  { key: "source_url", label: "Product Link / URL", required: false },
];

export function ColumnMappingDialog({
  isOpen,
  onClose,
  headers,
  mappings: initialMappings,
  data,
  onConfirm,
}: ColumnMappingDialogProps) {
  // Local mapping state: targetField -> sourceHeader
  const [localMappings, setLocalMappings] = useState<Record<string, string>>(
    () => ({ ...initialMappings })
  );

  // Reset local state when dialog opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setLocalMappings({ ...initialMappings });
    }
  }, [isOpen, initialMappings]);

  const handleFieldChange = useCallback(
    (targetKey: string, sourceHeader: string) => {
      setLocalMappings((prev) => {
        const next = { ...prev };
        if (sourceHeader === "") {
          delete next[targetKey];
        } else {
          next[targetKey] = sourceHeader;
        }
        return next;
      });
    },
    []
  );

  const allRequiredMapped = useMemo(() => {
    return TARGET_FIELDS.filter((f) => f.required).every(
      (f) => localMappings[f.key]
    );
  }, [localMappings]);

  const previewRows = data.slice(0, 5);

  const handleConfirm = useCallback(() => {
    onConfirm(localMappings);
  }, [localMappings, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Columns</DialogTitle>
          <DialogDescription>
            Match your spreadsheet columns to the required fields. Required
            fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>

        {/* Mapping rows */}
        <div className="space-y-3 my-4">
          {TARGET_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex items-center gap-3"
            >
              <div className="w-40 shrink-0 text-sm text-text-secondary">
                {field.label}
                {field.required && (
                  <span className="text-red-400 ml-0.5">*</span>
                )}
              </div>
              <div className="flex-1">
                <Select
                  value={localMappings[field.key] ?? ""}
                  onChange={(e) =>
                    handleFieldChange(field.key, e.target.value)
                  }
                  className="h-8 text-sm"
                >
                  <SelectOption value="">-- Select column --</SelectOption>
                  {headers.map((header) => (
                    <SelectOption key={header} value={header}>
                      {header}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>
          ))}
        </div>

        {/* Preview table */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Preview (first {previewRows.length} rows)
            </p>
            <div className="rounded-md border border-border-subtle overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-elevated">
                    {headers.map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-2 py-1.5 text-left font-medium text-text-muted whitespace-nowrap",
                          // Highlight mapped columns
                          Object.values(localMappings).includes(h) &&
                            "text-accent"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border-subtle last:border-0"
                    >
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="px-2 py-1 text-text-secondary whitespace-nowrap max-w-[150px] truncate"
                        >
                          {String(row[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!allRequiredMapped}
          >
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { parseExcelFile, parseCombinedDimension } from "@/lib/excel-parser";
import { ColumnMappingDialog } from "./ColumnMappingDialog";
import { Upload, Loader2, AlertTriangle } from "lucide-react";
import type { ShipmentItem } from "@/types";

interface FileUploadZoneProps {
  onImport: (items: ShipmentItem[]) => void;
}

const ACCEPT = ".xlsx,.xls,.csv";

/** Required fields that must be mapped for auto-import */
const REQUIRED_FIELDS = [
  "product_name",
  "unit_price_usd",
  "quantity",
];

export function FileUploadZone({ onImport }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Column mapping dialog state
  const [mappingOpen, setMappingOpen] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const buildItemsFromPartials = useCallback((partials: Partial<ShipmentItem>[]): ShipmentItem[] => {
    const items: ShipmentItem[] = partials
      .filter((p) => p.product_name && String(p.product_name).trim())
      .map((partial) => ({
        id: crypto.randomUUID(),
        product_name: String(partial.product_name ?? "Unnamed"),
        unit_price_usd: Number(partial.unit_price_usd) || 0,
        quantity: Number(partial.quantity) || 1,
        weight_kg: Number(partial.weight_kg) || 0,
        length_cm: Number(partial.length_cm) || 0,
        width_cm: Number(partial.width_cm) || 0,
        height_cm: Number(partial.height_cm) || 0,
        sku: partial.sku ? String(partial.sku) : undefined,
        hs_code: partial.hs_code ? String(partial.hs_code) : undefined,
        source_url: partial.source_url ? String(partial.source_url) : undefined,
      }));
    return items;
  }, []);

  const checkMissingFields = useCallback((items: ShipmentItem[]): string | null => {
    if (items.length === 0) return null;
    const missingWeight = items.every((i) => i.weight_kg === 0);
    const missingDims = items.every((i) => i.length_cm === 0 && i.width_cm === 0 && i.height_cm === 0);
    const parts: string[] = [];
    if (missingWeight) parts.push("weight");
    if (missingDims) parts.push("dimensions (L/W/H)");
    if (parts.length > 0) {
      return `Imported ${items.length} products. Please fill in ${parts.join(" and ")} manually in the table below.`;
    }
    return null;
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setNotice(null);
      setIsLoading(true);

      try {
        const buffer = await file.arrayBuffer();
        const result = parseExcelFile(buffer);

        if (result.rowCount === 0) {
          setError("No data rows found in the file.");
          setIsLoading(false);
          return;
        }

        // Extract headers from mappings
        const sourceHeaders = result.mappings.map((m) => m.sourceHeader).filter((h) => h.trim() !== "");

        // Build current auto-mapping: targetField -> sourceHeader
        const autoMap: Record<string, string> = {};
        for (const m of result.mappings) {
          if (m.targetField && m.sourceHeader.trim()) {
            autoMap[m.targetField] = m.sourceHeader;
          }
        }

        // Use raw row data from parser (preserves all original cell values)
        const rawRows = result.rawRows;

        // Check if all required fields are confidently mapped
        const allRequiredMapped = REQUIRED_FIELDS.every(
          (f) => autoMap[f] !== undefined
        );
        const highConfidence = result.mappings
          .filter((m) => m.targetField && REQUIRED_FIELDS.includes(m.targetField))
          .every((m) => m.confidence >= 0.6);

        if (allRequiredMapped && highConfidence) {
          // Auto-import directly
          const items = buildItemsFromPartials(result.items);
          if (items.length === 0) {
            setError("No valid product rows found. Make sure your file has product names.");
            setIsLoading(false);
            return;
          }
          onImport(items);
          setNotice(checkMissingFields(items));
        } else {
          // Open mapping dialog
          setHeaders(sourceHeaders);
          setMappings(autoMap);
          setRawData(rawRows);
          setMappingOpen(true);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to parse file. Please check the format."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onImport, buildItemsFromPartials, checkMissingFields]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile]
  );

  const handleMappingConfirm = useCallback(
    (confirmedMappings: Record<string, string>) => {
      // Re-map raw data using confirmed mappings
      // confirmedMappings: targetField -> sourceHeader
      const reverseMap: Record<string, string> = {};
      for (const [target, source] of Object.entries(confirmedMappings)) {
        reverseMap[source] = target;
      }

      const items: ShipmentItem[] = rawData
        .map((row) => {
          const item: Record<string, unknown> = {
            id: crypto.randomUUID(),
            product_name: "",
            unit_price_usd: 0,
            quantity: 1,
            weight_kg: 0,
            length_cm: 0,
            width_cm: 0,
            height_cm: 0,
          };

          for (const [source, target] of Object.entries(reverseMap)) {
            const val = row[source];

            // Handle combined dimension column (e.g. "40x30x20")
            if (target === "dimensions_combined") {
              const dims = parseCombinedDimension(String(val ?? ""));
              if (dims) {
                item.length_cm = dims[0];
                item.width_cm = dims[1];
                item.height_cm = dims[2];
              }
              continue;
            }

            const numericFields = [
              "unit_price_usd",
              "quantity",
              "weight_kg",
              "length_cm",
              "width_cm",
              "height_cm",
            ];
            if (numericFields.includes(target)) {
              const parsed = parseFloat(
                String(val ?? "0").replace(/[^0-9.\-]/g, "")
              );
              item[target] = isNaN(parsed) ? 0 : parsed;
            } else {
              const strVal = String(val ?? "").trim();
              if (strVal) item[target] = strVal;
            }
          }

          return item as unknown as ShipmentItem;
        })
        .filter((item) => item.product_name && item.product_name.trim() !== "");

      if (items.length === 0) {
        setError("No valid product rows found after mapping.");
        setMappingOpen(false);
        return;
      }

      onImport(items);
      setNotice(checkMissingFields(items));
      setMappingOpen(false);
    },
    [rawData, onImport, checkMissingFields]
  );

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-elevated px-6 py-10 cursor-pointer transition-colors",
          isDragOver
            ? "border-accent bg-accent/5"
            : "border-border-subtle hover:border-text-muted hover:bg-hover",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleInputChange}
          className="hidden"
        />

        {isLoading ? (
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        ) : (
          <Upload className="h-8 w-8 text-text-muted" />
        )}

        <div className="text-center">
          <p className="text-sm text-text-primary font-medium">
            {isLoading
              ? "Parsing file..."
              : "Drop your Excel file here or click to browse"}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Supports .xlsx, .xls, and .csv &mdash; any column layout
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>

      {notice && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 mt-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-300">{notice}</p>
        </div>
      )}

      <ColumnMappingDialog
        isOpen={mappingOpen}
        onClose={() => setMappingOpen(false)}
        headers={headers}
        mappings={mappings}
        data={rawData}
        onConfirm={handleMappingConfirm}
      />
    </>
  );
}

"use client";

import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type CellContext,
} from "@tanstack/react-table";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Sparkles, Search, ExternalLink, ImageIcon, Loader2 } from "lucide-react";
import type { ShipmentItem } from "@/types";
import { lookupHsCode, type HsLookupResult } from "@/lib/tariffs";
import type { HsTariffRate } from "@/types";

// ── Editable Cell ────────────────────────────────────────

interface EditableCellProps {
  value: string | number;
  onChange: (val: string) => void;
  type?: "text" | "number";
  align?: "left" | "right";
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  min?: number;
}

function EditableCell({
  value,
  onChange,
  type = "text",
  align = "left",
  placeholder,
  readOnly = false,
  required = false,
  min,
}: EditableCellProps) {
  // Keep local string state for numeric fields so intermediate values like "4." are preserved
  const [localValue, setLocalValue] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Sync from parent when not focused (e.g. after external update)
  useEffect(() => {
    if (!focused) {
      setLocalValue(String(value));
    }
  }, [value, focused]);

  const displayValue = focused ? localValue : value;

  const isInvalid =
    (required && (value === "" || value === undefined)) ||
    (type === "number" && min !== undefined && Number(value) < min);

  return (
    <input
      type="text"
      inputMode={type === "number" ? "decimal" : "text"}
      className={cn(
        "w-full bg-transparent border-0 outline-none text-sm text-text-primary px-2 py-1.5",
        "focus:bg-elevated focus:ring-1 focus:ring-accent/50 rounded transition-colors",
        type === "number" && "font-mono",
        align === "right" && "text-right",
        isInvalid && "ring-1 ring-red-500/50 bg-red-500/5",
        readOnly && "text-text-muted cursor-default"
      )}
      value={displayValue}
      onChange={(e) => {
        if (readOnly) return;
        const raw = e.target.value;
        if (type === "number") {
          // Allow digits, dots, commas, minus — replace comma with dot
          const cleaned = raw.replace(/,/g, ".").replace(/[^0-9.\-]/g, "");
          setLocalValue(cleaned);
          // Only commit parsed value if it's a complete number (not ending with dot)
          if (cleaned && !cleaned.endsWith(".") && !cleaned.endsWith("-")) {
            onChange(cleaned);
          }
        } else {
          setLocalValue(raw);
          onChange(raw);
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (type === "number") {
          // Commit final value on blur
          onChange(localValue);
        }
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      tabIndex={readOnly ? -1 : 0}
    />
  );
}

// ── HS Code Cell with keyword search ────────────────────

interface HsCodeCellProps {
  hsCode: string;
  productName: string;
  onHsCodeChange: (val: string) => void;
  onAutoApply: (entry: HsTariffRate) => void;
}

function HsCodeCell({ hsCode, productName, onHsCodeChange, onAutoApply }: HsCodeCellProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<HsTariffRate[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-suggest from product name
  const handleAutoDetect = useCallback(() => {
    if (!productName.trim()) return;
    // Extract meaningful keywords from product name (skip short/common words)
    const stopWords = new Set(['the', 'a', 'an', 'for', 'and', 'or', 'of', 'in', 'with', 'set', 'to', 'x', 'inch', 'cm', 'mm', 'pcs', 'pack']);
    const keywords = productName
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Try progressively fewer keywords until we get matches
    let result = lookupHsCode(keywords.slice(0, 3).join(' '), 8);
    if (result.matches.length === 0 && keywords.length > 1) {
      result = lookupHsCode(keywords.slice(0, 2).join(' '), 8);
    }
    if (result.matches.length === 0 && keywords.length > 0) {
      result = lookupHsCode(keywords[0], 8);
    }

    setSuggestions(result.matches);
    setShowSuggestions(result.matches.length > 0);
    if (result.matches.length === 0) {
      // No results from auto-detect, switch to search mode
      setSearchMode(true);
      setSearchQuery("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [productName]);

  // Search by keyword or HS code
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const result = lookupHsCode(query, 10);
      setSuggestions(result.matches);
      setShowSuggestions(result.matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  // Also search when user types in HS code field
  const handleHsInput = useCallback((val: string) => {
    onHsCodeChange(val);
    if (val.length >= 2) {
      const result = lookupHsCode(val, 5);
      setSuggestions(result.matches);
      setShowSuggestions(result.matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [onHsCodeChange]);

  const handleSelect = useCallback((entry: HsTariffRate) => {
    onAutoApply(entry);
    setShowSuggestions(false);
    setSearchMode(false);
    setSearchQuery("");
  }, [onAutoApply]);

  const openSearchMode = useCallback(() => {
    setSearchMode(true);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setSearchMode(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <input
          type="text"
          className="w-full bg-transparent border-0 outline-none text-sm text-text-primary px-2 py-1.5 focus:bg-elevated focus:ring-1 focus:ring-accent/50 rounded transition-colors font-mono"
          value={hsCode}
          onChange={(e) => handleHsInput(e.target.value)}
          placeholder="Search or enter code"
          onFocus={() => {
            if (hsCode.length >= 2) {
              const result = lookupHsCode(hsCode, 5);
              setSuggestions(result.matches);
              setShowSuggestions(result.matches.length > 0);
            }
          }}
        />
        {isValidHSCode(hsCode) && (
          <Badge variant="success" className="text-[10px] px-1.5 py-0 shrink-0">
            Valid
          </Badge>
        )}
        {!isValidHSCode(hsCode) && (
          <button
            type="button"
            onClick={productName.trim() ? handleAutoDetect : openSearchMode}
            className="p-1 rounded text-accent hover:bg-accent/10 transition-colors shrink-0"
            title={productName.trim() ? "Auto-detect HS code" : "Search HS codes"}
          >
            {productName.trim() ? <Sparkles className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Search mode input */}
      {searchMode && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-lg border border-border-subtle bg-surface shadow-xl shadow-black/30">
          <div className="px-3 py-2 border-b border-border-subtle">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
              placeholder="Search: wooden, curtain, cup..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchMode(false);
                  setShowSuggestions(false);
                }
              }}
            />
          </div>
          {suggestions.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((entry) => (
                <button
                  key={entry.hs_code}
                  type="button"
                  onClick={() => handleSelect(entry)}
                  className="w-full text-left px-3 py-2 hover:bg-hover transition-colors border-b border-border-subtle/50 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-accent font-medium">
                      {entry.hs_code}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      MFN {(entry.mfn_duty_pct * 100).toFixed(1)}%
                      {entry.section_301_pct > 0 && ` + 301: ${(entry.section_301_pct * 100).toFixed(1)}%`}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {entry.description}
                  </p>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="px-3 py-4 text-center text-xs text-text-muted">
              No matching HS codes found for &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-xs text-text-muted">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}

      {/* Suggestions dropdown (from direct HS input or auto-detect) */}
      {!searchMode && showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 max-h-60 overflow-y-auto rounded-lg border border-border-subtle bg-surface shadow-xl shadow-black/30">
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Suggested HS Codes
            </p>
            <button
              type="button"
              onClick={openSearchMode}
              className="text-[10px] text-accent hover:underline"
            >
              Search manually
            </button>
          </div>
          {suggestions.map((entry) => (
            <button
              key={entry.hs_code}
              type="button"
              onClick={() => handleSelect(entry)}
              className="w-full text-left px-3 py-2 hover:bg-hover transition-colors border-b border-border-subtle/50 last:border-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-accent font-medium">
                  {entry.hs_code}
                </span>
                <span className="text-[10px] text-text-muted">
                  MFN {(entry.mfn_duty_pct * 100).toFixed(1)}%
                  {entry.section_301_pct > 0 && ` + 301: ${(entry.section_301_pct * 100).toFixed(1)}%`}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {entry.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Source Link Cell ─────────────────────────────────────

interface SourceLinkCellProps {
  sourceUrl: string;
  imageUrl?: string;
  onUrlChange: (val: string) => void;
  onImageFetched: (imageUrl: string) => void;
}

function SourceLinkCell({ sourceUrl, imageUrl, onUrlChange, onImageFetched }: SourceLinkCellProps) {
  const [fetching, setFetching] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchImage = useCallback(async () => {
    if (!sourceUrl || imageUrl || fetching) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.image_url) onImageFetched(data.image_url);
      }
    } catch { /* silently fail */ }
    setFetching(false);
  }, [sourceUrl, imageUrl, fetching, onImageFetched]);

  const isValidUrl = sourceUrl && /^https?:\/\//i.test(sourceUrl);

  return (
    <div className="flex items-center gap-1 px-1 py-0.5 min-w-0">
      {/* Image thumbnail / fetch button */}
      {imageUrl ? (
        <button
          type="button"
          className="relative shrink-0 w-7 h-7 rounded border border-border-subtle overflow-hidden hover:ring-1 hover:ring-accent/50 transition-all"
          onClick={() => setShowPreview(!showPreview)}
          title="Toggle preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </button>
      ) : isValidUrl ? (
        <button
          type="button"
          onClick={fetchImage}
          disabled={fetching}
          className="shrink-0 p-1 rounded text-text-muted hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
          title="Fetch product image"
        >
          {fetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </button>
      ) : null}

      {/* URL input */}
      <input
        type="text"
        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-text-primary px-1 py-1 focus:bg-elevated focus:ring-1 focus:ring-accent/50 rounded transition-colors truncate"
        value={sourceUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste link..."
      />

      {/* External link icon */}
      {isValidUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1 rounded text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
          title="Open link"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {/* Image preview popup */}
      {showPreview && imageUrl && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-border-subtle bg-surface shadow-xl shadow-black/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Product" className="max-w-[200px] max-h-[200px] rounded object-contain" />
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function computeCBMPerUnit(item: ShipmentItem): number {
  return (item.length_cm * item.width_cm * item.height_cm) / 1_000_000;
}

function computeTotalCBM(item: ShipmentItem): number {
  return computeCBMPerUnit(item) * item.quantity;
}

function createEmptyItem(): ShipmentItem {
  return {
    id: crypto.randomUUID(),
    product_name: "",
    sku: "",
    hs_code: "",
    unit_price_usd: 0,
    quantity: 1,
    weight_kg: 0,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    source_url: "",
    image_url: "",
  };
}

function isValidHSCode(code: string | undefined): boolean {
  if (!code) return false;
  const cleaned = code.replace(/\./g, "");
  return /^\d{6,10}$/.test(cleaned);
}

// ── Component ────────────────────────────────────────────

interface ItemsDataGridProps {
  items: ShipmentItem[];
  onItemsChange: (items: ShipmentItem[]) => void;
}

export function ItemsDataGrid({ items, onItemsChange }: ItemsDataGridProps) {
  // Use refs to keep callbacks stable across renders (prevents focus loss)
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onChangeRef = useRef(onItemsChange);
  onChangeRef.current = onItemsChange;

  const updateItem = useCallback(
    (rowIndex: number, field: keyof ShipmentItem, raw: string) => {
      const numericFields: (keyof ShipmentItem)[] = [
        "unit_price_usd",
        "quantity",
        "weight_kg",
        "length_cm",
        "width_cm",
        "height_cm",
      ];

      const updated = itemsRef.current.map((item, idx) => {
        if (idx !== rowIndex) return item;
        if (numericFields.includes(field)) {
          const cleaned = raw.replace(/[^0-9.\-]/g, "");
          const parsed = parseFloat(cleaned);
          return { ...item, [field]: isNaN(parsed) ? 0 : parsed };
        }
        return { ...item, [field]: raw };
      });
      onChangeRef.current(updated);
    },
    []
  );

  // Apply HS code + tariff rates from auto-detect
  const applyHsCode = useCallback(
    (rowIndex: number, entry: HsTariffRate) => {
      const updated = itemsRef.current.map((item, idx) => {
        if (idx !== rowIndex) return item;
        return { ...item, hs_code: entry.hs_code };
      });
      onChangeRef.current(updated);
    },
    []
  );

  const duplicateItem = useCallback(
    (index: number) => {
      const source = itemsRef.current[index];
      const dup: ShipmentItem = { ...source, id: crypto.randomUUID() };
      const updated = [...itemsRef.current];
      updated.splice(index + 1, 0, dup);
      onChangeRef.current(updated);
    },
    []
  );

  const deleteItem = useCallback(
    (index: number) => {
      onChangeRef.current(itemsRef.current.filter((_, idx) => idx !== index));
    },
    []
  );

  const addRow = useCallback(() => {
    onChangeRef.current([...itemsRef.current, createEmptyItem()]);
  }, []);

  // ── Column definitions ─────────────────────────────────

  const columns = useMemo<ColumnDef<ShipmentItem, unknown>[]>(
    () => [
      {
        accessorKey: "product_name",
        header: "Product Name",
        size: 180,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.product_name}
            onChange={(v) => updateItem(row.index, "product_name", v)}
            placeholder="Product name"
            required
          />
        ),
      },
      {
        accessorKey: "source_url",
        header: "Source Link",
        size: 180,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <SourceLinkCell
            sourceUrl={row.original.source_url ?? ""}
            imageUrl={row.original.image_url}
            onUrlChange={(v) => updateItem(row.index, "source_url", v)}
            onImageFetched={(imgUrl) => updateItem(row.index, "image_url", imgUrl)}
          />
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 100,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.sku ?? ""}
            onChange={(v) => updateItem(row.index, "sku", v)}
            placeholder="SKU"
          />
        ),
      },
      {
        accessorKey: "hs_code",
        header: "HS Code",
        size: 130,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <HsCodeCell
            hsCode={row.original.hs_code ?? ""}
            productName={row.original.product_name}
            onHsCodeChange={(v) => updateItem(row.index, "hs_code", v)}
            onAutoApply={(entry) => applyHsCode(row.index, entry)}
          />
        ),
      },
      {
        accessorKey: "unit_price_usd",
        header: () => <span className="w-full text-right block">Unit Price</span>,
        size: 110,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.unit_price_usd}
            onChange={(v) => updateItem(row.index, "unit_price_usd", v)}
            type="number"
            align="right"
            required
            min={0}
          />
        ),
      },
      {
        accessorKey: "quantity",
        header: () => <span className="w-full text-right block">Qty</span>,
        size: 70,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.quantity}
            onChange={(v) => updateItem(row.index, "quantity", v)}
            type="number"
            align="right"
            required
            min={1}
          />
        ),
      },
      {
        accessorKey: "weight_kg",
        header: () => <span className="w-full text-right block">Wt (kg)</span>,
        size: 80,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.weight_kg}
            onChange={(v) => updateItem(row.index, "weight_kg", v)}
            type="number"
            align="right"
            min={0}
          />
        ),
      },
      {
        accessorKey: "length_cm",
        header: () => <span className="w-full text-right block">L (cm)</span>,
        size: 70,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.length_cm}
            onChange={(v) => updateItem(row.index, "length_cm", v)}
            type="number"
            align="right"
            min={0}
          />
        ),
      },
      {
        accessorKey: "width_cm",
        header: () => <span className="w-full text-right block">W (cm)</span>,
        size: 70,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.width_cm}
            onChange={(v) => updateItem(row.index, "width_cm", v)}
            type="number"
            align="right"
            min={0}
          />
        ),
      },
      {
        accessorKey: "height_cm",
        header: () => <span className="w-full text-right block">H (cm)</span>,
        size: 70,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={row.original.height_cm}
            onChange={(v) => updateItem(row.index, "height_cm", v)}
            type="number"
            align="right"
            min={0}
          />
        ),
      },
      {
        id: "cbm_unit",
        header: () => <span className="w-full text-right block">CBM/unit</span>,
        size: 85,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={computeCBMPerUnit(row.original).toFixed(4)}
            onChange={() => {}}
            type="number"
            align="right"
            readOnly
          />
        ),
      },
      {
        id: "total_cbm",
        header: () => <span className="w-full text-right block">Total CBM</span>,
        size: 90,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <EditableCell
            value={computeTotalCBM(row.original).toFixed(3)}
            onChange={() => {}}
            type="number"
            align="right"
            readOnly
          />
        ),
      },
      {
        id: "actions",
        header: "",
        size: 70,
        cell: ({ row }: CellContext<ShipmentItem, unknown>) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => duplicateItem(row.index)}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
              title="Duplicate row"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => deleteItem(row.index)}
              className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete row"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [updateItem, applyHsCode, duplicateItem, deleteItem]
  );

  // ── Totals ─────────────────────────────────────────────

  const totals = useMemo(() => {
    let quantity = 0;
    let totalCBM = 0;
    let totalWeight = 0;
    let totalValue = 0;
    for (const item of items) {
      quantity += item.quantity;
      totalCBM += computeTotalCBM(item);
      totalWeight += item.weight_kg * item.quantity;
      totalValue += item.unit_price_usd * item.quantity;
    }
    return { quantity, totalCBM, totalWeight, totalValue };
  }, [items]);

  // ── Table instance ─────────────────────────────────────

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border-subtle bg-surface overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border-subtle"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-2.5 text-xs font-medium text-text-muted text-left whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-subtle last:border-0 hover:bg-hover transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-0 py-0"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {/* Empty state */}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-text-muted"
                >
                  No items yet. Click &ldquo;Add Row&rdquo; to get started.
                </td>
              </tr>
            )}

            {/* Totals row */}
            {items.length > 0 && (
              <tr className="border-t-2 border-border-subtle bg-elevated/50">
                <td className="px-2 py-2 text-xs font-semibold text-text-secondary">
                  Totals
                </td>
                {/* Source Link */}
                <td />
                {/* SKU */}
                <td />
                {/* HS Code */}
                <td />
                {/* Unit Price */}
                <td className="px-2 py-2 text-right font-mono text-xs text-text-secondary">
                  {formatCurrency(totals.totalValue)}
                </td>
                {/* Quantity */}
                <td className="px-2 py-2 text-right font-mono text-xs text-text-secondary">
                  {totals.quantity.toLocaleString()}
                </td>
                {/* Weight */}
                <td className="px-2 py-2 text-right font-mono text-xs text-text-secondary">
                  {totals.totalWeight.toFixed(1)}
                </td>
                {/* L */}
                <td />
                {/* W */}
                <td />
                {/* H */}
                <td />
                {/* CBM/unit */}
                <td />
                {/* Total CBM */}
                <td className="px-2 py-2 text-right font-mono text-xs text-text-secondary">
                  {totals.totalCBM.toFixed(3)}
                </td>
                {/* Actions */}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={addRow}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Row
      </Button>
    </div>
  );
}

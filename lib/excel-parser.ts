// ============================================================
// LandedCost SaaS – Excel File Parser (SheetJS)
// ============================================================

import * as XLSX from 'xlsx';
import type { ShipmentItem } from '@/types';

// ── Column Mapping Types ─────────────────────────────────

export interface ColumnMapping {
  /** Index of the column in the source sheet */
  sourceIndex: number;
  /** Original header text from the spreadsheet */
  sourceHeader: string;
  /** Target field name in ShipmentItem */
  targetField: keyof ShipmentItem | null;
  /** Confidence score 0–1 */
  confidence: number;
}

export interface ParseResult {
  /** Mapped items ready for use */
  items: Partial<ShipmentItem>[];
  /** How each source column was mapped */
  mappings: ColumnMapping[];
  /** Number of data rows found (excluding header) */
  rowCount: number;
  /** Names of detected sheet tabs */
  sheetNames: string[];
  /** Original raw row data keyed by source header (preserves all cell values) */
  rawRows: Record<string, unknown>[];
}

// ── Header Matching Rules ────────────────────────────────

interface MatchRule {
  field: keyof ShipmentItem;
  /** Terms that boost the match score when found in the header */
  terms: string[];
  /** Weight multiplier for exact / near-exact matches */
  weight: number;
}

const MATCH_RULES: MatchRule[] = [
  { field: 'product_name', terms: ['product', 'name', 'item', 'item name', 'description', 'desc', 'title', 'goods', 'product name', 'product description'], weight: 1 },
  { field: 'sku', terms: ['sku', 'item code', 'part number', 'part no', 'item no', 'article', 'model', 'asin', 'upc', 'ean'], weight: 1 },
  { field: 'hs_code', terms: ['hs', 'hts', 'tariff', 'hs code', 'hts code', 'harmonized', 'commodity code'], weight: 1 },
  { field: 'unit_price_usd', terms: ['price', 'unit price', 'cost', 'unit cost', 'fob', 'fob price', 'usd', 'amount', 'rate'], weight: 1 },
  { field: 'quantity', terms: ['qty', 'quantity', 'pcs', 'units', 'count', 'order qty', 'pieces', 'moq'], weight: 1 },
  { field: 'weight_kg', terms: ['weight', 'kg', 'mass', 'net weight', 'gross weight', 'wt', 'weight kg', 'weight (kg)'], weight: 0.8 },
  { field: 'length_cm', terms: ['length', 'len', 'l cm', 'l(cm)', 'length cm', 'length (cm)', '长', '长(cm)', '长度'], weight: 0.8 },
  { field: 'width_cm', terms: ['width', 'wid', 'w cm', 'w(cm)', 'width cm', 'width (cm)', '宽', '宽(cm)', '宽度'], weight: 0.8 },
  { field: 'height_cm', terms: ['height', 'hgt', 'h cm', 'h(cm)', 'height cm', 'height (cm)', 'ht', '高', '高(cm)', '高度'], weight: 0.8 },
  { field: 'source_url', terms: ['link', 'url', 'source', 'source url', 'product link', 'product url', '1688', 'alibaba', 'supplier link', 'webpage'], weight: 0.9 },
];

// Headers that indicate a combined dimension column (e.g. "40x30x20")
const COMBINED_DIM_TERMS = [
  'dimension', 'dimensions', 'dim', 'dims', 'size', 'carton size',
  'box size', 'package size', 'outer size', 'l*w*h', 'lxwxh',
  'l x w x h', '尺寸', '外箱尺寸', '包装尺寸',
];

/**
 * Try to parse a combined dimension string like "40x30x20", "40*30*20",
 * "40×30×20", "40 x 30 x 20" into [length, width, height].
 * Returns null if it can't be parsed.
 */
export function parseCombinedDimension(value: string): [number, number, number] | null {
  if (!value) return null;
  const str = String(value).trim();
  // Split on common separators: x, X, *, ×, ✕ (with optional spaces)
  const parts = str.split(/\s*[xX×✕*]\s*/);
  if (parts.length >= 3) {
    const nums = parts.slice(0, 3).map(p => parseFloat(p.replace(/[^0-9.\-]/g, '')));
    if (nums.every(n => !isNaN(n) && n > 0)) {
      return [nums[0], nums[1], nums[2]];
    }
  }
  return null;
}

/**
 * Check if a header likely refers to a combined dimension column.
 */
function isCombinedDimHeader(header: string): boolean {
  const h = header.toLowerCase().trim();
  return COMBINED_DIM_TERMS.some(term => h === term || h.includes(term));
}

/**
 * Score how well a source header matches a target field.
 * Returns 0–1 confidence.
 */
// Single-letter exact matches for dimension headers
const SINGLE_LETTER_FIELDS: Record<string, keyof ShipmentItem> = {
  'l': 'length_cm',
  'w': 'width_cm',
  'h': 'height_cm',
};

function scoreHeaderMatch(header: string, rule: MatchRule): number {
  const h = header.toLowerCase().trim();

  // Single-letter exact match for dimension fields (L, W, H)
  if (h.length === 1 && SINGLE_LETTER_FIELDS[h] === rule.field) {
    return 0.85 * rule.weight;
  }

  // Exact match on any term
  for (const term of rule.terms) {
    if (h === term) return 1.0 * rule.weight;
  }

  // Header contains a term
  let best = 0;
  for (const term of rule.terms) {
    if (h.includes(term)) {
      // Longer term matches are more confident
      const score = (term.length / Math.max(h.length, 1)) * 0.9 * rule.weight;
      best = Math.max(best, score);
    }
  }

  // Term contains header (short headers like "qty")
  if (best === 0) {
    for (const term of rule.terms) {
      if (term.includes(h) && h.length >= 2) {
        const score = (h.length / Math.max(term.length, 1)) * 0.7 * rule.weight;
        best = Math.max(best, score);
      }
    }
  }

  return Math.min(best, 1);
}

// ── Main Parser ──────────────────────────────────────────

/**
 * Parse an Excel (xlsx / xls / csv) file buffer and auto-map columns
 * to ShipmentItem fields.
 *
 * @param buffer  Raw file contents as ArrayBuffer
 * @param sheetIndex  Which sheet to parse (default 0 = first)
 */
export function parseExcelFile(
  buffer: ArrayBuffer,
  sheetIndex = 0,
): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const sheetName = sheetNames[sheetIndex] ?? sheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array-of-arrays (all cells as strings)
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (raw.length === 0) {
    return { items: [], mappings: [], rowCount: 0, sheetNames, rawRows: [] };
  }

  // First row = headers
  const headers = (raw[0] as unknown[]).map((h) => String(h ?? ''));
  const dataRows = raw.slice(1);

  // ── Auto-map each source column ─────────────────────
  const mappings: ColumnMapping[] = headers.map((header, idx) => {
    let bestField: keyof ShipmentItem | null = null;
    let bestScore = 0;

    for (const rule of MATCH_RULES) {
      const score = scoreHeaderMatch(header, rule);
      if (score > bestScore) {
        bestScore = score;
        bestField = rule.field;
      }
    }

    // Only accept if confidence is above threshold
    const threshold = 0.3;
    return {
      sourceIndex: idx,
      sourceHeader: header,
      targetField: bestScore >= threshold ? bestField : null,
      confidence: Math.round(bestScore * 100) / 100,
    };
  });

  // Resolve conflicts: if two columns map to the same field, keep the
  // one with higher confidence.
  const fieldBest = new Map<string, number>(); // field -> best confidence
  for (const m of mappings) {
    if (m.targetField) {
      const current = fieldBest.get(m.targetField) ?? 0;
      if (m.confidence > current) {
        fieldBest.set(m.targetField, m.confidence);
      }
    }
  }
  for (const m of mappings) {
    if (m.targetField && m.confidence < (fieldBest.get(m.targetField) ?? 0)) {
      m.targetField = null;
    }
  }

  // ── Detect combined dimension columns ────────────────
  // If no separate L/W/H mapped, look for a combined "dimension" column
  const hasLength = mappings.some(m => m.targetField === 'length_cm');
  const hasWidth = mappings.some(m => m.targetField === 'width_cm');
  const hasHeight = mappings.some(m => m.targetField === 'height_cm');
  let combinedDimIndex = -1;

  if (!hasLength && !hasWidth && !hasHeight) {
    // Look for an unmapped column that matches combined dimension headers
    combinedDimIndex = headers.findIndex((h, idx) => {
      const mapping = mappings[idx];
      // Only consider unmapped or low-confidence columns
      if (mapping.targetField && mapping.confidence > 0.4) return false;
      return isCombinedDimHeader(h);
    });

    // If no header match, try detecting by cell values (first data row has "NxNxN" pattern)
    if (combinedDimIndex === -1 && dataRows.length > 0) {
      for (let i = 0; i < headers.length; i++) {
        const mapping = mappings[i];
        if (mapping.targetField && mapping.confidence > 0.4) continue;
        const cellVal = String(dataRows[0][i] ?? '');
        if (parseCombinedDimension(cellVal)) {
          combinedDimIndex = i;
          break;
        }
      }
    }
  }

  // ── Map data rows to partial ShipmentItems ──────────
  const items: Partial<ShipmentItem>[] = dataRows
    .filter((row) => row.some((cell) => cell !== '' && cell != null))
    .map((row) => {
      const item: Record<string, unknown> = {};

      for (const mapping of mappings) {
        if (!mapping.targetField) continue;
        const rawValue = row[mapping.sourceIndex];

        // Convert numeric fields
        const numericFields: (keyof ShipmentItem)[] = [
          'unit_price_usd',
          'quantity',
          'weight_kg',
          'length_cm',
          'width_cm',
          'height_cm',
        ];

        if (numericFields.includes(mapping.targetField)) {
          const parsed = parseFloat(String(rawValue ?? '0').replace(/[^0-9.\-]/g, ''));
          item[mapping.targetField] = isNaN(parsed) ? 0 : parsed;
        } else {
          item[mapping.targetField] = String(rawValue ?? '').trim();
        }
      }

      // Parse combined dimension column (e.g. "40x30x20")
      if (combinedDimIndex >= 0 && !item.length_cm && !item.width_cm && !item.height_cm) {
        const dimStr = String(row[combinedDimIndex] ?? '');
        const dims = parseCombinedDimension(dimStr);
        if (dims) {
          item.length_cm = dims[0];
          item.width_cm = dims[1];
          item.height_cm = dims[2];
        }
      }

      return item as Partial<ShipmentItem>;
    })
    .filter((item) => {
      // Skip rows without a product name
      const name = item.product_name;
      return name !== undefined && name !== null && String(name).trim() !== '';
    });

  // Build raw rows preserving original cell values for ALL columns
  const rawRows: Record<string, unknown>[] = dataRows
    .filter((row) => row.some((cell) => cell !== '' && cell != null))
    .map((row) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].trim()) {
          obj[headers[i]] = row[i] ?? '';
        }
      }
      return obj;
    });

  return {
    items,
    mappings,
    rowCount: dataRows.length,
    sheetNames,
    rawRows,
  };
}

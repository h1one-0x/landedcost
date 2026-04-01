// ============================================================
// LandedCost SaaS – HS Code Tariff Lookup
// ============================================================

import type { HsTariffRate } from '@/types';

/**
 * Common HS codes for goods imported from China to the US.
 * This is a reference dataset – always verify rates with official
 * USITC / CBP sources before making import decisions.
 */
export const COMMON_HS_CODES: HsTariffRate[] = [
  // ── Electronics & Electrical ──────────────────────────
  { hs_code: '8471300000', description: 'Laptop computers', mfn_duty_pct: 0, section_301_pct: 0, notes: 'Excluded from Section 301' },
  { hs_code: '8471410000', description: 'Desktop computers', mfn_duty_pct: 0, section_301_pct: 0 },
  { hs_code: '8517120000', description: 'Smartphones / cellular phones', mfn_duty_pct: 0, section_301_pct: 0, notes: 'Excluded from Section 301' },
  { hs_code: '8518300000', description: 'Headphones and earphones', mfn_duty_pct: 0, section_301_pct: 7.5 },
  { hs_code: '8504400000', description: 'Power adapters / chargers', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '8506500000', description: 'Lithium batteries (primary)', mfn_duty_pct: 3.4, section_301_pct: 25 },
  { hs_code: '8507600000', description: 'Lithium-ion batteries', mfn_duty_pct: 3.4, section_301_pct: 25 },
  { hs_code: '8528720000', description: 'LED monitors / displays', mfn_duty_pct: 5, section_301_pct: 25 },
  { hs_code: '8443321000', description: 'Printers', mfn_duty_pct: 0, section_301_pct: 0 },
  { hs_code: '8525800000', description: 'Cameras (digital)', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── Furniture & Home ──────────────────────────────────
  { hs_code: '9401610000', description: 'Upholstered wooden furniture', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '9401710000', description: 'Upholstered metal furniture', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '9403200000', description: 'Metal furniture (other)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '9403600000', description: 'Wooden furniture (other)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '9405420000', description: 'LED lighting fixtures', mfn_duty_pct: 3.9, section_301_pct: 25 },
  { hs_code: '9404210000', description: 'Mattresses (cellular rubber/plastic)', mfn_duty_pct: 3, section_301_pct: 25 },

  // ── Textiles & Apparel ────────────────────────────────
  { hs_code: '6109100000', description: 'T-shirts (cotton, knitted)', mfn_duty_pct: 16.5, section_301_pct: 7.5 },
  { hs_code: '6110200000', description: 'Sweaters (cotton, knitted)', mfn_duty_pct: 16.5, section_301_pct: 7.5 },
  { hs_code: '6204620000', description: "Women's trousers (cotton)", mfn_duty_pct: 16.6, section_301_pct: 7.5 },
  { hs_code: '6203420000', description: "Men's trousers (cotton)", mfn_duty_pct: 16.6, section_301_pct: 7.5 },
  { hs_code: '6402990000', description: 'Footwear (rubber/plastic outer soles)', mfn_duty_pct: 6, section_301_pct: 25 },
  { hs_code: '6403990000', description: 'Footwear (leather upper)', mfn_duty_pct: 8.5, section_301_pct: 25 },

  // ── Plastics & Rubber ─────────────────────────────────
  { hs_code: '3923100000', description: 'Plastic boxes, crates, containers', mfn_duty_pct: 3, section_301_pct: 25 },
  { hs_code: '3926909000', description: 'Other articles of plastic', mfn_duty_pct: 5.3, section_301_pct: 25 },
  { hs_code: '4016990000', description: 'Other articles of vulcanized rubber', mfn_duty_pct: 2.5, section_301_pct: 25 },

  // ── Machinery & Parts ─────────────────────────────────
  { hs_code: '8481800000', description: 'Valves and similar appliances', mfn_duty_pct: 2, section_301_pct: 25 },
  { hs_code: '8482100000', description: 'Ball bearings', mfn_duty_pct: 9, section_301_pct: 25 },
  { hs_code: '8414300000', description: 'Compressors (refrigeration)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '8501400000', description: 'AC motors (single-phase)', mfn_duty_pct: 2.5, section_301_pct: 25 },
  { hs_code: '8413700000', description: 'Centrifugal pumps', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── Toys & Recreation ─────────────────────────────────
  { hs_code: '9503000000', description: 'Toys, scale models, puzzles', mfn_duty_pct: 0, section_301_pct: 7.5 },
  { hs_code: '9506620000', description: 'Inflatable balls', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '9506990000', description: 'Fitness / exercise equipment', mfn_duty_pct: 4, section_301_pct: 25 },

  // ── Auto Parts ────────────────────────────────────────
  { hs_code: '8708290000', description: 'Auto body parts (other)', mfn_duty_pct: 2.5, section_301_pct: 25 },
  { hs_code: '8708999000', description: 'Auto parts (other)', mfn_duty_pct: 2.5, section_301_pct: 25 },
  { hs_code: '4011100000', description: 'Tires (new, passenger cars)', mfn_duty_pct: 4, section_301_pct: 25 },

  // ── Kitchen & Household ───────────────────────────────
  { hs_code: '7323930000', description: 'Stainless steel kitchen articles', mfn_duty_pct: 2, section_301_pct: 25 },
  { hs_code: '6911100000', description: 'Ceramic tableware (porcelain)', mfn_duty_pct: 8, section_301_pct: 25 },
  { hs_code: '7013490000', description: 'Glassware for table / kitchen', mfn_duty_pct: 12.5, section_301_pct: 25 },
  { hs_code: '7615200000', description: 'Aluminum kitchen articles', mfn_duty_pct: 3.1, section_301_pct: 25 },

  // ── Paper & Packaging ─────────────────────────────────
  { hs_code: '4819100000', description: 'Corrugated paper boxes', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '4821100000', description: 'Printed labels', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── Steel & Metals ────────────────────────────────────
  { hs_code: '7318150000', description: 'Bolts and screws (iron/steel)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '7326900000', description: 'Other articles of iron or steel', mfn_duty_pct: 2.9, section_301_pct: 25 },
  { hs_code: '7604290000', description: 'Aluminum bars, rods, profiles', mfn_duty_pct: 5, section_301_pct: 25 },

  // ── Solar / Green Energy ──────────────────────────────
  { hs_code: '8541400000', description: 'Solar cells / photovoltaic cells', mfn_duty_pct: 0, section_301_pct: 25, notes: 'Subject to AD/CVD too' },

  // ── Textiles – Curtains & Drapes ────────────────────────
  { hs_code: '6303920000', description: 'Curtains, drapes (synthetic fibers)', mfn_duty_pct: 11.4, section_301_pct: 7.5 },
  { hs_code: '6303120000', description: 'Curtains, drapes (cotton, knitted)', mfn_duty_pct: 11.4, section_301_pct: 7.5 },
  { hs_code: '6304930000', description: 'Furnishing articles (synthetic, not knitted)', mfn_duty_pct: 9.6, section_301_pct: 7.5 },

  // ── Home Décor & Frames ─────────────────────────────────
  { hs_code: '4414000000', description: 'Wooden frames for paintings, photos, mirrors', mfn_duty_pct: 3.2, section_301_pct: 25 },
  { hs_code: '8306290000', description: 'Metal frames, statuettes, ornaments', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '7009920000', description: 'Glass mirrors (framed)', mfn_duty_pct: 3.9, section_301_pct: 25 },
  { hs_code: '6913100000', description: 'Decorative ceramic articles (porcelain)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '3926400000', description: 'Plastic statuettes and decorative articles', mfn_duty_pct: 5.3, section_301_pct: 25 },

  // ── Silicone & Rubber Kitchen ───────────────────────────
  { hs_code: '3924100000', description: 'Plastic / silicone tableware and kitchenware', mfn_duty_pct: 3.4, section_301_pct: 25 },
  { hs_code: '3924900000', description: 'Plastic / silicone household articles (other)', mfn_duty_pct: 3.4, section_301_pct: 25 },
  { hs_code: '4016920000', description: 'Rubber erasers / silicone lids and covers', mfn_duty_pct: 4.2, section_301_pct: 25 },

  // ── Cups, Bottles, Drinkware ────────────────────────────
  { hs_code: '7323940000', description: 'Iron / steel enamelled kitchen and table articles', mfn_duty_pct: 2.7, section_301_pct: 25 },
  { hs_code: '7013280000', description: 'Glass drinking cups, tumblers, stemware', mfn_duty_pct: 12.5, section_301_pct: 25 },
  { hs_code: '7615100000', description: 'Aluminum table / kitchen articles', mfn_duty_pct: 3.1, section_301_pct: 25 },
  { hs_code: '6912000000', description: 'Ceramic tableware (non-porcelain)', mfn_duty_pct: 9.8, section_301_pct: 25 },

  // ── Art, Craft & Painting Supplies ──────────────────────
  { hs_code: '9603300000', description: 'Artist brushes, painting brushes', mfn_duty_pct: 2.6, section_301_pct: 25 },
  { hs_code: '3213100000', description: 'Artist paint sets (colors in sets)', mfn_duty_pct: 3.1, section_301_pct: 25 },
  { hs_code: '9609100000', description: 'Pencils (graphite) and color pencils', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '9017200000', description: 'Drawing instruments, stencils, rulers', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── Insulation & Building ───────────────────────────────
  { hs_code: '3921190000', description: 'Foam sheets, insulation panels (plastic)', mfn_duty_pct: 4.2, section_301_pct: 25 },
  { hs_code: '6806100000', description: 'Mineral wool insulation (slag/rock)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '3918100000', description: 'Floor coverings, tiles (vinyl / PVC)', mfn_duty_pct: 5.3, section_301_pct: 25 },

  // ── Bags & Cases ────────────────────────────────────────
  { hs_code: '4202220000', description: 'Handbags (leather outer surface)', mfn_duty_pct: 8, section_301_pct: 25 },
  { hs_code: '4202320000', description: 'Wallets, phone cases (leather)', mfn_duty_pct: 8, section_301_pct: 25 },
  { hs_code: '4202920000', description: 'Bags and cases (plastic / textile)', mfn_duty_pct: 17.6, section_301_pct: 25 },
  { hs_code: '4202120000', description: 'Suitcases, trunks (leather)', mfn_duty_pct: 8, section_301_pct: 25 },
  { hs_code: '4202990000', description: 'Storage bags, organizers (other material)', mfn_duty_pct: 20, section_301_pct: 25 },

  // ── Pet Supplies ────────────────────────────────────────
  { hs_code: '4201000000', description: 'Pet collars, leashes, harnesses (leather)', mfn_duty_pct: 2.4, section_301_pct: 25 },
  { hs_code: '6307900000', description: 'Pet beds, textile articles (other)', mfn_duty_pct: 7, section_301_pct: 7.5 },

  // ── Garden & Outdoor ────────────────────────────────────
  { hs_code: '8201400000', description: 'Axes, shears, garden tools', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '3926909000', description: 'Plastic garden articles, planters', mfn_duty_pct: 5.3, section_301_pct: 25 },
  { hs_code: '9403890000', description: 'Outdoor furniture (other materials)', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── Bathroom & Cleaning ─────────────────────────────────
  { hs_code: '6302600000', description: 'Towels (cotton terry)', mfn_duty_pct: 9.1, section_301_pct: 7.5 },
  { hs_code: '9603900000', description: 'Brooms, mops, cleaning brushes', mfn_duty_pct: 3.4, section_301_pct: 25 },
  { hs_code: '7324900000', description: 'Stainless steel bathroom accessories', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── Candles & Aromatherapy ──────────────────────────────
  { hs_code: '3406000000', description: 'Candles, tapers, wax lights', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '3307490000', description: 'Room deodorants, air fresheners', mfn_duty_pct: 6, section_301_pct: 25 },

  // ── Stationery & Office ─────────────────────────────────
  { hs_code: '4820100000', description: 'Notebooks, notepads, journals', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '3926100000', description: 'Office supplies of plastic', mfn_duty_pct: 5.3, section_301_pct: 25 },
  { hs_code: '8304000000', description: 'Desk accessories, staple removers (metal)', mfn_duty_pct: 3.9, section_301_pct: 25 },

  // ── Window & Noise Insulation ───────────────────────────
  { hs_code: '3919100000', description: 'Self-adhesive tape / film (plastic, rolls)', mfn_duty_pct: 1.8, section_301_pct: 25 },
  { hs_code: '4008210000', description: 'Rubber plates, sheets (non-cellular)', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '3921909000', description: 'Plastic plates, sheets (other)', mfn_duty_pct: 4.8, section_301_pct: 25 },

  // ── Food & Beverage Related ─────────────────────────────
  { hs_code: '8419810000', description: 'Cooking / food warming appliances', mfn_duty_pct: 0, section_301_pct: 25 },
  { hs_code: '8516600000', description: 'Cooking appliances (electric)', mfn_duty_pct: 3.4, section_301_pct: 25 },
  { hs_code: '8210000000', description: 'Food grinders, mixers (hand-operated)', mfn_duty_pct: 0, section_301_pct: 25 },

  // ── LED & Seasonal ──────────────────────────────────────
  { hs_code: '9405300000', description: 'Lighting sets (LED string lights, holiday)', mfn_duty_pct: 3.9, section_301_pct: 25 },
  { hs_code: '9505100000', description: 'Christmas ornaments and decorations', mfn_duty_pct: 0, section_301_pct: 0 },

  // ── Bedding & Pillows ───────────────────────────────────
  { hs_code: '9404900000', description: 'Comforters, quilts, duvets', mfn_duty_pct: 7, section_301_pct: 7.5 },
  { hs_code: '9404300000', description: 'Sleeping bags', mfn_duty_pct: 7, section_301_pct: 25 },
  { hs_code: '6302310000', description: 'Bed linen (cotton)', mfn_duty_pct: 2.7, section_301_pct: 7.5 },
  { hs_code: '9404210000', description: 'Pillows and cushions', mfn_duty_pct: 6, section_301_pct: 25 },
];

// ── Lookup Function ──────────────────────────────────────

export interface HsLookupResult {
  exact: boolean;
  matches: HsTariffRate[];
}

/**
 * Search the local HS code reference by code prefix or description keyword.
 *
 * - If `query` looks like a numeric string it is treated as an HS code prefix.
 * - Otherwise it is split into keywords and matched against descriptions.
 *
 * Returns up to `limit` results (default 10).
 */
export function lookupHsCode(
  query: string,
  limit = 10,
): HsLookupResult {
  const trimmed = query.trim();
  if (!trimmed) return { exact: false, matches: [] };

  const isCodeSearch = /^\d+$/.test(trimmed);

  if (isCodeSearch) {
    // ── Prefix search by HS code ────────────────────────
    const exact = COMMON_HS_CODES.filter((h) => h.hs_code === trimmed);
    if (exact.length > 0) return { exact: true, matches: exact };

    const prefixMatches = COMMON_HS_CODES.filter((h) =>
      h.hs_code.startsWith(trimmed),
    );
    return { exact: false, matches: prefixMatches.slice(0, limit) };
  }

  // ── Keyword search by description ───────────────────
  const keywords = trimmed.toLowerCase().split(/\s+/);

  const scored = COMMON_HS_CODES.map((h) => {
    const desc = h.description.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (desc.includes(kw)) score += 1;
    }
    return { entry: h, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    exact: false,
    matches: scored.map((s) => s.entry),
  };
}

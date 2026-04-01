import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/og-image?url=<encoded-url>
 *
 * Fetches the given product page and extracts the main product image
 * from Open Graph meta tags or common patterns for 1688 / Alibaba.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow known sourcing domains
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const allowedHosts = [
    '1688.com', 'detail.1688.com', 'm.1688.com',
    'alibaba.com', 'www.alibaba.com',
    'aliexpress.com', 'www.aliexpress.com',
  ];

  const hostname = parsed.hostname.replace(/^www\./, '');
  if (!allowedHosts.some(h => hostname === h || hostname.endsWith('.' + h))) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch page' }, { status: 502 });
    }

    const html = await res.text();
    const imageUrl = extractImageUrl(html, parsed.hostname);

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image found' }, { status: 404 });
    }

    return NextResponse.json({ image_url: imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function extractImageUrl(html: string, hostname: string): string | null {
  // 1. Try og:image meta tag (works for most sites)
  const ogMatch = html.match(
    /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i
  ) ?? html.match(
    /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i
  );
  if (ogMatch?.[1]) return ensureAbsolute(ogMatch[1]);

  // 2. 1688-specific: look for main image in common patterns
  if (hostname.includes('1688')) {
    // data-imgs or imgUrl in JSON data
    const imgMatch = html.match(/"(?:imgUrl|originalImgUrl|imageUrl)"\s*:\s*"([^"]+)"/i);
    if (imgMatch?.[1]) return ensureAbsolute(imgMatch[1]);

    // <img> with "detail" or "offer" in the src
    const detailImg = html.match(/<img[^>]+src=["'](https?:\/\/[^"']*(?:cbu01|img)\.alicdn\.com[^"']+)["']/i);
    if (detailImg?.[1]) return detailImg[1];
  }

  // 3. Alibaba-specific
  if (hostname.includes('alibaba')) {
    const aliImg = html.match(/<img[^>]+src=["'](https?:\/\/[^"']*\.alicdn\.com[^"']+)["']/i);
    if (aliImg?.[1]) return aliImg[1];
  }

  // 4. Generic: first large image
  const genericImg = html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (genericImg?.[1]) return ensureAbsolute(genericImg[1]);

  return null;
}

function ensureAbsolute(url: string): string {
  if (url.startsWith('//')) return 'https:' + url;
  return url;
}

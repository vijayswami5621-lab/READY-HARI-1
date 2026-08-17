/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to normalize Firestore image & media URLs.
 * Automatically cleans markdown wrapping like `[url](url)`, extra quotes,
 * backslashes, leading/trailing whitespace, bracket wrapping, and ensures valid HTTP/HTTPS URLs.
 */
export function normalizeUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  let url = rawUrl.trim();
  if (!url) return '';

  // 1. Handle markdown link format: [text](http...) or [http...](http...) or [url][url]
  const mdMatch = url.match(/\[(?:[^\]]*)\]\((https?:\/\/[^\s\)]+|\/\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    url = mdMatch[1];
  } else {
    // 2. Handle bracket-wrapped or paren-wrapped URLs: <https://...> or [https://...] or (https://...)
    const bracketMatch = url.match(/[<(\[]?\s*(https?:\/\/[^\s\]\)>"']+)\s*[>)\]]?/i);
    if (bracketMatch && bracketMatch[1]) {
      url = bracketMatch[1];
    }
  }

  // 3. Remove surrounding quotes, backslashes, brackets, parens, and spaces
  url = url
    .replace(/^["'`\\()[\]<>\s]+|["'`\\()[\]<>\s]+$/g, '')
    .replace(/\\/g, '')
    .trim();

  // 4. Relative paths like /logo.png stay as relative
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  // 5. Handle protocol-relative //i.ibb.co/...
  if (url.startsWith('//')) {
    url = `https:${url}`;
  }

  // 6. If missing protocol e.g. "i.ibb.co/..." or "images.unsplash.com/..."
  if (url.includes('.') && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

/**
 * Ensures ImgBB URLs are direct image links starting with https://i.ibb.co/
 */
export function ensureDirectImgBB(url: string): string {
  const normalized = normalizeUrl(url);
  if (!normalized) return '';
  return normalized;
}

/**
 * Normalizes all string fields in an object that represent URLs or images
 */
export function normalizeObjectUrls<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = { ...obj };

  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string' && (
      key.toLowerCase().includes('url') ||
      key.toLowerCase().includes('image') ||
      key.toLowerCase().includes('logo') ||
      key.toLowerCase().includes('photo') ||
      key.toLowerCase().includes('icon') ||
      key.toLowerCase().includes('banner') ||
      key.toLowerCase().includes('signature') ||
      key.toLowerCase().includes('apk') ||
      key.toLowerCase().includes('cover')
    )) {
      result[key] = normalizeUrl(val);
    }
  }
  return result;
}



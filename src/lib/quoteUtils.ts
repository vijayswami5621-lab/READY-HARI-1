/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';

// Helper to generate QR code data URL
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#7c2d12', // Deep amber/saffron
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.warn('Error generating QR code:', err);
    return '';
  }
}

// Convert image URL to Base64 Data URL safely to prevent CORS canvas tainting
export async function fetchAsDataUrl(url: string, fallbackDataUrl?: string): Promise<string> {
  if (!url) return fallbackDataUrl || '';
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(fallbackDataUrl || url);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('CORS or network issue converting image to dataUrl:', err);
    return fallbackDataUrl || url;
  }
}

// Default Spiritual User Avatar Base64 / SVG Data URL
export const DEFAULT_SPIRITUAL_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ea580c"/><circle cx="50" cy="40" r="20" fill="%23fef3c7"/><path d="M20,85 C20,65 35,55 50,55 C65,55 80,65 80,85 Z" fill="%23fef3c7"/></svg>`;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { registerEcommerceAndSeoRoutes } from './server/ecommerce-seo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Register modern production eCommerce & background SEO optimization APIs
  registerEcommerceAndSeoRoutes(app);

  // API Routes FIRST

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Dynamic ImgBB proxy upload endpoint
  app.post('/api/upload', async (req, res) => {
    try {
      const { image, name } = req.body; // base64 string
      
      if (!image) {
        return res.status(400).json({ error: 'No image data provided.' });
      }

      // Check if ImgBB API key is available
      const apiKey = process.env.IMGBB_API_KEY;

      if (!apiKey || apiKey === 'MY_IMGBB_API_KEY' || apiKey.trim() === '') {
        console.warn('IMGBB_API_KEY is not configured. Falling back to mock successful upload for preview.');
        // Generate a beautiful spiritual high-res mockup image from Unsplash as mock URL
        const randomNum = Math.floor(Math.random() * 1000);
        const mockUrls = [
          'https://images.unsplash.com/photo-1609137144813-9118e9863a4b?q=80&w=600',
          'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
          'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=1200',
          'https://images.unsplash.com/photo-1602631985686-2bb0f30101cd?q=80&w=1200',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
          'https://images.unsplash.com/photo-1514415008039-eba07d30f305?q=80&w=800'
        ];
        const mockUrl = mockUrls[randomNum % mockUrls.length];
        
        // Return simulated ImgBB response
        return res.json({
          success: true,
          status: 200,
          data: {
            id: `mock-${Date.now()}`,
            title: name || 'Mock Spiritual Image',
            url_viewer: mockUrl,
            url: mockUrl, // direct image URL
            display_url: mockUrl,
            size: 15420,
            time: Date.now(),
            expiration: 0,
            image: {
              filename: 'spiritual.jpg',
              name: 'spiritual',
              mime: 'image/jpeg',
              extension: 'jpg',
              url: mockUrl
            },
            thumb: {
              filename: 'spiritual_thumb.jpg',
              name: 'spiritual_thumb',
              mime: 'image/jpeg',
              extension: 'jpg',
              url: mockUrl
            }
          }
        });
      }

      // Prepare payload to send to ImgBB
      // ImgBB requires application/x-www-form-urlencoded body with image=BASE64STRING
      // The base64 string must not contain data:image/png;base64, prefix
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');

      const formData = new URLSearchParams();
      formData.append('image', cleanBase64);
      if (name) formData.append('name', name);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'ImgBB API responded with an error.');
      }

      return res.json(data);
    } catch (err: any) {
      console.error('Server upload proxy error:', err);
      return res.status(500).json({ error: err.message || 'Server upload proxy failed.' });
    }
  });

  // Vite Middleware Setup for development, static assets for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hari Pathshala full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();

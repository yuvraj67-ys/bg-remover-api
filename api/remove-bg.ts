// api/remove-bg.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const config = {
  api: {
    bodyParser: false, // Handle raw body for large images
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ⚠️ IMPORTANT: For true AI background removal, 
    // redirect client to use browser-based processing
    // This endpoint acts as a proxy/health check
    
    return res.status(200).setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: true,
        message: 'Use client-side processing for background removal',
        clientEndpoint: '/index.html',
        model: 'RMBG-1.4 via Transformers.js',
        note: 'Processing happens in browser - no server upload needed 🔒'
      });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Internal server error' });
  }
}

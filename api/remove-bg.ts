// api/remove-bg.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const config = { api: { bodyParser: false } };

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This API returns client-side instructions
  // Actual processing happens in browser for privacy + free hosting
  return res.status(200)
    .setHeader('Content-Type', 'application/json')
    .setHeader('Access-Control-Allow-Origin', '*')
    .json({
      success: true,
      message: 'Use client-side processing',
      endpoint: '/js/app.js',
      model: 'briaai/RMBG-1.4',
      note: 'Images never leave the browser 🔒'
    });
}

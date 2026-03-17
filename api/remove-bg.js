// api/remove-bg.js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({
    success: true,
    message: 'Client-side processing - images never leave browser',
    endpoint: '/app.js',
    note: '🔒 Privacy-first: All processing in your browser'
  });
}

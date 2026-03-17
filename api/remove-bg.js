// api/remove-bg.js
// Vercel serverless function - returns API info
// Note: Actual processing happens in browser for privacy + free hosting

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for this endpoint
  },
};

export default async function handler(request, response) {
  // CORS headers for browser access
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Only allow GET and POST
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // Return API information
  response.status(200).json({
    success: true,
    name: 'Background Remover API',
    version: '1.0.0',
    description: 'Client-side background removal using @imgly/background-removal',
    endpoints: {
      web: '/',
      api: '/api/remove-bg'
    },
    processing: 'browser',
    privacy: 'Images never leave the user\'s device',
    model: {
      name: '@imgly/background-removal',
      version: '1.3.0',
      size: '~40MB (cached after first load)'
    },
    limits: {
      fileSize: '10MB',
      formats: ['PNG', 'JPG', 'JPEG', 'WebP']
    },
    github: 'https://github.com/yuvraj67-ys/bg-remover-api'
  });
}

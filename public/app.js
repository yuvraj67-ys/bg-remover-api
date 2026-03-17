// public/app.js - Plain JavaScript (no TypeScript compilation required)
import { AutoModel, AutoProcessor, env, RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

// 🔑 CRITICAL: Configure BEFORE loading model
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/';
env.backends.onnx.wasm.proxy = true;
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;

let model = null;
let processor = null;

// Check browser support
function checkBrowserSupport() {
  const status = document.getElementById('status');
  if (typeof SharedArrayBuffer === 'undefined') {
    status.textContent = '⚠️ SharedArrayBuffer not available.\nVercel headers should enable this.\nTry: new tab or incognito.';
    status.className = 'error';
    return false;
  }
  if (typeof WebAssembly !== 'object') {
    status.textContent = '❌ WebAssembly not supported';
    status.className = 'error';
    return false;
  }
  return true;
}

// Load the AI model
export async function initModel() {
  const loadBtn = document.getElementById('loadModel');
  const status = document.getElementById('status');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progress-bar');
  
  if (!checkBrowserSupport()) {
    loadBtn.disabled = false;
    return false;
  }
  
  loadBtn.disabled = true;
  status.textContent = '⏳ Loading model (~170MB)...';
  status.className = '';
  progress.style.display = 'block';
  progressBar.style.width = '0%';

  try {
    // Load RMBG-1.4 model
    model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {      quantized: true,
      progress_callback: (data) => {
        if (data?.status === 'progress' && data?.progress !== undefined) {
          const pct = Math.min(100, Math.round(data.progress));
          progressBar.style.width = `${pct}%`;
          status.textContent = `⏳ Loading: ${pct}%`;
        }
      }
    });

    processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
    
    progress.style.display = 'none';
    status.textContent = '✅ Model ready! Upload an image.';
    status.className = 'success';
    document.getElementById('upload').disabled = false;
    loadBtn.textContent = '✅ Model Loaded';
    return true;
    
  } catch (err) {
    console.error('Model load error:', err);
    progress.style.display = 'none';
    
    let msg = err.message || 'Unknown error';
    if (msg.includes('backend') || msg.includes('wasm') || msg.includes('SharedArrayBuffer')) {
      msg = `❌ WASM backend failed: ${msg}\n\nTry:\n• Chrome/Edge (latest)\n• COOP/COEP headers in vercel.json\n• Disable ad-blockers\n• Check: window.crossOriginIsolated = ${window.crossOriginIsolated}`;
    }
    
    status.textContent = msg;
    status.className = 'error';
    loadBtn.disabled = false;
    return false;
  }
}

// Process image with loaded model
export async function processImage(file) {
  if (!model || !processor) throw new Error('Model not loaded');
  
  const status = document.getElementById('status');
  status.textContent = '🔄 Processing...';
  status.className = '';

  try {
    const image = await RawImage.fromURL(URL.createObjectURL(file));
    const inputs = await processor(image);
    const { output } = await model(inputs);
    
    const mask = await RawImage.fromTensor(
      output[0].mul(255).to('uint8')    ).resize(image.width, image.height);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image.toCanvas(), 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < mask.data.length; i++) {
      imageData.data[i * 4 + 3] = mask.data[i];
    }
    ctx.putImageData(imageData, 0, 0);
    
    status.textContent = '✨ Done! Download ready.';
    status.className = 'success';
    
    return canvas;
    
  } catch (err) {
    console.error('Process error:', err);
    status.textContent = `❌ ${err.message}`;
    status.className = 'error';
    return null;
  }
}

// ✅ Attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadModel');
  const upload = document.getElementById('upload');
  const download = document.getElementById('download');
  const output = document.getElementById('output');
  
  // ✅ This is what was missing - click handler!
  loadBtn.addEventListener('click', () => {
    console.log('🔄 Loading model...');
    initModel();
  });
  
  upload.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const canvas = await processImage(file);
    if (canvas) {
      output.width = canvas.width;
      output.height = canvas.height;
      const ctx = output.getContext('2d');      ctx.drawImage(canvas, 0, 0);
      output.style.display = 'block';
      
      download.href = canvas.toDataURL('image/png');
      download.style.display = 'inline-block';
    }
  });
  
  console.log('✅ UI initialized. Click "Load AI Model" to start.');
});

// public/js/app.ts
import { AutoModel, AutoProcessor, env, RawImage } from '@huggingface/transformers';

// 🔑 CRITICAL: Configure WASM paths BEFORE any model loading
env.allowLocalModels = false;
env.useBrowserCache = true;

// ✅ FIX: Explicit WASM paths from jsdelivr CDN [[2]][[10]]
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/';
env.backends.onnx.wasm.proxy = true; // Fallback to proxy mode if SIMD fails
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;

// Check for required browser features
function checkBrowserSupport(): boolean {
  const status = document.getElementById('status') as HTMLDivElement;
  
  // Check SharedArrayBuffer (required for WASM threads)
  if (typeof SharedArrayBuffer === 'undefined') {
    status.textContent = '⚠️ SharedArrayBuffer not available.\n\nThis is required for WASM performance.\n\nVercel headers should enable this automatically.\nIf not, try opening in a new tab or incognito.';
    status.className = 'error';
    return false;
  }
  
  // Check WebAssembly
  if (typeof WebAssembly !== 'object') {
    status.textContent = '❌ WebAssembly not supported in this browser';
    status.className = 'error';
    return false;
  }
  
  return true;
}

let model: ReturnType<typeof AutoModel.from_pretrained> | null = null;
let processor: ReturnType<typeof AutoProcessor.from_pretrained> | null = null;

export async function initModel(): Promise<boolean> {
  const loadBtn = document.getElementById('loadModel') as HTMLButtonElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const progress = document.getElementById('progress') as HTMLDivElement;
  const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
  
  if (!checkBrowserSupport()) {
    loadBtn.disabled = false;
    return false;
  }
  
  loadBtn.disabled = true;
  status.textContent = '⏳ Loading model (~170MB)...';
  status.className = '';  progress.style.display = 'block';
  progressBar.style.width = '0%';

  try {
    // ✅ Load RMBG-1.4 with progress tracking
    model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
      quantized: true, // Use quantized version for faster load
      progress_callback: (data: any) => {
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
    (document.getElementById('upload') as HTMLInputElement).disabled = false;
    loadBtn.textContent = '✅ Model Loaded';
    return true;
    
  } catch (err: any) {
    console.error('Model load error:', err);
    progress.style.display = 'none';
    
    let msg = err.message || 'Unknown error';
    
    // ✅ Specific error handling for common WASM issues
    if (msg.includes('backend') || msg.includes('wasm') || msg.includes('SharedArrayBuffer')) {
      msg = `❌ WASM backend failed: ${msg}\n\nTry:\n• Open in Chrome/Edge (latest)\n• Ensure COOP/COEP headers are set (vercel.json)\n• Disable ad-blockers/extensions\n• Try: window.crossOriginIsolated = ${window.crossOriginIsolated}`;
    }
    
    status.textContent = msg;
    status.className = 'error';
    loadBtn.disabled = false;
    return false;
  }
}

export async function processImage(file: File): Promise<HTMLCanvasElement | null> {
  if (!model || !processor) throw new Error('Model not loaded');
  
  const status = document.getElementById('status') as HTMLDivElement;
  status.textContent = '🔄 Processing...';
  status.className = '';
  try {
    // Load image
    const image = await RawImage.fromURL(URL.createObjectURL(file));
    
    // Preprocess for model
    const inputs = await processor(image);
    
    // Run inference
    const { output } = await model(inputs);
    
    // Post-process: convert tensor to mask + resize to original
    const mask = await RawImage.fromTensor(
      output[0].mul(255).to('uint8')
    ).resize(image.width, image.height);
    
    // Create result canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original + apply alpha mask
    ctx.drawImage(image.toCanvas(), 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < mask.data.length; i++) {
      imageData.data[i * 4 + 3] = mask.data[i]; // Set alpha channel
    }
    ctx.putImageData(imageData, 0, 0);
    
    status.textContent = '✨ Done! Download ready.';
    status.className = 'success';
    
    return canvas;
    
  } catch (err: any) {
    console.error('Process error:', err);
    status.textContent = `❌ ${err.message}`;
    status.className = 'error';
    return null;
  }
}

// Initialize UI event listeners
document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadModel') as HTMLButtonElement;
  const upload = document.getElementById('upload') as HTMLInputElement;
  const download = document.getElementById('download') as HTMLAnchorElement;
  const output = document.getElementById('output') as HTMLCanvasElement;
    loadBtn.addEventListener('click', () => initModel());
  
  upload.addEventListener('change', async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const canvas = await processImage(file);
    if (canvas) {
      // Display result
      output.width = canvas.width;
      output.height = canvas.height;
      const ctx = output.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0);
      output.style.display = 'block';
      
      // Enable download
      download.href = canvas.toDataURL('image/png');
      download.style.display = 'inline-block';
    }
  });
});

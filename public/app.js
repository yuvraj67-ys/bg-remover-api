// public/app.js
// Background removal using @imgly/background-removal
// CDN import - no build step needed!

import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/dist/imgly-background-removal.min.js';

// DOM Elements
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const preview = document.getElementById('preview');
const download = document.getElementById('download');
const downloadLink = document.getElementById('downloadLink');

// Configuration for @imgly/background-removal
const config = {
  // Model files location (CDN)
  publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.3.0/dist/',
  
  // Progress callback for loading feedback
  progress: (key, current, total) => {
    if (total > 0) {
      progress.style.display = 'block';
      const percent = Math.min(100, Math.round((current / total) * 100));
      progressBar.style.width = `${percent}%`;
      status.textContent = `⏳ Loading AI model: ${percent}%`;
      status.className = 'loading';
    }
  }
};

// Handle selected file
function handleFile(file) {
  // Validate file type
  if (!file || !file.type?.startsWith('image/')) {
    status.textContent = '❌ Please select a valid image file (PNG, JPG, WebP)';
    status.className = 'error';
    return;
  }
  
  // Validate file size (max 10MB for browser processing)
  if (file.size > 10 * 1024 * 1024) {
    status.textContent = '❌ File too large. Please select an image under 10MB';
    status.className = 'error';
    return;
  }
  
  processImage(file);}

// Main processing function
async function processImage(file) {
  status.textContent = '🔄 Removing background...';
  status.className = 'loading';
  progress.style.display = 'block';
  progressBar.style.width = '10%';
  download.style.display = 'none';
  preview.innerHTML = '';
  
  const startTime = Date.now();
  
  try {
    // ✨ MAGIC: Remove background using @imgly
    const blob = await removeBackground(file, config);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    // Create object URL for result
    const resultUrl = URL.createObjectURL(blob);
    const originalUrl = URL.createObjectURL(file);
    
    // Show preview
    preview.innerHTML = `
      <div class="image-box">
        <p>📷 Original</p>
        <img src="${originalUrl}" alt="Original" />
      </div>
      <div class="image-box">
        <p>✨ Result</p>
        <img src="${resultUrl}" alt="Background removed" />
      </div>
    `;
    
    // Enable download
    downloadLink.href = resultUrl;
    download.style.display = 'block';
    
    status.textContent = `✅ Done in ${duration}s! Click to download.`;
    status.className = 'success';
    
  } catch (err) {
    console.error('Background removal error:', err);
    
    let errorMsg = err.message || 'Processing failed';
    
    // User-friendly error messages
    if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('Failed to fetch')) {      errorMsg = '🌐 Network error. Please check your internet connection.\n💡 The AI model (~40MB) downloads on first use.';
    } else if (errorMsg.includes('WebAssembly') || errorMsg.includes('WASM')) {
      errorMsg = '⚙️ Browser compatibility issue. Please use Chrome, Edge, or Firefox (latest version).';
    } else if (errorMsg.includes('memory') || errorMsg.includes('allocation')) {
      errorMsg = '💾 Image too large for browser memory. Try a smaller image (< 2000px width).';
    }
    
    status.textContent = `❌ ${errorMsg}`;
    status.className = 'error';
    
  } finally {
    // Hide progress bar after 1 second delay
    setTimeout(() => {
      progress.style.display = 'none';
      progressBar.style.width = '0%';
    }, 1000);
  }
}

// Setup drag & drop events
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('dragover');
  
  const file = e.dataTransfer?.files?.[0];
  if (file) handleFile(file);
});

// File input change handler (triggered by label click)
fileInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleFile(file);
  // Reset input to allow re-selecting same file
  e.target.value = '';
});

// Initial statusconsole.log('🎨 Background Remover API loaded');
console.log('💡 Tip: First use downloads ~40MB model (cached forever)');

// Check browser compatibility on load
if (typeof WebAssembly !== 'object') {
  status.textContent = '⚠️ WebAssembly not supported. Please update your browser.';
  status.className = 'error';
} else if (typeof SharedArrayBuffer === 'undefined') {
  console.warn('⚠️ SharedArrayBuffer not available (performance may be reduced)');
}

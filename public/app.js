// public/app.js
// Using @imgly/background-removal - designed for browser use [[12]][[19]]

// Import from CDN (no npm install needed for browser)
import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/dist/imgly-background-removal.min.js';

// DOM elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const preview = document.getElementById('preview');
const download = document.getElementById('download');

// Configure @imgly/background-removal
// This library auto-handles WASM, model loading, and caching [[12]]
const config = {
  publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.3.0/dist/',
  progress: (key, current, total) => {
    if (total > 0) {
      progress.style.display = 'block';
      progressBar.style.width = `${Math.round((current / total) * 100)}%`;
      status.textContent = `⏳ Loading: ${Math.round((current / total) * 100)}%`;
      status.className = 'loading';
    }
  }
};

// Handle file selection
function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    status.textContent = '❌ Please select an image file';
    status.className = 'error';
    return;
  }

  processImage(file);
}

// Process image with background removal
async function processImage(file) {
  status.textContent = '🔄 Removing background...';
  status.className = 'loading';
  progress.style.display = 'block';
  progressBar.style.width = '0%';
  download.style.display = 'none';
  
  try {
    // ✅ This is the magic line - @imgly handles everything [[12]][[19]]    const blob = await removeBackground(file, config);
    
    // Create preview
    const url = URL.createObjectURL(blob);
    
    preview.innerHTML = `
      <div class="image-box">
        <p><strong>Original</strong></p>
        <img src="${URL.createObjectURL(file)}" alt="Original" />
      </div>
      <div class="image-box">
        <p><strong>Background Removed</strong></p>
        <img src="${url}" alt="Result" id="resultImage" />
      </div>
    `;
    
    // Enable download
    download.href = url;
    download.style.display = 'inline-block';
    
    status.textContent = '✨ Done! Click to download.';
    status.className = 'success';
    
  } catch (err) {
    console.error('Error:', err);
    status.textContent = `❌ Error: ${err.message || 'Processing failed'}`;
    status.className = 'error';
    
    // Helpful fallback message
    if (err.message?.includes('fetch') || err.message?.includes('network')) {
      status.textContent += '\n💡 Check your internet connection - model downloads on first use';
    }
  } finally {
    progress.style.display = 'none';
  }
}

// Setup drag & drop
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// Show initial status
console.log('✅ Background Remover loaded. Drop an image to start!');

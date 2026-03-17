# 🎨 Background Remover API

Free, browser-based background removal API hosted on Vercel.

## ✨ Features

- 🔒 **100% Client-Side**: Images never leave the browser
- 🆓 **Free on Vercel**: No server costs, no API keys
- 🚀 **Fast**: WebAssembly + ONNX runtime for quick processing
- 📱 **Responsive**: Works on desktop and mobile
- 🎯 **High Quality**: Professional-grade background removal

## 🌐 Live Demo

[https://your-project.vercel.app](https://your-project.vercel.app)

## 🚀 Deploy to Vercel (Free)

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuvraj67-ys/bg-remover-api)

### Option 2: Manual Deploy
```bash
# 1. Clone this repo
git clone https://github.com/yuvraj67-ys/bg-remover-api
cd bg-remover-api

# 2. Install Vercel CLI (if needed)
npm i -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy!
vercel --prod
```

Your API will be live at: `https://your-project.vercel.app`

## 🔧 API Usage

### Web Interface
Visit `/` for the drag-and-drop UI.

### JSON API
```bash
GET https://your-project.vercel.app/api/remove-bg
```

Response:```json
{
  "success": true,
  "name": "Background Remover API",
  "processing": "browser",
  "privacy": "Images never leave the user's device"
}
```

### Client-Side Integration
```html
<!-- Include the library -->
<script type="module">
  import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/dist/imgly-background-removal.min.js';
  
  const file = document.querySelector('input[type="file"]').files[0];
  const blob = await removeBackground(file, {
    publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.3.0/dist/'
  });
  
  // blob contains the PNG with transparent background
</script>
```

## 📋 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 109+ | ✅ Full |
| Edge | 109+ | ✅ Full |
| Firefox | 115+ | ✅ Full |
| Safari | 16+ | ✅ Full |
| Mobile Chrome | Latest | ✅ Full |

> 💡 First use downloads ~40MB model (cached forever in browser storage)

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Or serve static files only
npx serve public -p 3000
```

Open `http://localhost:3000` to test.
## ⚠️ Limitations

- **File Size**: Max 10MB (browser memory constraints)
- **First Load**: ~40MB model download (cached after)
- **Processing Time**: 5-30 seconds depending on image size & device
- **No Server Processing**: All work happens in user's browser

## 🔐 Privacy

This API is **privacy-first**:
- ❌ No images uploaded to any server
- ❌ No tracking or analytics
- ❌ No API keys or accounts required
- ✅ All processing in browser via WebAssembly

## 🤝 Contributing

Found a bug or have an idea? Open an issue or PR!

## 📄 License

MIT License - Free for personal and commercial use.

---

Made with ❤️ by [Your Name](https://github.com/yuvraj67-ys)

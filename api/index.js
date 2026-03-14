const express = require('express');
const cors = require('cors');

const app = express();

// Testing ke liye CORS open rakha hai
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' })); 

app.get('/', (req, res) => {
    res.send("API is running perfectly for imgaura.qzz.io!");
});

app.post('/remove-bg', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 🚀 YAHAN MAIN FIX HAI: Naya Hugging Face Router URL
        const HF_API_URL = "https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4";
        const HF_TOKEN = process.env.HF_API_KEY; 

        if (!HF_TOKEN) {
            return res.status(500).json({ success: false, error: 'API Key is missing in Vercel' });
        }

        const response = await fetch(HF_API_URL, {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/octet-stream" 
            },
            method: "POST",
            body: imageBuffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF Error Details:", errorText); 
            
            if (response.status === 503) {
                return res.status(503).json({ success: false, error: 'AI Model is loading, please wait 15 seconds and try again.' });
            }
            throw new Error(`AI Provider Error: ${response.status}`);
        }

        const resultBuffer = await response.arrayBuffer();
        const outputBase64 = `data:image/png;base64,${Buffer.from(resultBuffer).toString('base64')}`;

        res.status(200).json({ success: true, image: outputBase64 });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});

module.exports = app;

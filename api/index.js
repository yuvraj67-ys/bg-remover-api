const express = require('express');
const cors = require('cors');

const app = express();

// Aapki website ko allow karne ke liye CORS
const corsOptions = {
    origin: ['https://imgaura.qzz.io', 'http://localhost:3000'], // Localhost testing ke liye allow kiya hai
    methods: "POST, GET, OPTIONS",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Image ka size bada ho sakta hai isliye limit 50mb set ki hai
app.use(express.json({ limit: '50mb' })); 

// Basic route check karne ke liye ki API chal rahi hai ya nahi
app.get('/', (req, res) => {
    res.send("API is running perfectly for imgaura.qzz.io!");
});

// Main Background Removal Route
app.post('/remove-bg', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        // Base64 string ko clean karke buffer (binary) mein convert karna
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Hugging Face API ka setup
        const HF_API_URL = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4";
        const HF_TOKEN = process.env.HF_API_KEY; // Vercel se aayega ye token

        if (!HF_TOKEN) {
            return res.status(500).json({ success: false, error: 'API Key is missing in Vercel' });
        }

        // Hugging face ko request bhejna
        const response = await fetch(HF_API_URL, {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: imageBuffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF Error:", errorText);
            
            // Agar model load ho raha ho (Cold start)
            if (response.status === 503) {
                return res.status(503).json({ success: false, error: 'AI Model is loading, please try again in 10 seconds.' });
            }
            throw new Error('Failed to remove background from AI');
        }

        // AI se aayi hui image ko wapas base64 mein convert karna
        const resultBuffer = await response.arrayBuffer();
        const outputBase64 = `data:image/png;base64,${Buffer.from(resultBuffer).toString('base64')}`;

        // Aapki website ko result bhejna
        res.status(200).json({ success: true, image: outputBase64 });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});

// Vercel serverless function export
module.exports = app;

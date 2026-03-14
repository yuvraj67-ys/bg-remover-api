const express = require('express');
const cors = require('cors');
const { client } = require("@gradio/client"); // Naya package

const app = express();

// Testing ke liye CORS open rakha hai
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' })); 

app.get('/', (req, res) => {
    res.send("API is running perfectly with Gradio Client!");
});

app.post('/remove-bg', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        // Base64 ko Blob (File) mein convert karna
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: 'image/jpeg' });

        // 🚀 MASTER HACK: Direct Hugging Face Space ko call karna
        // Ye 100% free hai aur 404 error nahi dega
        const hf_token = process.env.HF_API_KEY;
        const app = await client("briaai/RMBG-1.4", { hf_token });

        // AI ko photo bhejna
        const result = await app.predict("/predict", [blob]);

        if (!result || !result.data || !result.data[0]) {
            throw new Error("AI did not return an image.");
        }

        // Result mein hume image ka ek URL milega
        const imageUrl = result.data[0].url;

        // Uss image ko download karke wapas Base64 mein convert karna aapki website ke liye
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const outputBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

        // Aapki website ko result bhejna
        res.status(200).json({ success: true, image: outputBase64 });

    } catch (error) {
        console.error("Gradio Space Error:", error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});

module.exports = app;

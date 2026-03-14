const express = require('express');
const cors = require('cors');

const app = express();

// Testing ke liye CORS open
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' })); 

app.get('/', (req, res) => {
    res.send("API is running perfectly via Direct HuggingFace Space!");
});

app.post('/remove-bg', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        // 🚀 MASTER HACK: Direct Hugging Face public space ko call karna
        // Ye na 404 dega, na hi HF_TOKEN mangega, ye bilkul free hai!
        const SPACE_URL = "https://briaai-rmbg-1-4.hf.space/api/predict";

        const response = await fetch(SPACE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [imageBase64] // Seedha base64 photo bhej rahe hain
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`AI Space Error: ${response.status} - ${errText}`);
        }

        const jsonResponse = await response.json();

        if (!jsonResponse.data || !jsonResponse.data[0]) {
            throw new Error("AI did not return a valid image.");
        }

        let outputImage = jsonResponse.data[0];

        // Agar result URL format mein aaye, toh use wapas image mein badalna
        if (typeof outputImage === 'object' && outputImage.url) {
            const imgRes = await fetch(outputImage.url);
            const imgBuffer = await imgRes.arrayBuffer();
            outputImage = `data:image/png;base64,${Buffer.from(imgBuffer).toString('base64')}`;
        }

        // Aapki website ko result bhejna
        res.status(200).json({ success: true, image: outputImage });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});

module.exports = app;

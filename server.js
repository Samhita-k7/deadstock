require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get('/', (req, res) => {
  res.json({
    message: 'Dead Stock Exchange backend is running!',
  });
});

app.post('/analyze', upload.single('photo'), async (req, res) => {
  console.log('Photo received:', req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No photo received',
      });
    }

    console.log('Sending image to Gemini...');

    const imageData = fs.readFileSync(req.file.path).toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',

      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: imageData,
          },
        },
        {
          text: `
You are analyzing a product photo for a dead-stock marketplace.

Identify the product visible in the image.

Return ONLY valid JSON in exactly this format:

{
  "product": "specific product name",
  "category": "product category",
  "condition": "New or Used or Unknown",
  "confidence": 0
}

Rules:
- product should be as specific as the image allows.
- category should be simple, such as Stationery, Clothing, Electronics, Grocery, Household, etc.
- condition should be New, Used, or Unknown.
- confidence should be a number from 0 to 100.
- Do not include markdown.
- Do not include explanations.
          `,
        },
      ],
    });

    console.log('Gemini response:', response.text);

    let result;

    try {
      result = JSON.parse(response.text);
    } catch (parseError) {
      console.log('Could not parse Gemini JSON.');

      result = {
        product: response.text,
        category: 'Unknown',
        condition: 'Unknown',
        confidence: 0,
      };
    }

    res.json(result);

    fs.unlink(req.file.path, () => {});
  } catch (error) {
    console.error('Gemini error:', error);

    res.status(500).json({
      error: 'AI analysis failed',
      details: error.message,
    });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('=================================');
  console.log('Dead Stock Exchange backend');
  console.log('Running on port 3000');
  console.log('=================================');
});
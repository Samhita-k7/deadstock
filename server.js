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

async function generateWithRetry(request, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      const status = error.status;

      if (status !== 503 || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay / 1000}s...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

app.get('/', (req, res) => {
  res.json({
    message: 'Dead Stock Exchange backend is running!',
  });
});

const listings = [];

app.post('/upload-image', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No image received',
    });
  }

  console.log('Image uploaded:', req.file.filename);

  res.json({
    filename: req.file.filename,
  });
});

app.post('/listings', (req, res) => {
  const {
    product,
    category,
    condition,
    confidence,
    quantity,
    originalPrice,
    sellingPrice,
    stockAge,
    location,
    latitude,
    longitude,
    image,
  } = req.body;

  const listing = {
    id: `listing-${Date.now()}`,

    product,
    category,
    condition,
    confidence,

    quantity,
    originalPrice,
    sellingPrice,
    stockAge,

    location: location || 'Unknown',
    latitude: latitude ?? null,
    longitude: longitude ?? null,

    image: image || null,
  };

  listings.push(listing);

  console.log('Listing received:', listing);

  res.json({
    success: true,
    listing,
  });
});

app.get('/listings', (req, res) => {
  res.json(listings);
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

    const response = await generateWithRetry({
      model: 'gemini-3.6-flash',

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

app.post('/voice-analyze', upload.single('audio'), async (req, res) => {
  console.log('Audio received:', req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio received',
      });
    }

    console.log('Sending audio to Gemini...');

    const audioData = fs
      .readFileSync(req.file.path)
      .toString('base64');

    const response = await generateWithRetry({
      model: 'gemini-3.6-flash',

      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: audioData,
          },
        },
        {
          text: `
You are extracting stock information from a seller's voice recording.

The seller may speak naturally and may mention:
- quantity
- original price per unit
- selling price per unit
- how long the stock has been sitting

Extract these four fields.

Return ONLY valid JSON in exactly this format:

{
  "quantity": "",
  "originalPrice": "",
  "sellingPrice": "",
  "stockAge": ""
}

Rules:
- quantity should contain only the number of units.
- originalPrice should contain only the number.
- sellingPrice should contain only the number.
- stockAge should be a short phrase such as "6 months", "2 years", or "3 weeks".
- If a value was not mentioned, return an empty string.
- Understand natural speech.
- The seller may say prices in rupees, INR, or casually say things like "fifty rupees".
- Do not include markdown.
- Do not include explanations.
          `,
        },
      ],
    });

    console.log('Gemini voice response:', response.text);

    let result;

    try {
      result = JSON.parse(response.text);
    } catch (parseError) {
      console.log('Could not parse Gemini voice JSON.');

      return res.status(500).json({
        error: 'Could not understand voice response',
      });
    }

    res.json(result);

    fs.unlink(req.file.path, () => {});
  } catch (error) {
    console.error('Voice Gemini error:', error);

    res.status(500).json({
      error: 'Voice analysis failed',
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
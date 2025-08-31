require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origins

// Scraping endpoint
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Validate URL format
    new URL(url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000,
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Basic content extraction (can be improved)
    const title = $('h1').first().text();
    const article = $('p').text();
    
    res.send({ title, article });
  } catch (error) {
    console.error('Error scraping URL:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(404).json({ error: 'Could not connect to the specified website' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `Website returned an error: ${error.response.status}` 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch the article. Please check the URL and try again.' 
    });
  }
});

// Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { article } = req.body;

  if (!article) {
    return res.status(400).json({ error: 'Article text is required' });
  }

  try {
    const prompt = `
      Analyze the following news article for political bias. Identify any loaded language, 
      unbalanced reporting, or other indicators of bias. Provide a summary of the article's 
      main points and a conclusion about its overall neutrality.

      Article:
      ${article}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = await response.text();

    res.send({ analysis });
  } catch (error) {
    console.error('Error analyzing article:', error.message);
    res.status(500).json({ error: 'Failed to analyze the article.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

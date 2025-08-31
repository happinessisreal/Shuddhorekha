require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// User agents to rotate
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:108.0) Gecko/20100101 Firefox/108.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0'
];

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
    const validatedUrl = new URL(url);
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await axios.get(url, {
      headers: {
        'User-Agent': randomUserAgent,
        'Referer': validatedUrl.origin,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1'
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

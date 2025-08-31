const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for React app
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Bangladesh News Analyzer Backend is running!' });
});

// Scrape endpoint to fetch HTML content
app.get('/scrape', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        message: 'Please provide a valid news article URL'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'Please provide a valid URL starting with http:// or https://'
      });
    }

    console.log(`Scraping URL: ${url}`);

    // Fetch HTML content with proper headers to mimic a real browser
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000, // 30 second timeout
      maxRedirects: 5
    });

    // Return the HTML content
    res.json({ 
      html: response.data,
      contentType: response.headers['content-type'],
      status: 'success'
    });

  } catch (error) {
    console.error('Scraping error:', error.message);

    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ 
        error: 'Website not found',
        message: 'The provided URL could not be reached. Please check the URL and try again.'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'The website took too long to respond. Please try again later.'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'HTTP error',
        message: `The website returned an error: ${error.response.status} ${error.response.statusText}`
      });
    }

    res.status(500).json({ 
      error: 'Server error',
      message: 'An unexpected error occurred while fetching the article. Please try again.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Bangladesh News Analyzer Backend running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}`);
  console.log(`Scrape endpoint available at: http://localhost:${PORT}/scrape?url=<URL>`);
});
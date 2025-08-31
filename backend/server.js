const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Bangladeshi news sources whitelist for security
const allowedDomains = [
  'prothomalo.com',
  'bdnews24.com',
  'thedailystar.net',
  'newagebd.net',
  'dhakatribune.com',
  'tbsnews.net',
  'jugantor.com',
  'kalerkantho.com',
  'ittefaq.com.bd',
  'samakal.com',
  'banglanews24.com',
  'risingbd.com',
  'bss.gov.bd'
];

// Helper function to validate URL
const isValidBangladeshiNewsUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (error) {
    return false;
  }
};

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shuddhorekha News Bias Analyzer API',
    version: '1.0.0',
    endpoints: {
      '/scrape': 'POST - Scrape news article content',
      '/health': 'GET - Health check'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a valid news article URL'
      });
    }

    // Validate if it's a Bangladeshi news source
    if (!isValidBangladeshiNewsUrl(url)) {
      return res.status(400).json({ 
        error: 'Invalid news source',
        message: 'Please provide a URL from a recognized Bangladeshi news source',
        allowedDomains: allowedDomains
      });
    }

    console.log(`Scraping URL: ${url}`);

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });

    // Parse HTML content
    const $ = cheerio.load(response.data);
    
    // Extract article content (generic selectors for most news sites)
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() || 
                  $('[class*="title"], [class*="headline"]').first().text().trim();
    
    // Try multiple selectors for article content
    let content = '';
    const contentSelectors = [
      'article',
      '[class*="content"]',
      '[class*="article"]',
      '[class*="story"]',
      '[class*="post-content"]',
      '.entry-content',
      'main p',
      'body p'
    ];

    for (const selector of contentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        content = elements.text().trim();
        if (content.length > 100) break; // Found substantial content
      }
    }

    // Extract metadata
    const author = $('[class*="author"], [rel="author"]').first().text().trim();
    const publishDate = $('[class*="date"], [datetime], time').first().attr('datetime') || 
                       $('[class*="date"], [datetime], time').first().text().trim();
    
    // Remove extra whitespace and clean content
    const cleanContent = content.replace(/\s+/g, ' ').trim();
    const cleanTitle = title.replace(/\s+/g, ' ').trim();

    if (!cleanTitle && !cleanContent) {
      return res.status(400).json({ 
        error: 'No content found',
        message: 'Could not extract article content from the provided URL'
      });
    }

    const scrapedData = {
      url: url,
      title: cleanTitle,
      content: cleanContent,
      author: author,
      publishDate: publishDate,
      scrapedAt: new Date().toISOString(),
      contentLength: cleanContent.length
    };

    console.log(`Successfully scraped: ${cleanTitle.substring(0, 50)}...`);

    res.json({
      success: true,
      data: scrapedData
    });

  } catch (error) {
    console.error('Scraping error:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).json({ 
        error: 'URL not accessible',
        message: 'The provided URL could not be accessed. Please check if the URL is correct and accessible.'
      });
    }

    if (error.response && error.response.status) {
      return res.status(400).json({ 
        error: 'HTTP Error',
        message: `The server returned status ${error.response.status}. The article might not be accessible.`
      });
    }

    res.status(500).json({ 
      error: 'Scraping failed',
      message: 'An error occurred while scraping the article. Please try again.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Shuddhorekha Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Scraping endpoint: http://localhost:${PORT}/scrape`);
});

module.exports = app;
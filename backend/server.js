const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Gemini API prompt and schema for news analysis
const ANALYSIS_PROMPT = `You are an expert media analyst specializing in the Bangladeshi news ecosystem. Analyze the provided news article content for bias, clickbait, and misinformation. Consider the unique context of Bangladeshi media, including political landscape, cultural nuances, and common misinformation patterns.

Please analyze the article and return your assessment in the following JSON format:

{
  "biasScore": number (0-100, where 0 = completely unbiased, 100 = extremely biased),
  "clickbaitScore": number (0-100, where 0 = not clickbait, 100 = pure clickbait),
  "misinformationRisk": number (0-100, where 0 = no risk, 100 = high risk),
  "politicalLeaning": string ("left", "center-left", "center", "center-right", "right", "neutral"),
  "confidenceLevel": number (0-100, confidence in the analysis),
  "keyIssues": [
    {
      "type": string ("bias", "clickbait", "misinformation", "sensationalism"),
      "description": string,
      "severity": string ("low", "medium", "high")
    }
  ],
  "summary": string (brief explanation of the analysis),
  "recommendations": [string] (suggestions for readers)
}

Article content to analyze:`;

// Helper function to clean and extract text from HTML
function extractTextContent(html) {
  const $ = cheerio.load(html);
  
  // Remove script and style elements
  $('script').remove();
  $('style').remove();
  $('nav').remove();
  $('header').remove();
  $('footer').remove();
  $('.advertisement').remove();
  $('.ads').remove();
  $('.social-share').remove();
  
  // Try to find main content areas
  const contentSelectors = [
    'article',
    '.article-content',
    '.post-content',
    '.news-content',
    '.story-content',
    'main',
    '.main-content'
  ];
  
  let mainContent = '';
  for (const selector of contentSelectors) {
    const content = $(selector).text().trim();
    if (content.length > mainContent.length) {
      mainContent = content;
    }
  }
  
  // If no specific content area found, get body text but filter out navigation
  if (!mainContent) {
    mainContent = $('body').text();
  }
  
  // Clean up whitespace and limit length
  return mainContent
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 8000); // Limit to avoid token limits
}

// Scrape and analyze news article
app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Scrape the article
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const articleText = extractTextContent(html);
    
    if (articleText.length < 100) {
      return res.status(400).json({ error: 'Could not extract sufficient content from the article' });
    }
    
    // Analyze with Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `${ANALYSIS_PROMPT}\n\n${articleText}`;
    
    const result = await model.generateContent(prompt);
    const response_text = result.response.text();
    
    // Try to parse JSON from the response
    let analysis;
    try {
      // Look for JSON in the response
      const jsonMatch = response_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return res.status(500).json({ error: 'Failed to parse analysis results' });
    }
    
    // Validate the analysis structure
    const requiredFields = ['biasScore', 'clickbaitScore', 'misinformationRisk', 'politicalLeaning', 'confidenceLevel'];
    for (const field of requiredFields) {
      if (analysis[field] === undefined) {
        return res.status(500).json({ error: `Invalid analysis format: missing ${field}` });
      }
    }
    
    res.json({
      url: url,
      analysis: analysis,
      articleLength: articleText.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).json({ error: 'Unable to access the provided URL' });
    }
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Article not found at the provided URL' });
    }
    
    res.status(500).json({ error: 'Internal server error occurred during analysis' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Shuddhorekha News Bias Analyzer'
  });
});

app.listen(PORT, () => {
  console.log(`Shuddhorekha backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
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

// The /scrape endpoint is no longer needed.
// The analysis endpoint now handles both scraping and analysis.
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Step 1: Scrape the HTML content from the URL
    const validatedUrl = new URL(url);
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const scrapeResponse = await axios.get(url, {
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
    
    const html = scrapeResponse.data;

    // Step 2: Analyze the HTML with Gemini using the specified prompt and schema
    const prompt = `
    You are an expert analyst specializing in the Bangladeshi media ecosystem. You have deep knowledge of local politics (including the most recent political changes), media ownership, and common journalistic practices in the region. Your task is to analyze the provided HTML news article for bias, clickbait, and misinformation with this specific context in mind.
    Instructions:

        Parse the HTML: Extract the main title, body text, and any identifiable publisher (e.g., Prothom Alo, The Daily Star, etc.) or author information.

        Context-Aware Analysis: Perform a comprehensive analysis based on the following. If you lack sufficient information for a thorough analysis (e.g., on media ownership or specific political context), use external searches to find the necessary information.

            Political Leaning: Determine if the article shows a clear leaning towards the ideology of a major political party (e.g., Awami League, BNP, Jamaat-e-Islami, Jatiya Party, NCP) or maintains a neutral/centrist stance. Your analysis must reflect the current political landscape and not assume any single party is "the government." Provide a confidence score (0-100).

            Ownership & Affiliation: Identify the owner of the publication. Analyze their known political affiliations or business interests in Bangladesh that could introduce bias.

            Clickbait Check (Detailed): Evaluate the headline based on multiple criteria.

                Emotional Manipulation: Does the headline use sensationalized, exaggerated, or emotionally charged language (e.g., "Shocking," "Unbelievable," "Miracle") to provoke a strong reaction?

                Curiosity Gap: Does the headline intentionally withhold crucial information to compel the user to click for the answer (e.g., "You won't believe what happened next," "The one secret they don't want you to know")?

                Misleading Content: How well does the headline represent the actual content of the article? Is it a truthful summary or an exaggeration?

                Based on this analysis, provide a clear "Yes" or "No" for isClickbait, a score from 1 (not clickbait) to 10 (extreme clickbait), and a detailed reason.

            Misinformation Check: Scrutinize the article for signs of misinformation, disinformation, or mal-information. Check for unsourced claims, out-of-context quotes, or narratives that align with known disinformation campaigns in Bangladesh. Provide a confidence score for your assessment.

            Bias Indicators: Identify specific examples of bias techniques like loaded language, framing, and omission of key facts.

        Quantify & Summarize: Provide an Overall Bias Score (1-10), a Trustworthiness Rating (1-10), and a detailed reasoning paragraph summarizing your findings in the context of Bangladeshi media.
        Output Format:
        You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON. The JSON structure must be:

    {
      "overallBiasScore": float,
      "politicalLeaning": { "leaning": "Leans Awami League" | "Leans BNP" | "Leans Jamaat-e-Islami" | "Leans Jatiya Party" | "Leans NCP" | "Neutral" | "Other", "confidence": int },
      "ownershipAnalysis": { "owner": "string", "politicalAffiliation": "string", "summary": "string" },
      "clickbaitAnalysis": { "isClickbait": boolean, "score": int, "reason": "string" },
      "misinformationAnalysis": { "containsMisinformation": boolean, "confidence": int, "reason": "string" },
      "keyBiasIndicators": [ { "indicator": "string", "summary": "string" } ],
      "detailedReasoning": "string",
      "trustworthinessRating": float
    }

    Article HTML:
    ${html}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = await response.text();
    
    // Clean the response to ensure it's valid JSON
    const startIndex = analysisText.indexOf('{');
    const endIndex = analysisText.lastIndexOf('}') + 1;
    const jsonString = analysisText.substring(startIndex, endIndex);

    const analysisJson = JSON.parse(jsonString);

    res.json(analysisJson);

  } catch (error) {
    console.error('Error in /api/analyze:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(404).json({ error: 'Could not connect to the specified website' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `Website returned an error: ${error.response.status}` 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze the article. Please check the URL and try again.' 
    });
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

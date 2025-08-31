# Shuddhorekha

**News Bias Analyzer for Bangladesh**

A full-stack web application that analyzes news articles from Bangladeshi media sources for bias, clickbait, and misinformation using AI-powered analysis.

## Features

- 🔍 **URL-based Analysis**: Input URLs from major Bangladeshi news sources
- 🤖 **AI-Powered Detection**: Uses Google's Gemini API for intelligent bias analysis
- 📊 **Visual Analytics**: Interactive charts and visualizations for analysis results
- 🛡️ **Security-First**: Whitelist of trusted Bangladeshi news sources
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

```
Shuddhorekha/
├── backend/          # Node.js/Express server
│   ├── package.json
│   └── server.js     # Main server file with scraping logic
├── frontend/         # React application  
│   ├── public/
│   ├── src/
│   │   ├── App.jsx   # Main React component
│   │   ├── App.css   # Styling
│   │   └── index.js  # React entry point
│   ├── package.json
│   └── .env.example  # Environment variables template
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Add your Gemini API key to `.env`:
   ```
   REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

5. Start the development server:
   ```bash
   npm start
   ```
   
   The app will run on `http://localhost:3000`

## Supported News Sources

- Prothom Alo (prothomalo.com)
- bdnews24.com
- The Daily Star (thedailystar.net)
- New Age Bangladesh (newagebd.net)
- Dhaka Tribune (dhakatribune.com)
- The Business Standard (tbsnews.net)
- Jugantor (jugantor.com)
- Kaler Kantho (kalerkantho.com)
- And more...

## Usage

1. Start both backend and frontend servers
2. Open the application in your browser
3. Enter a URL from a supported Bangladeshi news source
4. Click "Analyze Article" to scrape and analyze the content
5. View the results in the analysis dashboard

## API Documentation

### Backend Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /scrape` - Scrape article content
  - Body: `{ "url": "article_url" }`
  - Returns: Article content and metadata

## Analysis Metrics

The application provides comprehensive analysis including:

- **Overall Bias Score** (0-100): General bias level in the article
- **Clickbait Score** (0-100): Likelihood of clickbait elements
- **Misinformation Risk** (0-100): Potential for spreading misinformation
- **Political Bias Classification**: Left, Center-Left, Center, Center-Right, Right, Neutral
- **Emotional Tone**: Very Negative to Very Positive scale
- **Factual Accuracy Score** (0-100): Estimated factual reliability
- **Source Credibility Score** (0-100): Overall source trustworthiness

## Contributing

This project aims to promote media literacy in Bangladesh. Contributions are welcome!

## License

MIT License
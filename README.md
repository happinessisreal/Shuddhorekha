# Shuddhorekha - Bangladesh News Bias Analyzer

A full-stack web application that analyzes Bangladeshi news articles for bias, clickbait, and misinformation using AI-powered insights.

## Features

- **AI-Powered Analysis**: Uses Google's Gemini API to analyze news articles for bias, political leaning, and misinformation
- **Bangladesh-Specific Context**: Tailored for the Bangladeshi media ecosystem with knowledge of local politics and media ownership
- **Beautiful UI**: Modern, responsive interface built with React and Tailwind CSS
- **Real-time Visualization**: Interactive gauges and charts to display analysis results
- **CORS Proxy**: Node.js backend to bypass browser CORS restrictions when fetching articles

## Project Structure

```
├── backend/           # Node.js/Express proxy server
│   ├── server.js     # Main server file
│   └── package.json  # Backend dependencies
├── frontend/         # React application
│   ├── src/
│   │   ├── App.jsx   # Single-file React application
│   │   └── index.css # Tailwind CSS styles
│   ├── .env          # Environment variables (API keys)
│   └── package.json  # Frontend dependencies
└── README.md         # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

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

   The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Gemini API key:
   - Open `frontend/.env`
   - Replace `your-gemini-api-key-here` with your actual Gemini API key

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Usage

1. Make sure both backend and frontend servers are running
2. Open `http://localhost:5173` in your browser
3. Enter a URL from a Bangladeshi news website (e.g., Prothom Alo, The Daily Star, etc.)
4. Click "Analyze Article" to get AI-powered bias analysis

## Analysis Features

- **Overall Bias Score**: 1-10 rating of article bias
- **Political Leaning**: Analysis of political orientation with confidence score
- **Ownership Analysis**: Information about media ownership and affiliations
- **Clickbait Detection**: Identifies clickbait headlines with reasoning
- **Misinformation Check**: Detects potential misinformation with confidence scoring
- **Bias Indicators**: Specific examples of bias techniques used
- **Trustworthiness Rating**: Overall credibility assessment

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, CORS, Axios
- **AI**: Google Gemini API (gemini-2.5-flash-preview-05-20)

## License

MIT License
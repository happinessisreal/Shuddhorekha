# Shuddhorekha - News Bias Analyzer for Bangladesh

A full-stack web application that analyzes Bangladeshi news articles for bias, clickbait, and misinformation using AI-powered analysis.

## Features

- **URL-based Analysis**: Input any Bangladeshi news article URL for instant analysis
- **Comprehensive Scoring**: Get bias, clickbait, and misinformation risk scores (0-100)
- **Political Leaning Detection**: Visual meter showing article's political orientation
- **Issue Identification**: Detailed breakdown of potential problems in the content
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Bangladesh-focused**: Tailored for the unique media landscape of Bangladesh

## Technology Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Analysis**: Google Gemini API
- **Data Visualization**: Recharts
- **Web Scraping**: Axios + Cheerio

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/happinessisreal/Shuddhorekha.git
   cd Shuddhorekha
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # In the backend directory, edit .env file
   cp .env .env.local
   # Add your Gemini API key to .env.local
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   # In the root directory
   npm run dev
   ```
   The frontend will run on http://localhost:3000

### Usage

1. Open http://localhost:3000 in your browser
2. Enter a Bangladeshi news article URL
3. Click "Analyze Article"
4. View the comprehensive bias analysis results

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/analyze` - Analyze news article
  - Body: `{ "url": "https://example.com/article" }`
  - Returns: Analysis results with bias scores and recommendations

## Contributing

This project is designed to promote media literacy in Bangladesh. Contributions are welcome!

## License

MIT License
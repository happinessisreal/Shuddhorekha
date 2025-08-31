# Shuddhorekha - Bangladesh News Bias Analyzer

A full-stack web application for analyzing news articles from Bangladeshi sources to detect bias, clickbait, and misinformation. This project uses React for the frontend, Node.js/Express for the backend, and the Gemini API for AI-powered content analysis.

## Features

- URL input for any Bangladeshi news article
- Advanced AI analysis of article content
- Visually appealing UI with charts and indicators
- Detailed breakdown of:
  - Overall bias score
  - Trustworthiness rating
  - Political leaning analysis
  - Ownership and affiliation details
  - Clickbait detection
  - Misinformation analysis
  - Key bias indicators

## Tech Stack

- Frontend:
  - React (Single file implementation)
  - Tailwind CSS for styling
  - Custom visualization components
  
- Backend:
  - Node.js
  - Express
  - Axios for HTTP requests

- AI Integration:
  - Google's Gemini API (gemini-2.5-flash-preview-05-20 model)

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

### Setup Steps

1. Clone the repository:
   ```
   git clone https://github.com/happinessisreal/Shuddhorekha.git
   cd Shuddhorekha
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

5. Start the backend server:
   ```
   cd backend
   npm start
   ```

6. Start the frontend development server:
   ```
   cd ../frontend
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter the URL of a Bangladeshi news article in the input field
2. Click "Analyze Article"
3. Wait for the analysis to complete
4. Review the detailed results presented in the UI

## Project Structure

- `/frontend`: Contains the React application (single-file implementation)
- `/backend`: Contains the Express server for proxying requests

## License

MIT

## Disclaimer

This tool is designed for educational and analytical purposes only. The AI analysis should not be considered definitive or authoritative. Always use your own judgment when evaluating news sources.

## Acknowledgements

- Google Generative AI (Gemini)
- React and Tailwind CSS communities
- All contributors to this project
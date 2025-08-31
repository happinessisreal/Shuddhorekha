import React, { useState, useRef } from 'react';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Eye, 
  Globe,
  Search,
  FileText,
  BarChart3,
  Loader
} from 'lucide-react';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  
  const genAI = useRef(null);

  // Initialize Gemini AI
  React.useEffect(() => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
    }
  }, []);

  const handleScrapeAndAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid news article URL');
      return;
    }

    if (!genAI.current) {
      setError('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file');
      return;
    }

    setLoading(true);
    setError('');
    setScrapedData(null);
    setAnalysisResults(null);

    try {
      // Step 1: Scrape the content
      console.log('Scraping URL:', url);
      const scrapeResponse = await axios.post(`${BACKEND_URL}/scrape`, { url });
      const scraped = scrapeResponse.data.data;
      setScrapedData(scraped);
      setActiveTab('content');

      // Step 2: Analyze with Gemini API
      console.log('Starting bias analysis...');
      const model = genAI.current.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Analyze this Bangladeshi news article for bias, clickbait, and misinformation. Respond ONLY with a valid JSON object in this exact format:

{
  "overall_bias_score": <number 0-100>,
  "clickbait_score": <number 0-100>,
  "misinformation_risk": <number 0-100>,
  "political_bias": "<left|center-left|center|center-right|right|neutral>",
  "emotional_tone": "<very-negative|negative|neutral|positive|very-positive>",
  "factual_accuracy": <number 0-100>,
  "source_credibility": <number 0-100>,
  "language_bias_indicators": ["<indicator1>", "<indicator2>"],
  "clickbait_indicators": ["<indicator1>", "<indicator2>"],
  "misinformation_indicators": ["<indicator1>", "<indicator2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "summary": "<brief analysis summary>"
}

Article Title: ${scraped.title}
Article Content: ${scraped.content.substring(0, 2000)}...`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      setAnalysisResults(analysis);
      setActiveTab('analysis');
      
    } catch (error) {
      console.error('Analysis error:', error);
      if (error.response) {
        setError(`Error: ${error.response.data.message || error.response.data.error}`);
      } else if (error.message.includes('JSON')) {
        setError('Failed to parse AI analysis results. Please try again.');
      } else {
        setError(`Analysis failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getBiasColor = (score) => {
    if (score < 30) return '#22c55e'; // Green - Low bias
    if (score < 60) return '#f59e0b'; // Yellow - Medium bias
    return '#ef4444'; // Red - High bias
  };

  const getScoreLabel = (score) => {
    if (score < 30) return 'Low';
    if (score < 60) return 'Medium';
    return 'High';
  };

  // Chart configurations
  const biasChartData = analysisResults ? {
    labels: ['Overall Bias', 'Clickbait', 'Misinformation Risk'],
    datasets: [{
      label: 'Score',
      data: [
        analysisResults.overall_bias_score,
        analysisResults.clickbait_score,
        analysisResults.misinformation_risk
      ],
      backgroundColor: [
        getBiasColor(analysisResults.overall_bias_score),
        getBiasColor(analysisResults.clickbait_score),
        getBiasColor(analysisResults.misinformation_risk)
      ],
      borderColor: '#1f2937',
      borderWidth: 1
    }]
  } : null;

  const credibilityData = analysisResults ? {
    labels: ['Factual Accuracy', 'Source Credibility'],
    datasets: [{
      data: [analysisResults.factual_accuracy, analysisResults.source_credibility],
      backgroundColor: ['#3b82f6', '#8b5cf6'],
      borderColor: '#1f2937',
      borderWidth: 2
    }]
  } : null;

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <Globe className="title-icon" />
            Shuddhorekha
          </h1>
          <p className="app-subtitle">News Bias Analyzer for Bangladesh</p>
        </div>
      </header>

      <main className="main-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <Search size={16} />
            Input URL
          </button>
          <button 
            className={`tab-button ${activeTab === 'content' ? 'active' : ''} ${!scrapedData ? 'disabled' : ''}`}
            onClick={() => scrapedData && setActiveTab('content')}
            disabled={!scrapedData}
          >
            <FileText size={16} />
            Article Content
          </button>
          <button 
            className={`tab-button ${activeTab === 'analysis' ? 'active' : ''} ${!analysisResults ? 'disabled' : ''}`}
            onClick={() => analysisResults && setActiveTab('analysis')}
            disabled={!analysisResults}
          >
            <BarChart3 size={16} />
            Bias Analysis
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'input' && (
            <div className="input-section">
              <div className="input-card">
                <h2>Enter News Article URL</h2>
                <div className="url-input-group">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://prothomalo.com/... or other Bangladeshi news URL"
                    className="url-input"
                    disabled={loading}
                  />
                  <button 
                    onClick={handleScrapeAndAnalyze}
                    disabled={loading || !url.trim()}
                    className="analyze-button"
                  >
                    {loading ? (
                      <>
                        <Loader className="loading-icon" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={16} />
                        Analyze Article
                      </>
                    )}
                  </button>
                </div>
                
                <div className="supported-sources">
                  <h3>Supported News Sources:</h3>
                  <div className="sources-grid">
                    <span>Prothom Alo</span>
                    <span>bdnews24.com</span>
                    <span>The Daily Star</span>
                    <span>New Age</span>
                    <span>Dhaka Tribune</span>
                    <span>TBS News</span>
                    <span>Jugantor</span>
                    <span>Kaler Kantho</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && scrapedData && (
            <div className="content-section">
              <div className="content-card">
                <div className="content-header">
                  <h2>Article Content</h2>
                  <div className="content-meta">
                    <span><Eye size={14} /> {scrapedData.contentLength} characters</span>
                    {scrapedData.author && <span>By {scrapedData.author}</span>}
                    {scrapedData.publishDate && <span>{scrapedData.publishDate}</span>}
                  </div>
                </div>
                
                <div className="article-preview">
                  <h3 className="article-title">{scrapedData.title}</h3>
                  <div className="article-content">
                    {scrapedData.content.substring(0, 1000)}
                    {scrapedData.content.length > 1000 && '...'}
                  </div>
                  <div className="article-url">
                    <strong>Source:</strong> <a href={scrapedData.url} target="_blank" rel="noopener noreferrer">
                      {scrapedData.url}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && analysisResults && (
            <div className="analysis-section">
              {/* Overall Scores */}
              <div className="scores-overview">
                <div className="score-card">
                  <div className="score-header">
                    <AlertTriangle size={20} />
                    <span>Overall Bias</span>
                  </div>
                  <div className="score-value" style={{color: getBiasColor(analysisResults.overall_bias_score)}}>
                    {analysisResults.overall_bias_score}%
                  </div>
                  <div className="score-label">{getScoreLabel(analysisResults.overall_bias_score)}</div>
                </div>

                <div className="score-card">
                  <div className="score-header">
                    <Eye size={20} />
                    <span>Clickbait</span>
                  </div>
                  <div className="score-value" style={{color: getBiasColor(analysisResults.clickbait_score)}}>
                    {analysisResults.clickbait_score}%
                  </div>
                  <div className="score-label">{getScoreLabel(analysisResults.clickbait_score)}</div>
                </div>

                <div className="score-card">
                  <div className="score-header">
                    <XCircle size={20} />
                    <span>Misinformation</span>
                  </div>
                  <div className="score-value" style={{color: getBiasColor(analysisResults.misinformation_risk)}}>
                    {analysisResults.misinformation_risk}%
                  </div>
                  <div className="score-label">{getScoreLabel(analysisResults.misinformation_risk)}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-section">
                <div className="chart-container">
                  <h3>Bias Analysis Breakdown</h3>
                  {biasChartData && (
                    <Bar 
                      data={biasChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          title: { display: false }
                        },
                        scales: {
                          y: { beginAtZero: true, max: 100 }
                        }
                      }}
                    />
                  )}
                </div>

                <div className="chart-container">
                  <h3>Credibility Metrics</h3>
                  {credibilityData && (
                    <Doughnut 
                      data={credibilityData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="detailed-analysis">
                <div className="analysis-card">
                  <h3>Political Bias Classification</h3>
                  <div className={`bias-indicator ${analysisResults.political_bias}`}>
                    {analysisResults.political_bias.toUpperCase()}
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>Emotional Tone</h3>
                  <div className={`tone-indicator ${analysisResults.emotional_tone}`}>
                    {analysisResults.emotional_tone.replace('-', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>Summary</h3>
                  <p>{analysisResults.summary}</p>
                </div>
              </div>

              {/* Indicators and Recommendations */}
              <div className="indicators-section">
                <div className="indicators-grid">
                  <div className="indicator-card">
                    <h4>🔍 Language Bias Indicators</h4>
                    <ul>
                      {analysisResults.language_bias_indicators.map((indicator, index) => (
                        <li key={index}>{indicator}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="indicator-card">
                    <h4>🎯 Clickbait Indicators</h4>
                    <ul>
                      {analysisResults.clickbait_indicators.map((indicator, index) => (
                        <li key={index}>{indicator}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="indicator-card">
                    <h4>⚠️ Misinformation Indicators</h4>
                    <ul>
                      {analysisResults.misinformation_indicators.map((indicator, index) => (
                        <li key={index}>{indicator}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="recommendations-section">
                  <h3>📋 Recommendations</h3>
                  <div className="recommendations">
                    {analysisResults.recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <CheckCircle size={16} />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <XCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Shuddhorekha - Promoting media literacy in Bangladesh</p>
      </footer>
    </div>
  );
}

export default App;
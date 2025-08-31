import React, { useState } from 'react';

// Main App Component
function App() {
  // State
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Handle URL input change
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  // Handle form submission
  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      // Reset states
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Step 1: Call backend for scraping and analysis in one go
      setStep(1); // We can simplify the loading message now
      
      const analyzeUrl = 'http://localhost:3001/api/analyze';
      
      const analyzeResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }), // Send the URL
      });
      
      const responseData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(responseData.error || 'Failed to analyze article');
      }
      
      // The backend now returns the final JSON object directly
      setResult(responseData);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-700 dark:text-primary-400 mb-4">
            Bangladesh News Analyzer
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400">
            Analyze Bangladeshi news articles for bias, clickbait, and misinformation
          </p>
        </header>
        
        {/* Input Section */}
        <div className="card p-6 mb-10">
          <form onSubmit={handleAnalyze}>
            <div className="mb-6">
              <label htmlFor="url-input" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
                Enter a Bangladeshi news article URL:
              </label>
              <input
                id="url-input"
                type="url"
                className="input-field"
                placeholder="https://www.thedailystar.net/article-example"
                value={url}
                onChange={handleUrlChange}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Article'}
            </button>
          </form>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="card p-6 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary-500 animate-spin-slow rounded-full"></div>
              </div>
              <p className="text-xl font-medium mb-2">
                {step === 1 ? 'Step 1/2: Fetching article content...' : 'Step 2/2: Analyzing with AI...'}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-center">
                {step === 1 
                  ? 'Retrieving article data from the specified URL' 
                  : 'Processing content with our AI analysis engine'}
              </p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="card border-l-4 border-red-500 p-6 animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Analysis Failed</h3>
                <p className="mt-1 text-red-700 dark:text-red-300">{error}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Please check the URL and try again, or try a different article.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              Analysis Results
            </h2>
            
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Bias Score */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                  Overall Bias Score
                </h3>
                <GaugeChart value={result.overallBiasScore} />
                <p className="mt-4 text-center text-slate-600 dark:text-slate-400">
                  {interpretBiasScore(result.overallBiasScore)}
                </p>
              </div>
              
              {/* Trustworthiness Rating */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                  Trustworthiness Rating
                </h3>
                <GaugeChart value={result.trustworthinessRating} type="trustworthiness" />
                <p className="mt-4 text-center text-slate-600 dark:text-slate-400">
                  {interpretTrustworthiness(result.trustworthinessRating)}
                </p>
              </div>
            </div>
            
            {/* Political Leaning */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Political Leaning
              </h3>
              <PoliticalLeaningMeter 
                leaning={result.politicalLeaning.leaning} 
                confidence={result.politicalLeaning.confidence}
              />
            </div>
            
            {/* Ownership Analysis */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Ownership & Affiliation Analysis
              </h3>
              <div className="mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Owner:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{result.ownershipAnalysis.owner}</span>
              </div>
              <div className="mb-4">
                <span className="font-medium text-slate-700 dark:text-slate-300">Political Affiliation:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{result.ownershipAnalysis.politicalAffiliation}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300">{result.ownershipAnalysis.summary}</p>
              </div>
            </div>
            
            {/* Misinformation Analysis */}
            <div className={`card p-6 ${result.misinformationAnalysis.containsMisinformation ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {result.misinformationAnalysis.containsMisinformation ? (
                    <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
                    Misinformation Analysis
                  </h3>
                  <div className="mb-3 flex items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">Contains Misinformation:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      result.misinformationAnalysis.containsMisinformation 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {result.misinformationAnalysis.containsMisinformation ? 'Yes' : 'No'}
                    </span>
                    <span className="ml-2 text-slate-500 dark:text-slate-400">
                      (Confidence: {result.misinformationAnalysis.confidence}%)
                    </span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300">{result.misinformationAnalysis.reason}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clickbait Analysis */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Clickbait Analysis
              </h3>
              <div className="flex items-center mb-4">
                <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">Clickbait Level:</span>
                <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{
                      width: `${result.clickbaitAnalysis.score * 10}%`,
                      backgroundColor: getClickbaitColor(result.clickbaitAnalysis.score)
                    }}
                  ></div>
                </div>
                <span className="ml-2 font-medium">{result.clickbaitAnalysis.score}/10</span>
              </div>
              <div className="flex items-center mb-4">
                <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">Is Clickbait:</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  result.clickbaitAnalysis.isClickbait 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {result.clickbaitAnalysis.isClickbait ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300">{result.clickbaitAnalysis.reason}</p>
              </div>
            </div>
            
            {/* Key Bias Indicators */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Key Bias Indicators
              </h3>
              <ul className="space-y-4">
                {result.keyBiasIndicators.map((indicator, index) => (
                  <li key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      {indicator.indicator}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">{indicator.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* AI Summary */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Detailed Analysis
              </h3>
              <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-lg border-l-4 border-primary-500">
                <p className="text-slate-700 dark:text-slate-300 italic">{result.detailedReasoning}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Helper Components =====

// GaugeChart Component
function GaugeChart({ value, type = 'bias' }) {
  // Ensure value is between 1 and 10
  const normalizedValue = Math.max(1, Math.min(10, value));
  // Convert to percentage for the gauge (0-180 degrees)
  const percentage = (normalizedValue - 1) / 9 * 180;
  
  // Get color based on value and type
  const getColor = () => {
    if (type === 'bias') {
      // For bias: lower is better (green), higher is worse (red)
      if (value <= 3) return '#10B981'; // Green
      if (value <= 6) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    } else {
      // For trustworthiness: higher is better (green), lower is worse (red)
      if (value >= 7) return '#10B981'; // Green
      if (value >= 4) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background semi-circle */}
        <div className="absolute bottom-0 left-0 right-0 h-48 w-48 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        
        {/* Colored arc based on value */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-48 w-48 rounded-full"
          style={{
            background: `conic-gradient(${getColor()} ${percentage}deg, transparent ${percentage}deg)`,
            transform: 'rotate(-180deg)',
          }}
        ></div>
        
        {/* White inner circle to create the gauge arc */}
        <div className="absolute bottom-0 left-4 right-4 h-40 w-40 bg-white dark:bg-slate-800 rounded-full"></div>
      </div>
      
      {/* Value display */}
      <div className="mt-2 text-2xl font-bold" style={{ color: getColor() }}>{value.toFixed(1)}</div>
      <div className="flex justify-between w-full mt-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">1</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">10</span>
      </div>
    </div>
  );
}

// PoliticalLeaningMeter Component
function PoliticalLeaningMeter({ leaning, confidence }) {
  // Map different leanings to positions on the meter
  const getLeaningPosition = () => {
    switch(leaning) {
      case 'Leans Awami League': return 0;
      case 'Leans BNP': return 100;
      case 'Leans Jamaat-e-Islami': return 100;
      case 'Leans Jatiya Party': return 40;
      case 'Leans NCP': return 70;
      case 'Neutral': return 50;
      case 'Other': return 50;
      default: return 50;
    }
  };
  
  // Get color for the leaning indicator
  const getLeaningColor = () => {
    switch(leaning) {
      case 'Leans Awami League': return '#3182CE'; // Blue
      case 'Leans BNP': return '#E53E3E'; // Red
      case 'Leans Jamaat-e-Islami': return '#2C7A7B'; // Teal
      case 'Leans Jatiya Party': return '#805AD5'; // Purple
      case 'Leans NCP': return '#DD6B20'; // Orange
      case 'Neutral': return '#718096'; // Gray
      case 'Other': return '#4A5568'; // Dark gray
      default: return '#718096';
    }
  };
  
  const position = getLeaningPosition();
  const color = getLeaningColor();
  
  return (
    <div className="space-y-4">
      {/* Party affiliations */}
      <div className="flex justify-between text-sm">
        <span className="font-medium text-blue-600 dark:text-blue-400">Awami League</span>
        <span className="font-medium text-slate-500 dark:text-slate-400">Neutral</span>
        <span className="font-medium text-red-600 dark:text-red-400">BNP</span>
      </div>
      
      {/* Meter bar */}
      <div className="relative h-2 bg-gradient-to-r from-blue-500 via-slate-400 to-red-500 rounded-full">
        {/* Position indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white dark:border-slate-800 shadow"
          style={{ 
            backgroundColor: color,
            left: `${position}%`,
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
      </div>
      
      {/* Leaning and confidence */}
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full font-medium text-slate-800 dark:text-slate-200">
          {leaning} <span className="text-slate-500 dark:text-slate-400 text-sm">(Confidence: {confidence}%)</span>
        </span>
      </div>
    </div>
  );
}

// Utility functions for interpreting scores
function interpretBiasScore(score) {
  if (score <= 3) return 'Minimal bias detected';
  if (score <= 6) return 'Moderate bias detected';
  return 'Significant bias detected';
}

function interpretTrustworthiness(score) {
  if (score >= 7) return 'Highly trustworthy content';
  if (score >= 4) return 'Moderately trustworthy content';
  return 'Low trustworthiness content';
}

function getClickbaitColor(score) {
  if (score <= 3) return '#10B981'; // Green
  if (score <= 6) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

export default App;

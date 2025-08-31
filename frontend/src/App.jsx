import { useState } from 'react'

// GaugeChart Component
const GaugeChart = ({ score, title, maxScore = 10 }) => {
  const percentage = (score / maxScore) * 100;
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  
  // Color based on score
  const getColor = (score) => {
    if (score <= 3) return '#10b981'; // Green
    if (score <= 6) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16">
        <svg className="w-32 h-16" viewBox="0 0 100 50">
          {/* Background arc */}
          <path
            d="M 10,50 A 40,40 0 0,1 90,50"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress arc */}
          <path
            d="M 10,50 A 40,40 0 0,1 90,50"
            stroke={getColor(score)}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-2xl font-bold text-slate-700">{score.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 mt-2 text-center">{title}</span>
    </div>
  );
};

// Political Leaning Meter Component
const PoliticalLeaningMeter = ({ leaning, confidence }) => {
  const getPosition = (leaning) => {
    const positions = {
      'Leans Awami League': 20,
      'Leans BNP': 80,
      'Leans Jamaat-e-Islami': 90,
      'Leans Jatiya Party': 40,
      'Leans NCP': 60,
      'Neutral': 50,
      'Other': 50
    };
    return positions[leaning] || 50;
  };

  const getColor = (leaning) => {
    const colors = {
      'Leans Awami League': '#22c55e',
      'Leans BNP': '#3b82f6',
      'Leans Jamaat-e-Islami': '#8b5cf6',
      'Leans Jatiya Party': '#f59e0b',
      'Leans NCP': '#ef4444',
      'Neutral': '#6b7280',
      'Other': '#6b7280'
    };
    return colors[leaning] || '#6b7280';
  };

  const position = getPosition(leaning);
  const color = getColor(leaning);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>Left</span>
        <span>Center</span>
        <span>Right</span>
      </div>
      <div className="relative h-6 bg-slate-200 rounded-full">
        <div 
          className="absolute top-0 h-6 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            left: `${position - 2}%`, 
            width: '4%',
            backgroundColor: color 
          }}
        />
      </div>
      <div className="mt-2 text-center">
        <span className="text-sm font-medium text-slate-700">{leaning}</span>
        <span className="text-xs text-slate-500 ml-2">({confidence}% confidence)</span>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Step 1: Fetch HTML content from backend
      setCurrentStep('Step 1/2: Fetching article content...');
      
      const scrapeResponse = await fetch(`http://localhost:3001/scrape?url=${encodeURIComponent(url)}`);
      
      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.json();
        throw new Error(errorData.message || 'Failed to fetch article');
      }

      const { html } = await scrapeResponse.json();

      // Step 2: Analyze with Gemini AI
      setCurrentStep('Step 2/2: Analyzing with AI...');

      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
      }

      const prompt = `You are an expert analyst specializing in the Bangladeshi media ecosystem. You have deep knowledge of local politics (including the most recent political changes), media ownership, and common journalistic practices in the region. Your task is to analyze the provided HTML news article for bias, clickbait, and misinformation with this specific context in mind.

Instructions:

1. Parse the HTML: Extract the main title, body text, and any identifiable publisher (e.g., Prothom Alo, The Daily Star, etc.) or author information.

2. Context-Aware Analysis: Perform a comprehensive analysis based on the following:

   Political Leaning: Determine if the article shows a clear leaning towards the ideology of a major political party (e.g., Awami League, BNP, Jamaat-e-Islami, Jatiya Party, NCP) or maintains a neutral/centrist stance. Your analysis must reflect the current political landscape and not assume any single party is "the government." Provide a confidence score (0-100).

   Ownership & Affiliation: Identify the owner of the publication. Analyze their known political affiliations or business interests in Bangladesh that could introduce bias.

   Clickbait Check: Evaluate the headline for clickbait characteristics. Rate its clickbait level (1-10).

   Misinformation Check: Scrutinize the article for signs of misinformation, disinformation, or mal-information. Check for unsourced claims, out-of-context quotes, or narratives that align with known disinformation campaigns in Bangladesh. Provide a confidence score for your assessment.

   Bias Indicators: Identify specific examples of bias techniques like loaded language, framing, and omission of key facts.

3. Quantify & Summarize: Provide an Overall Bias Score (1-10), a Trustworthiness Rating (1-10), and a detailed reasoning paragraph summarizing your findings in the context of Bangladeshi media.

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

Article HTML to analyze:
${html}`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!geminiResponse.ok) {
        throw new Error('Failed to analyze article with AI');
      }

      const geminiData = await geminiResponse.json();
      const analysisText = geminiData.candidates[0].content.parts[0].text;
      
      // Parse JSON from Gemini response
      const analysisResults = JSON.parse(analysisText);
      setResults(analysisResults);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Bangladesh News Analyzer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analyze Bangladeshi news articles for bias, clickbait, and misinformation using AI-powered insights
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a news article URL (e.g., from Prothom Alo, The Daily Star, etc.)"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Analyzing...
                </>
              ) : (
                'Analyze Article'
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-4">
              <LoadingSpinner />
              <span className="text-slate-600 font-medium">{currentStep}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Analysis Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            {/* Overview Gauges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Analysis Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GaugeChart
                  score={results.overallBiasScore}
                  title="Overall Bias Score"
                />
                <GaugeChart
                  score={results.trustworthinessRating}
                  title="Trustworthiness Rating"
                />
              </div>
            </div>

            {/* Political Leaning */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Political Leaning Analysis</h3>
              <PoliticalLeaningMeter
                leaning={results.politicalLeaning.leaning}
                confidence={results.politicalLeaning.confidence}
              />
            </div>

            {/* Analysis Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ownership Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0h3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Ownership & Affiliation
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-slate-700">Owner:</span>
                    <span className="ml-2 text-slate-600">{results.ownershipAnalysis.owner}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Political Affiliation:</span>
                    <span className="ml-2 text-slate-600">{results.ownershipAnalysis.politicalAffiliation}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Summary:</span>
                    <p className="mt-1 text-slate-600">{results.ownershipAnalysis.summary}</p>
                  </div>
                </div>
              </div>

              {/* Misinformation Analysis */}
              <div className={`rounded-xl shadow-lg p-6 ${results.misinformationAnalysis.containsMisinformation ? 'bg-red-50 border border-red-200' : 'bg-white'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {results.misinformationAnalysis.containsMisinformation ? (
                    <>
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-800">Misinformation Detected</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-800">Misinformation Check</span>
                    </>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      results.misinformationAnalysis.containsMisinformation 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {results.misinformationAnalysis.containsMisinformation ? 'Yes' : 'No'}
                    </span>
                    <span className="text-sm text-slate-500">
                      {results.misinformationAnalysis.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-slate-600">{results.misinformationAnalysis.reason}</p>
                </div>
              </div>

              {/* Clickbait Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Clickbait Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      results.clickbaitAnalysis.isClickbait 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {results.clickbaitAnalysis.isClickbait ? 'Yes' : 'No'}
                    </span>
                    <span className="text-sm text-slate-500">
                      Score: {results.clickbaitAnalysis.score}/10
                    </span>
                  </div>
                  <p className="text-slate-600">{results.clickbaitAnalysis.reason}</p>
                </div>
              </div>

              {/* Key Bias Indicators */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Key Bias Indicators
                </h3>
                {results.keyBiasIndicators.length > 0 ? (
                  <div className="space-y-3">
                    {results.keyBiasIndicators.map((indicator, index) => (
                      <div key={index} className="border-l-4 border-purple-400 pl-4">
                        <h4 className="font-semibold text-slate-700">{indicator.indicator}</h4>
                        <p className="text-slate-600 text-sm mt-1">{indicator.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No significant bias indicators detected.</p>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Analysis Summary
              </h3>
              <blockquote className="text-slate-700 italic border-l-4 border-indigo-400 pl-4 bg-white/50 rounded-r-lg p-4">
                "{results.detailedReasoning}"
              </blockquote>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
        `
      }} />
    </div>
  );
}

export default App;

import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Color schemes for charts
const POLITICAL_COLORS = {
  'left': '#EF4444',
  'center-left': '#F97316', 
  'center': '#8B5CF6',
  'center-right': '#06B6D4',
  'right': '#3B82F6',
  'neutral': '#6B7280'
};

// Gauge Chart Component
const GaugeChart = ({ value, title, color, max = 100 }) => {
  const data = [
    { name: title, value: value, fill: color },
    { name: 'remaining', value: max - value, fill: '#E5E7EB' }
  ];

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <div className="relative w-32 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={30}
              outerRadius={60}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
    </div>
  );
};

GaugeChart.propTypes = {
  value: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  max: PropTypes.number
};

// Political Leaning Meter Component
const PoliticalLeaningMeter = ({ leaning }) => {
  const positions = {
    'left': 10,
    'center-left': 30,
    'center': 50,
    'center-right': 70,
    'right': 90,
    'neutral': 50
  };

  const position = positions[leaning] || 50;
  const color = POLITICAL_COLORS[leaning] || '#6B7280';

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Political Leaning</h3>
      <div className="relative">
        <div className="w-full h-6 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full"></div>
        <div 
          className="absolute top-0 w-4 h-6 bg-white border-2 rounded-full transform -translate-x-1/2"
          style={{ left: `${position}%`, borderColor: color }}
        ></div>
        <div className="flex justify-between text-xs mt-2 text-gray-600">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
        <div className="text-center mt-2">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: color }}>
            {leaning.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

PoliticalLeaningMeter.propTypes = {
  leaning: PropTypes.string.isRequired
};

// Issues List Component
const IssuesList = ({ issues }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bias': return '⚖️';
      case 'clickbait': return '🎯';
      case 'misinformation': return '⚠️';
      case 'sensationalism': return '🔥';
      default: return '📰';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Key Issues Identified</h3>
      {issues && issues.length > 0 ? (
        issues.map((issue, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
            <div className="flex items-start space-x-2">
              <span className="text-lg">{getTypeIcon(issue.type)}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium capitalize">{issue.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm">{issue.description}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 italic">No major issues detected</p>
      )}
    </div>
  );
};

IssuesList.propTypes = {
  issues: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired
  }))
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bangladesh-green"></div>
    <span className="text-lg text-gray-700">Analyzing article...</span>
  </div>
);

// Main App Component
const App = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeArticle = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/analyze', { url });
      setResult(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred while analyzing the article';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-bangladesh-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bangladesh-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🇧🇩</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shuddhorekha</h1>
                <p className="text-sm text-gray-600">News Bias Analyzer for Bangladesh</p>
              </div>
            </div>
            {result && (
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 bg-bangladesh-green text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Input Form */}
        {!result && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Analyze News Article</h2>
                <p className="text-gray-600">
                  Enter a Bangladeshi news article URL to analyze for bias, clickbait, and misinformation
                </p>
              </div>

              <form onSubmit={analyzeArticle} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    News Article URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/news-article"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bangladesh-green focus:border-transparent transition-colors"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-2">⚠️</span>
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="w-full py-3 px-6 bg-bangladesh-green text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Analyze Article'}
                </button>
              </form>

              {loading && (
                <div className="mt-8 text-center">
                  <LoadingSpinner />
                  <p className="text-sm text-gray-600 mt-4">
                    This may take a few seconds as we fetch and analyze the article content...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <div className="space-y-8">
            {/* Article Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <span className="text-sm text-gray-500">
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Analyzed URL:</p>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bangladesh-green hover:underline break-all"
                >
                  {result.url}
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Article length: {result.articleLength} characters
                </p>
              </div>
            </div>

            {/* Score Gauges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Analysis Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GaugeChart 
                  value={result.analysis.biasScore} 
                  title="Bias Score" 
                  color="#EF4444"
                />
                <GaugeChart 
                  value={result.analysis.clickbaitScore} 
                  title="Clickbait Score" 
                  color="#F59E0B"
                />
                <GaugeChart 
                  value={result.analysis.misinformationRisk} 
                  title="Misinformation Risk" 
                  color="#DC2626"
                />
              </div>
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-600">Confidence Level:</span>
                  <span className="font-bold text-lg text-bangladesh-green">
                    {result.analysis.confidenceLevel}%
                  </span>
                </div>
              </div>
            </div>

            {/* Political Leaning */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <PoliticalLeaningMeter leaning={result.analysis.politicalLeaning} />
            </div>

            {/* Issues Identified */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <IssuesList issues={result.analysis.keyIssues} />
            </div>

            {/* Summary and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Summary</h3>
                <p className="text-gray-700 leading-relaxed">{result.analysis.summary}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations for Readers</h3>
                {result.analysis.recommendations && result.analysis.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {result.analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-bangladesh-green font-bold">•</span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No specific recommendations provided</p>
                )}
              </div>
            </div>

            {/* Detailed Breakdown Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Bias Score', value: result.analysis.biasScore, fill: '#EF4444' },
                    { name: 'Clickbait Score', value: result.analysis.clickbaitScore, fill: '#F59E0B' },
                    { name: 'Misinformation Risk', value: result.analysis.misinformationRisk, fill: '#DC2626' },
                    { name: 'Confidence Level', value: result.analysis.confidenceLevel, fill: '#10B981' }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              <strong>Shuddhorekha</strong> - Promoting media literacy and transparent journalism in Bangladesh
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This tool uses AI analysis and should be used as a guide alongside critical thinking
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
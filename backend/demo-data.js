// demo-data.js - Demo data for testing the complete application workflow

const mockArticleData = {
  url: "https://www.prothomalo.com/bangladesh/district/demo-article",
  title: "রাজধানীতে যানজট কমাতে নতুন পরিকল্পনা",
  content: "ঢাকা শহরের ক্রমবর্ধমান যানজট সমস্যা সমাধানে সরকার নতুন একটি পরিকল্পনা গ্রহণ করেছে। এই পরিকল্পনায় রয়েছে নতুন মেট্রো লাইন নির্মাণ, বাস র‍্যাপিড ট্রানজিট সিস্টেম চালু এবং প্রাইভেট গাড়ির সংখ্যা নিয়ন্ত্রণ। নগর পরিকল্পনাবিদরা বলছেন, এই উদ্যোগ সফল হলে ঢাকার যানজট সমস্যার স্থায়ী সমাধান হতে পারে। তবে বিশেষজ্ঞরা মনে করেন, শুধু অবস্থাকাঠামো উন্নয়ন নয়, জনসচেতনতা বৃদ্ধিও প্রয়োজন।",
  author: "প্রতিবেদক",
  publishDate: "2024-01-15T10:30:00Z",
  scrapedAt: new Date().toISOString(),
  contentLength: 350
};

const mockAnalysisResults = {
  overall_bias_score: 25,
  clickbait_score: 15,
  misinformation_risk: 10,
  political_bias: "center",
  emotional_tone: "neutral",
  factual_accuracy: 85,
  source_credibility: 90,
  language_bias_indicators: [
    "Neutral language usage",
    "Balanced perspective presentation"
  ],
  clickbait_indicators: [
    "Informative headline",
    "No sensational language"
  ],
  misinformation_indicators: [
    "Credible source",
    "Factual reporting style"
  ],
  recommendations: [
    "Article shows low bias and high credibility",
    "Consider cross-referencing with other sources for complete coverage",
    "Good example of balanced reporting"
  ],
  summary: "This article demonstrates balanced reporting on urban planning with minimal bias. The content is factual and well-sourced, making it a reliable piece of journalism."
};

module.exports = {
  mockArticleData,
  mockAnalysisResults
};
import express from 'express';
import {
  getPersonalizedRecommendations,
  getContentRecommendations,
  getGenreRecommendations,
  getTrendingPredictions,
  searchWithAI,
  analyzeUserPreferences,
  generateWatchSummary,
  getWatchlistSuggestions,
  getNextEpisodePrediction,
  analyzeSentiment,
  detectMood,
  getHeartRateBasedRecommendations,
  analyzeViewingPatterns,
  predictChurn,
  generatePlaylist,
  getContentAnalysis,
  improveSearchQuery,
  chatWithAI,
  getChatHistory,
  getMoodRecommendations
} from '../controllers/aiController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const aiLimiter = rateLimiter({ windowMs: 60000, maxRequests: 60 });

/**
 * @route GET /api/ai/recommendations
 * @desc Get personalized AI-powered recommendations for user
 * @access Private
 */
router.get('/recommendations', verifyToken, aiLimiter, getPersonalizedRecommendations);

/**
 * @route GET /api/ai/recommendations/content/:contentId
 * @desc Get AI recommendations based on specific content
 * @access Public
 */
router.get('/recommendations/content/:contentId', optionalAuth, aiLimiter, getContentRecommendations);

/**
 * @route GET /api/ai/recommendations/genre/:genre
 * @desc Get recommendations for specific genre
 * @access Public
 */
router.get('/recommendations/genre/:genre', optionalAuth, aiLimiter, getGenreRecommendations);

/**
 * @route GET /api/ai/trending
 * @desc Get AI-predicted trending content
 * @access Public
 */
router.get('/trending', aiLimiter, getTrendingPredictions);

/**
 * @route GET /api/ai/search
 * @desc Intelligent search with AI understanding
 * @access Public
 */
router.get('/search', optionalAuth, aiLimiter, searchWithAI);

/**
 * @route GET /api/ai/search/improve
 * @desc Improve search query using AI
 * @access Public
 */
router.get('/search/improve', optionalAuth, aiLimiter, improveSearchQuery);

/**
 * @route GET /api/ai/preferences
 * @desc Analyze and get user preferences summary
 * @access Private
 */
router.get('/preferences', verifyToken, aiLimiter, analyzeUserPreferences);

/**
 * @route GET /api/ai/watch-summary
 * @desc Generate AI summary of watch history
 * @access Private
 */
router.get('/watch-summary', verifyToken, aiLimiter, generateWatchSummary);

/**
 * @route GET /api/ai/watchlist-suggestions
 * @desc Get AI suggestions to enhance watchlist
 * @access Private
 */
router.get('/watchlist-suggestions', verifyToken, aiLimiter, getWatchlistSuggestions);

/**
 * @route GET /api/ai/next-episode
 * @desc Predict if user will watch next episode
 * @access Private
 */
router.get('/next-episode', verifyToken, aiLimiter, getNextEpisodePrediction);

/**
 * @route POST /api/ai/sentiment
 * @desc Analyze sentiment of content reviews/comments
 * @access Private
 */
router.post('/sentiment', verifyToken, aiLimiter, analyzeSentiment);

/**
 * @route POST /api/ai/mood
 * @desc Detect user mood from interactions and recommend
 * @access Private
 */
router.post('/mood', verifyToken, aiLimiter, detectMood);

/**
 * @route GET /api/ai/mood-recommendations
 * @desc Get recommendations based on current mood
 * @access Private
 */
router.get('/mood-recommendations', verifyToken, aiLimiter, getMoodRecommendations);

/**
 * @route GET /api/ai/patterns
 * @desc Analyze user's viewing patterns
 * @access Private
 */
router.get('/patterns', verifyToken, aiLimiter, analyzeViewingPatterns);

/**
 * @route GET /api/ai/churn-prediction
 * @desc Predict churn risk and get retention suggestions
 * @access Private
 */
router.get('/churn-prediction', verifyToken, aiLimiter, predictChurn);

/**
 * @route POST /api/ai/playlist
 * @desc Generate AI-curated playlist
 * @access Private
 */
router.post('/playlist', verifyToken, aiLimiter, generatePlaylist);

/**
 * @route POST /api/ai/content-analysis
 * @desc Get detailed AI analysis of content
 * @access Public
 */
router.post('/content-analysis', optionalAuth, aiLimiter, getContentAnalysis);

/**
 * @route POST /api/ai/chat
 * @desc Chat with AI assistant about content
 * @access Private
 */
router.post('/chat', verifyToken, aiLimiter, chatWithAI);

/**
 * @route GET /api/ai/chat-history
 * @desc Get AI chat history
 * @access Private
 */
router.get('/chat-history', verifyToken, aiLimiter, getChatHistory);

/**
 * @route GET /api/ai/heart-rate-recommendations
 * @desc Get recommendations based on heart rate data (for fitness content)
 * @access Private
 */
router.get('/heart-rate-recommendations', verifyToken, aiLimiter, getHeartRateBasedRecommendations);

export default router;

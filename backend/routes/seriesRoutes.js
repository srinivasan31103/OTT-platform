import express from 'express';
import {
  getSeries,
  getSeriesById,
  searchSeries,
  getSeriesByGenre,
  getTrendingSeries,
  getFeaturedSeries,
  getSeriesRecommendations,
  getSeriesSeasons,
  getSeriesEpisodes,
  rateSeries,
  getSeriesRating,
  addSeriesToWatchlist,
  removeSeriesFromWatchlist,
  getSeriesProgress,
  updateSeriesProgress
} from '../controllers/seriesController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { checkSubscription, checkContentAccess } from '../middleware/subscription.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const seriesLimiter = rateLimiter({ windowMs: 60000, maxRequests: 100 });

/**
 * @route GET /api/series
 * @desc Get all series with pagination and filtering
 * @access Public (limited), Private (full access)
 */
router.get('/', optionalAuth, seriesLimiter, getSeries);

/**
 * @route GET /api/series/trending
 * @desc Get trending series
 * @access Public
 */
router.get('/trending', seriesLimiter, getTrendingSeries);

/**
 * @route GET /api/series/featured
 * @desc Get featured/promoted series
 * @access Public
 */
router.get('/featured', seriesLimiter, getFeaturedSeries);

/**
 * @route GET /api/series/search
 * @desc Search series by title, genre, actor
 * @access Public
 */
router.get('/search', optionalAuth, seriesLimiter, searchSeries);

/**
 * @route GET /api/series/genre/:genre
 * @desc Get series by specific genre
 * @access Public
 */
router.get('/genre/:genre', optionalAuth, seriesLimiter, getSeriesByGenre);

/**
 * @route GET /api/series/:id
 * @desc Get detailed series information
 * @access Public (limited), Private (full)
 */
router.get('/:id', optionalAuth, seriesLimiter, getSeriesById);

/**
 * @route GET /api/series/:id/recommendations
 * @desc Get recommendations based on a series
 * @access Public
 */
router.get('/:id/recommendations', seriesLimiter, getSeriesRecommendations);

/**
 * @route GET /api/series/:id/seasons
 * @desc Get all seasons for a series
 * @access Private
 */
router.get('/:id/seasons', verifyToken, seriesLimiter, getSeriesSeasons);

/**
 * @route GET /api/series/:id/episodes
 * @desc Get all episodes for a series (with pagination)
 * @access Private
 */
router.get('/:id/episodes', verifyToken, seriesLimiter, getSeriesEpisodes);

/**
 * @route POST /api/series/:id/rating
 * @desc Rate a series (1-10)
 * @access Private
 */
router.post('/:id/rating', verifyToken, seriesLimiter, rateSeries);

/**
 * @route GET /api/series/:id/rating
 * @desc Get user's rating for a series
 * @access Private
 */
router.get('/:id/rating', verifyToken, seriesLimiter, getSeriesRating);

/**
 * @route POST /api/series/:id/watchlist
 * @desc Add series to watchlist
 * @access Private
 */
router.post('/:id/watchlist', verifyToken, seriesLimiter, addSeriesToWatchlist);

/**
 * @route DELETE /api/series/:id/watchlist
 * @desc Remove series from watchlist
 * @access Private
 */
router.delete('/:id/watchlist', verifyToken, seriesLimiter, removeSeriesFromWatchlist);

/**
 * @route GET /api/series/:id/progress
 * @desc Get user's watch progress for series
 * @access Private
 */
router.get('/:id/progress', verifyToken, seriesLimiter, getSeriesProgress);

/**
 * @route PUT /api/series/:id/progress
 * @desc Update user's watch progress for series
 * @access Private
 */
router.put('/:id/progress', verifyToken, seriesLimiter, updateSeriesProgress);

export default router;

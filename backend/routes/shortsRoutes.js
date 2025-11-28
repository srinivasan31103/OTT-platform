import express from 'express';
import {
  getShorts,
  getShortsById,
  searchShorts,
  getShortsByGenre,
  getTrendingShorts,
  getFeaturedShorts,
  getShortsRecommendations,
  getShortsStream,
  rateShort,
  getShortRating,
  addShortToWatchlist,
  removeShortFromWatchlist,
  getShortProgress,
  updateShortProgress,
  getCreatorShorts,
  likeShort,
  unlikeShort,
  shareShort,
  reportShort
} from '../controllers/shortsController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { checkDeviceLimit } from '../middleware/subscription.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const shortsLimiter = rateLimiter({ windowMs: 60000, maxRequests: 200 });
const streamLimiter = rateLimiter({ windowMs: 60000, maxRequests: 100 });

/**
 * @route GET /api/shorts
 * @desc Get shorts feed with infinite scroll pagination
 * @access Public (limited), Private (full access)
 */
router.get('/', optionalAuth, shortsLimiter, getShorts);

/**
 * @route GET /api/shorts/trending
 * @desc Get trending shorts
 * @access Public
 */
router.get('/trending', shortsLimiter, getTrendingShorts);

/**
 * @route GET /api/shorts/featured
 * @desc Get featured/promoted shorts
 * @access Public
 */
router.get('/featured', shortsLimiter, getFeaturedShorts);

/**
 * @route GET /api/shorts/search
 * @desc Search shorts by title, hashtag, creator
 * @access Public
 */
router.get('/search', optionalAuth, shortsLimiter, searchShorts);

/**
 * @route GET /api/shorts/genre/:genre
 * @desc Get shorts by specific category/genre
 * @access Public
 */
router.get('/genre/:genre', optionalAuth, shortsLimiter, getShortsByGenre);

/**
 * @route GET /api/shorts/creator/:creatorId
 * @desc Get all shorts from a specific creator
 * @access Public
 */
router.get('/creator/:creatorId', shortsLimiter, getCreatorShorts);

/**
 * @route GET /api/shorts/:id
 * @desc Get detailed short information
 * @access Public (limited), Private (full)
 */
router.get('/:id', optionalAuth, shortsLimiter, getShortsById);

/**
 * @route GET /api/shorts/:id/recommendations
 * @desc Get recommendations based on a short
 * @access Public
 */
router.get('/:id/recommendations', shortsLimiter, getShortsRecommendations);

/**
 * @route GET /api/shorts/:id/stream
 * @desc Get streaming URL/token for short
 * @access Private
 */
router.get('/:id/stream', verifyToken, checkDeviceLimit, streamLimiter, getShortsStream);

/**
 * @route POST /api/shorts/:id/rating
 * @desc Rate a short (1-10)
 * @access Private
 */
router.post('/:id/rating', verifyToken, shortsLimiter, rateShort);

/**
 * @route GET /api/shorts/:id/rating
 * @desc Get user's rating for a short
 * @access Private
 */
router.get('/:id/rating', verifyToken, shortsLimiter, getShortRating);

/**
 * @route POST /api/shorts/:id/like
 * @desc Like a short
 * @access Private
 */
router.post('/:id/like', verifyToken, shortsLimiter, likeShort);

/**
 * @route POST /api/shorts/:id/unlike
 * @desc Unlike a short
 * @access Private
 */
router.post('/:id/unlike', verifyToken, shortsLimiter, unlikeShort);

/**
 * @route POST /api/shorts/:id/share
 * @desc Share a short (track sharing)
 * @access Private
 */
router.post('/:id/share', verifyToken, shortsLimiter, shareShort);

/**
 * @route POST /api/shorts/:id/watchlist
 * @desc Add short to watchlist
 * @access Private
 */
router.post('/:id/watchlist', verifyToken, shortsLimiter, addShortToWatchlist);

/**
 * @route DELETE /api/shorts/:id/watchlist
 * @desc Remove short from watchlist
 * @access Private
 */
router.delete('/:id/watchlist', verifyToken, shortsLimiter, removeShortFromWatchlist);

/**
 * @route GET /api/shorts/:id/progress
 * @desc Get user's watch progress for short
 * @access Private
 */
router.get('/:id/progress', verifyToken, shortsLimiter, getShortProgress);

/**
 * @route PUT /api/shorts/:id/progress
 * @desc Update user's watch progress for short
 * @access Private
 */
router.put('/:id/progress', verifyToken, shortsLimiter, updateShortProgress);

/**
 * @route POST /api/shorts/:id/report
 * @desc Report inappropriate short
 * @access Private
 */
router.post('/:id/report', verifyToken, shortsLimiter, reportShort);

export default router;

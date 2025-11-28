import express from 'express';
import {
  getWatchHistory,
  addToWatchHistory,
  updateWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
  getRecentlyWatched,
  getContinueWatching,
  getWatchStats,
  getTotalWatchTime,
  getWatchStreak,
  getWatchedContent
} from '../controllers/watchController.js';
import { verifyToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const watchLimiter = rateLimiter({ windowMs: 60000, maxRequests: 150 });

/**
 * @route GET /api/watch/history
 * @desc Get user's complete watch history with pagination
 * @access Private
 */
router.get('/history', verifyToken, watchLimiter, getWatchHistory);

/**
 * @route GET /api/watch/recently-watched
 * @desc Get recently watched content (last 50)
 * @access Private
 */
router.get('/recently-watched', verifyToken, watchLimiter, getRecentlyWatched);

/**
 * @route GET /api/watch/continue-watching
 * @desc Get content to continue watching (not completed)
 * @access Private
 */
router.get('/continue-watching', verifyToken, watchLimiter, getContinueWatching);

/**
 * @route GET /api/watch/stats
 * @desc Get watch statistics for user
 * @access Private
 */
router.get('/stats', verifyToken, watchLimiter, getWatchStats);

/**
 * @route GET /api/watch/stats/total-time
 * @desc Get total watch time spent on platform
 * @access Private
 */
router.get('/stats/total-time', verifyToken, watchLimiter, getTotalWatchTime);

/**
 * @route GET /api/watch/stats/streak
 * @desc Get user's consecutive watch days streak
 * @access Private
 */
router.get('/stats/streak', verifyToken, watchLimiter, getWatchStreak);

/**
 * @route GET /api/watch/watched/:contentId
 * @desc Check if content has been watched
 * @access Private
 */
router.get('/watched/:contentId', verifyToken, watchLimiter, getWatchedContent);

/**
 * @route POST /api/watch/history
 * @desc Add content to watch history
 * @access Private
 */
router.post('/history', verifyToken, watchLimiter, addToWatchHistory);

/**
 * @route PUT /api/watch/history/:contentId
 * @desc Update watch progress for content
 * @access Private
 */
router.put('/history/:contentId', verifyToken, watchLimiter, updateWatchHistory);

/**
 * @route DELETE /api/watch/history/:contentId
 * @desc Remove content from watch history
 * @access Private
 */
router.delete('/history/:contentId', verifyToken, watchLimiter, removeFromWatchHistory);

/**
 * @route DELETE /api/watch/history
 * @desc Clear entire watch history
 * @access Private
 */
router.delete('/history', verifyToken, watchLimiter, clearWatchHistory);

export default router;

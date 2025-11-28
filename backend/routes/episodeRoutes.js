import express from 'express';
import {
  getEpisodeById,
  getEpisodesBySeasonId,
  getEpisodeStream,
  rateEpisode,
  getEpisodeRating,
  updateEpisodeProgress,
  getEpisodeProgress,
  getEpisodeDetails,
  getEpisodeSubtitles,
  reportEpisodeIssue
} from '../controllers/episodeController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { checkSubscription, checkContentAccess } from '../middleware/subscription.js';
import { checkDeviceLimit } from '../middleware/subscription.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const episodeLimiter = rateLimiter({ windowMs: 60000, maxRequests: 150 });
const streamLimiter = rateLimiter({ windowMs: 60000, maxRequests: 50 });

/**
 * @route GET /api/episodes/:id
 * @desc Get detailed episode information
 * @access Private
 */
router.get('/:id', verifyToken, episodeLimiter, getEpisodeById);

/**
 * @route GET /api/episodes/:id/details
 * @desc Get full episode details with metadata
 * @access Private
 */
router.get('/:id/details', verifyToken, episodeLimiter, getEpisodeDetails);

/**
 * @route GET /api/episodes/season/:seasonId
 * @desc Get all episodes for a specific season
 * @access Private
 */
router.get('/season/:seasonId', verifyToken, episodeLimiter, getEpisodesBySeasonId);

/**
 * @route GET /api/episodes/:id/stream
 * @desc Get streaming URL/token for episode
 * @access Private
 */
router.get('/:id/stream', verifyToken, checkDeviceLimit, streamLimiter, getEpisodeStream);

/**
 * @route GET /api/episodes/:id/subtitles
 * @desc Get available subtitles for episode
 * @access Private
 */
router.get('/:id/subtitles', verifyToken, episodeLimiter, getEpisodeSubtitles);

/**
 * @route POST /api/episodes/:id/rating
 * @desc Rate an episode (1-10)
 * @access Private
 */
router.post('/:id/rating', verifyToken, episodeLimiter, rateEpisode);

/**
 * @route GET /api/episodes/:id/rating
 * @desc Get user's rating for an episode
 * @access Private
 */
router.get('/:id/rating', verifyToken, episodeLimiter, getEpisodeRating);

/**
 * @route POST /api/episodes/:id/progress
 * @desc Update watch progress for episode
 * @access Private
 */
router.post('/:id/progress', verifyToken, episodeLimiter, updateEpisodeProgress);

/**
 * @route GET /api/episodes/:id/progress
 * @desc Get watch progress for episode
 * @access Private
 */
router.get('/:id/progress', verifyToken, episodeLimiter, getEpisodeProgress);

/**
 * @route POST /api/episodes/:id/report-issue
 * @desc Report technical issue with episode playback
 * @access Private
 */
router.post('/:id/report-issue', verifyToken, episodeLimiter, reportEpisodeIssue);

export default router;

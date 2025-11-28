import express from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
  getWatchlistByProfile,
  createCustomList,
  getCustomLists,
  deleteCustomList,
  addToCustomList,
  removeFromCustomList,
  reorderWatchlist,
  shareWatchlist,
  checkInWatchlist,
  getSavedForLater,
  addToSavedForLater,
  removeFromSavedForLater
} from '../controllers/watchlistController.js';
import { verifyToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const watchlistLimiter = rateLimiter({ windowMs: 60000, maxRequests: 100 });

/**
 * @route GET /api/watchlist
 * @desc Get user's main watchlist with pagination
 * @access Private
 */
router.get('/', verifyToken, watchlistLimiter, getWatchlist);

/**
 * @route GET /api/watchlist/profile/:profileId
 * @desc Get watchlist for specific profile
 * @access Private
 */
router.get('/profile/:profileId', verifyToken, watchlistLimiter, getWatchlistByProfile);

/**
 * @route GET /api/watchlist/check/:contentId
 * @desc Check if content is in watchlist
 * @access Private
 */
router.get('/check/:contentId', verifyToken, watchlistLimiter, checkInWatchlist);

/**
 * @route GET /api/watchlist/saved-for-later
 * @desc Get saved for later items
 * @access Private
 */
router.get('/saved-for-later', verifyToken, watchlistLimiter, getSavedForLater);

/**
 * @route POST /api/watchlist
 * @desc Add content to watchlist
 * @access Private
 */
router.post('/', verifyToken, watchlistLimiter, addToWatchlist);

/**
 * @route POST /api/watchlist/saved-for-later
 * @desc Add content to saved for later
 * @access Private
 */
router.post('/saved-for-later', verifyToken, watchlistLimiter, addToSavedForLater);

/**
 * @route PUT /api/watchlist/:contentId
 * @desc Update watchlist item (priority, notes)
 * @access Private
 */
router.put('/:contentId', verifyToken, watchlistLimiter, updateWatchlistItem);

/**
 * @route DELETE /api/watchlist/:contentId
 * @desc Remove content from watchlist
 * @access Private
 */
router.delete('/:contentId', verifyToken, watchlistLimiter, removeFromWatchlist);

/**
 * @route DELETE /api/watchlist/saved-for-later/:contentId
 * @desc Remove content from saved for later
 * @access Private
 */
router.delete('/saved-for-later/:contentId', verifyToken, watchlistLimiter, removeFromSavedForLater);

/**
 * @route POST /api/watchlist/reorder
 * @desc Reorder watchlist items
 * @access Private
 */
router.post('/reorder', verifyToken, watchlistLimiter, reorderWatchlist);

/**
 * @route POST /api/watchlist/share
 * @desc Share watchlist with other users
 * @access Private
 */
router.post('/share', verifyToken, watchlistLimiter, shareWatchlist);

/**
 * @route GET /api/watchlist/lists
 * @desc Get all custom lists
 * @access Private
 */
router.get('/lists', verifyToken, watchlistLimiter, getCustomLists);

/**
 * @route POST /api/watchlist/lists
 * @desc Create custom watchlist
 * @access Private
 */
router.post('/lists', verifyToken, watchlistLimiter, createCustomList);

/**
 * @route DELETE /api/watchlist/lists/:listId
 * @desc Delete custom list
 * @access Private
 */
router.delete('/lists/:listId', verifyToken, watchlistLimiter, deleteCustomList);

/**
 * @route POST /api/watchlist/lists/:listId/add
 * @desc Add content to custom list
 * @access Private
 */
router.post('/lists/:listId/add', verifyToken, watchlistLimiter, addToCustomList);

/**
 * @route DELETE /api/watchlist/lists/:listId/remove/:contentId
 * @desc Remove content from custom list
 * @access Private
 */
router.delete('/lists/:listId/remove/:contentId', verifyToken, watchlistLimiter, removeFromCustomList);

export default router;

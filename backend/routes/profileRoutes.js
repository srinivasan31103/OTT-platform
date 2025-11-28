import express from 'express';
import {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  setActiveProfile,
  updateProfilePin,
  verifyProfilePin,
  getProfilePreferences,
  updateProfilePreferences
} from '../controllers/profileController.js';
import { verifyToken, verifyProfile } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const profileLimiter = rateLimiter({ windowMs: 60000, maxRequests: 60 });

/**
 * @route POST /api/profiles
 * @desc Create a new profile for user
 * @access Private
 */
router.post('/', verifyToken, profileLimiter, createProfile);

/**
 * @route GET /api/profiles
 * @desc Get all profiles for authenticated user
 * @access Private
 */
router.get('/', verifyToken, profileLimiter, getProfiles);

/**
 * @route GET /api/profiles/:id
 * @desc Get specific profile by ID
 * @access Private
 */
router.get('/:id', verifyToken, profileLimiter, getProfileById);

/**
 * @route PUT /api/profiles/:id
 * @desc Update profile information
 * @access Private
 */
router.put('/:id', verifyToken, profileLimiter, updateProfile);

/**
 * @route DELETE /api/profiles/:id
 * @desc Delete a profile
 * @access Private
 */
router.delete('/:id', verifyToken, profileLimiter, deleteProfile);

/**
 * @route POST /api/profiles/:id/set-active
 * @desc Set profile as active/current
 * @access Private
 */
router.post('/:id/set-active', verifyToken, profileLimiter, setActiveProfile);

/**
 * @route POST /api/profiles/:id/pin
 * @desc Update PIN protection for profile
 * @access Private
 */
router.post('/:id/pin', verifyToken, profileLimiter, updateProfilePin);

/**
 * @route POST /api/profiles/:id/verify-pin
 * @desc Verify PIN for restricted profile access
 * @access Private
 */
router.post('/:id/verify-pin', verifyToken, profileLimiter, verifyProfilePin);

/**
 * @route GET /api/profiles/:id/preferences
 * @desc Get profile preferences and settings
 * @access Private
 */
router.get('/:id/preferences', verifyToken, profileLimiter, getProfilePreferences);

/**
 * @route PUT /api/profiles/:id/preferences
 * @desc Update profile preferences and settings
 * @access Private
 */
router.put('/:id/preferences', verifyToken, profileLimiter, updateProfilePreferences);

export default router;

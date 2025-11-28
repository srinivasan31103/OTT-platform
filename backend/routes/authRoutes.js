import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  updateProfile
} from '../controllers/authController.js';
import { verifyToken, verifyRefreshToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authLimiter, register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return tokens
 * @access Public
 */
router.post('/login', authLimiter, login);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', verifyRefreshToken, refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate tokens
 * @access Private
 */
router.post('/logout', verifyToken, logout);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify user email with token
 * @access Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Request password reset email
 * @access Public
 */
router.post('/request-password-reset', authLimiter, requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', authLimiter, resetPassword);

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token and return user info
 * @access Private
 */
router.get('/verify', verifyToken, getCurrentUser);

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user
 * @access Private
 */
router.get('/me', verifyToken, getCurrentUser);

/**
 * @route PUT /api/auth/profile
 * @desc Update current user profile
 * @access Private
 */
router.put('/profile', verifyToken, updateProfile);

export default router;

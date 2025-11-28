import express from 'express';
import {
  requestLicense,
  renewLicense,
  revokeLicense,
  getLicenseInfo,
  validateLicense,
  getLicenseMetadata,
  getAvailableDRM,
  setDRMPolicy,
  getDRMPolicy,
  validatePlaybackEnvironment,
  generatePlaybackToken,
  validatePlaybackToken,
  getDeviceFingerprint,
  registerDevice,
  unregisterDevice,
  getRegisteredDevices,
  checkGeolocation,
  validateSubscriptionForContent,
  getDecryptionKey,
  logPlaybackEvent,
  reportDRMViolation,
  getDRMStatus,
  refreshPlaybackToken,
  getPlaybackLimitations,
  validateContentAccess
} from '../controllers/drmController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkDeviceLimit, checkContentAccess } from '../middleware/subscription.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const drmLimiter = rateLimiter({ windowMs: 60000, maxRequests: 150 });
const strictLimiter = rateLimiter({ windowMs: 60000, maxRequests: 30 });

/**
 * @route POST /api/drm/license/request
 * @desc Request DRM license for content playback
 * @access Private
 */
router.post('/license/request', verifyToken, checkDeviceLimit, drmLimiter, requestLicense);

/**
 * @route POST /api/drm/license/renew
 * @desc Renew existing DRM license
 * @access Private
 */
router.post('/license/renew', verifyToken, drmLimiter, renewLicense);

/**
 * @route POST /api/drm/license/revoke
 * @desc Revoke DRM license
 * @access Private
 */
router.post('/license/revoke', verifyToken, strictLimiter, revokeLicense);

/**
 * @route GET /api/drm/license/:licenseId
 * @desc Get DRM license information
 * @access Private
 */
router.get('/license/:licenseId', verifyToken, drmLimiter, getLicenseInfo);

/**
 * @route POST /api/drm/license/validate
 * @desc Validate DRM license
 * @access Private
 */
router.post('/license/validate', verifyToken, drmLimiter, validateLicense);

/**
 * @route GET /api/drm/license/:licenseId/metadata
 * @desc Get license metadata
 * @access Private
 */
router.get('/license/:licenseId/metadata', verifyToken, drmLimiter, getLicenseMetadata);

/**
 * @route GET /api/drm/available
 * @desc Get available DRM systems for user
 * @access Private
 */
router.get('/available', verifyToken, drmLimiter, getAvailableDRM);

/**
 * @route GET /api/drm/status
 * @desc Get overall DRM status
 * @access Private
 */
router.get('/status', verifyToken, drmLimiter, getDRMStatus);

/**
 * @route POST /api/drm/policy
 * @desc Set DRM policy for content
 * @access Private
 */
router.post('/policy', verifyToken, strictLimiter, setDRMPolicy);

/**
 * @route GET /api/drm/policy/:contentId
 * @desc Get DRM policy for content
 * @access Private
 */
router.get('/policy/:contentId', verifyToken, drmLimiter, getDRMPolicy);

/**
 * @route POST /api/drm/validate-environment
 * @desc Validate playback environment meets DRM requirements
 * @access Private
 */
router.post('/validate-environment', verifyToken, drmLimiter, validatePlaybackEnvironment);

/**
 * @route POST /api/drm/playback-token
 * @desc Generate playback token for content
 * @access Private
 */
router.post('/playback-token', verifyToken, checkDeviceLimit, drmLimiter, generatePlaybackToken);

/**
 * @route POST /api/drm/playback-token/validate
 * @desc Validate playback token
 * @access Private
 */
router.post('/playback-token/validate', verifyToken, drmLimiter, validatePlaybackToken);

/**
 * @route POST /api/drm/playback-token/refresh
 * @desc Refresh playback token
 * @access Private
 */
router.post('/playback-token/refresh', verifyToken, drmLimiter, refreshPlaybackToken);

/**
 * @route GET /api/drm/playback-limitations/:contentId
 * @desc Get playback limitations for content
 * @access Private
 */
router.get('/playback-limitations/:contentId', verifyToken, drmLimiter, getPlaybackLimitations);

/**
 * @route POST /api/drm/device/fingerprint
 * @desc Get device fingerprint for DRM
 * @access Private
 */
router.post('/device/fingerprint', verifyToken, drmLimiter, getDeviceFingerprint);

/**
 * @route POST /api/drm/device/register
 * @desc Register device with DRM system
 * @access Private
 */
router.post('/device/register', verifyToken, checkDeviceLimit, drmLimiter, registerDevice);

/**
 * @route POST /api/drm/device/unregister
 * @desc Unregister device from DRM system
 * @access Private
 */
router.post('/device/unregister', verifyToken, drmLimiter, unregisterDevice);

/**
 * @route GET /api/drm/device
 * @desc Get registered devices
 * @access Private
 */
router.get('/device', verifyToken, drmLimiter, getRegisteredDevices);

/**
 * @route POST /api/drm/geolocation/check
 * @desc Check geolocation for content access
 * @access Private
 */
router.post('/geolocation/check', verifyToken, drmLimiter, checkGeolocation);

/**
 * @route POST /api/drm/validate-content-access
 * @desc Validate content access with all checks
 * @access Private
 */
router.post('/validate-content-access', verifyToken, checkDeviceLimit, drmLimiter, validateContentAccess);

/**
 * @route POST /api/drm/subscription-validation/:contentId
 * @desc Validate subscription for specific content
 * @access Private
 */
router.post('/subscription-validation/:contentId', verifyToken, drmLimiter, validateSubscriptionForContent);

/**
 * @route GET /api/drm/key/:contentId
 * @desc Get decryption key for content
 * @access Private
 */
router.get('/key/:contentId', verifyToken, strictLimiter, getDecryptionKey);

/**
 * @route POST /api/drm/event
 * @desc Log playback event for licensing
 * @access Private
 */
router.post('/event', verifyToken, drmLimiter, logPlaybackEvent);

/**
 * @route POST /api/drm/report-violation
 * @desc Report DRM violation
 * @access Private
 */
router.post('/report-violation', verifyToken, strictLimiter, reportDRMViolation);

export default router;

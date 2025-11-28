import express from 'express';
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
  getCurrentSubscription,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  renewSubscription,
  pauseSubscription,
  resumeSubscription,
  getSubscriptionHistory,
  getInvoices,
  getInvoiceById,
  downloadInvoice,
  updatePaymentMethod,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  applyPromoCode,
  validatePromoCode,
  getSubscriptionBenefits,
  getDevices,
  manageDevice,
  checkSubscriptionStatus
} from '../controllers/subscriptionController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { checkActiveSubscription } from '../middleware/subscription.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const subscriptionLimiter = rateLimiter({ windowMs: 60000, maxRequests: 50 });

/**
 * @route GET /api/subscriptions/plans
 * @desc Get all available subscription plans
 * @access Public
 */
router.get('/plans', subscriptionLimiter, getSubscriptionPlans);

/**
 * @route GET /api/subscriptions/plans/:id
 * @desc Get specific subscription plan details
 * @access Public
 */
router.get('/plans/:id', subscriptionLimiter, getSubscriptionPlan);

/**
 * @route GET /api/subscriptions/current
 * @desc Get current user's subscription details
 * @access Private
 */
router.get('/current', verifyToken, subscriptionLimiter, getCurrentSubscription);

/**
 * @route GET /api/subscriptions/status
 * @desc Check subscription status (active, expired, etc.)
 * @access Private
 */
router.get('/status', verifyToken, subscriptionLimiter, checkSubscriptionStatus);

/**
 * @route GET /api/subscriptions/benefits
 * @desc Get benefits of current subscription
 * @access Private
 */
router.get('/benefits', verifyToken, subscriptionLimiter, getSubscriptionBenefits);

/**
 * @route POST /api/subscriptions/upgrade
 * @desc Upgrade subscription to higher tier
 * @access Private
 */
router.post('/upgrade', verifyToken, subscriptionLimiter, upgradeSubscription);

/**
 * @route POST /api/subscriptions/downgrade
 * @desc Downgrade subscription to lower tier
 * @access Private
 */
router.post('/downgrade', verifyToken, subscriptionLimiter, downgradeSubscription);

/**
 * @route POST /api/subscriptions/cancel
 * @desc Cancel current subscription
 * @access Private
 */
router.post('/cancel', verifyToken, subscriptionLimiter, cancelSubscription);

/**
 * @route POST /api/subscriptions/renew
 * @desc Renew expiring subscription
 * @access Private
 */
router.post('/renew', verifyToken, subscriptionLimiter, renewSubscription);

/**
 * @route POST /api/subscriptions/pause
 * @desc Pause subscription temporarily
 * @access Private
 */
router.post('/pause', verifyToken, subscriptionLimiter, pauseSubscription);

/**
 * @route POST /api/subscriptions/resume
 * @desc Resume paused subscription
 * @access Private
 */
router.post('/resume', verifyToken, subscriptionLimiter, resumeSubscription);

/**
 * @route GET /api/subscriptions/history
 * @desc Get subscription change history
 * @access Private
 */
router.get('/history', verifyToken, subscriptionLimiter, getSubscriptionHistory);

/**
 * @route GET /api/subscriptions/invoices
 * @desc Get all invoices for user
 * @access Private
 */
router.get('/invoices', verifyToken, subscriptionLimiter, getInvoices);

/**
 * @route GET /api/subscriptions/invoices/:id
 * @desc Get specific invoice details
 * @access Private
 */
router.get('/invoices/:id', verifyToken, subscriptionLimiter, getInvoiceById);

/**
 * @route GET /api/subscriptions/invoices/:id/download
 * @desc Download invoice as PDF
 * @access Private
 */
router.get('/invoices/:id/download', verifyToken, subscriptionLimiter, downloadInvoice);

/**
 * @route GET /api/subscriptions/payment-methods
 * @desc Get all payment methods on file
 * @access Private
 */
router.get('/payment-methods', verifyToken, subscriptionLimiter, getPaymentMethods);

/**
 * @route POST /api/subscriptions/payment-methods
 * @desc Add new payment method
 * @access Private
 */
router.post('/payment-methods', verifyToken, subscriptionLimiter, addPaymentMethod);

/**
 * @route PUT /api/subscriptions/payment-methods/:id
 * @desc Update payment method
 * @access Private
 */
router.put('/payment-methods/:id', verifyToken, subscriptionLimiter, updatePaymentMethod);

/**
 * @route DELETE /api/subscriptions/payment-methods/:id
 * @desc Delete payment method
 * @access Private
 */
router.delete('/payment-methods/:id', verifyToken, subscriptionLimiter, deletePaymentMethod);

/**
 * @route POST /api/subscriptions/payment-methods/:id/default
 * @desc Set payment method as default
 * @access Private
 */
router.post('/payment-methods/:id/default', verifyToken, subscriptionLimiter, setDefaultPaymentMethod);

/**
 * @route GET /api/subscriptions/devices
 * @desc Get list of devices on subscription
 * @access Private
 */
router.get('/devices', verifyToken, subscriptionLimiter, getDevices);

/**
 * @route PUT /api/subscriptions/devices/:deviceId
 * @desc Manage device (rename, sign out, etc.)
 * @access Private
 */
router.put('/devices/:deviceId', verifyToken, subscriptionLimiter, manageDevice);

/**
 * @route POST /api/subscriptions/promo-code/validate
 * @desc Validate promo code before application
 * @access Private
 */
router.post('/promo-code/validate', verifyToken, subscriptionLimiter, validatePromoCode);

/**
 * @route POST /api/subscriptions/promo-code/apply
 * @desc Apply promo code to subscription
 * @access Private
 */
router.post('/promo-code/apply', verifyToken, subscriptionLimiter, applyPromoCode);

export default router;

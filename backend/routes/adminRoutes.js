import express from 'express';
import multer from 'multer';
import {
  getDashboard,
  getAnalytics,
  getUsers,
  getUserById,
  updateUser,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getContent,
  getContentById,
  publishContent,
  unpublishContent,
  updateContent,
  deleteContent,
  approveContent,
  rejectContent,
  getReports,
  getReportById,
  resolveReport,
  dismissReport,
  getSubscriptions,
  getSubscriptionById,
  refundSubscription,
  getTransactions,
  getTransactionById,
  refundTransaction,
  getSystemLogs,
  getAuditLogs,
  manageModerators,
  setContentRestrictions,
  getGeoRestrictions,
  updateGeoRestrictions,
  managePromos,
  createPromo,
  updatePromo,
  deletePromo,
  getSystemHealth,
  manageCDN,
  viewNotifications,
  sendNotification,
  manageAdmins,
  manageRoles,
  setPermissions,
  exportData,
  importData,
  getBackups,
  createBackup,
  restoreBackup,
  getConfigSettings,
  updateConfigSettings,
  getEmailTemplates,
  updateEmailTemplate,
  testEmailTemplate,
  getBannedUsers,
  banUser,
  unbanUser,
  getContentModeration,
  approveModeration,
  rejectModeration,
  uploadMovie,
  uploadSeries,
  uploadEpisode,
  getPlatformAnalytics,
  getAllUsers
} from '../controllers/adminController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

const router = express.Router();
const adminLimiter = rateLimiter({ windowMs: 60000, maxRequests: 100 });

// Apply admin verification to all admin routes
router.use(verifyToken, verifyAdmin);

/**
 * @route GET /api/admin/dashboard
 * @desc Get admin dashboard overview
 * @access Admin
 */
router.get('/dashboard', adminLimiter, getPlatformAnalytics);

/**
 * @route GET /api/admin/analytics
 * @desc Get detailed analytics
 * @access Admin
 */
router.get('/analytics', adminLimiter, getAnalytics);

// USER MANAGEMENT ROUTES

/**
 * @route GET /api/admin/users
 * @desc Get all users with pagination and filtering
 * @access Admin
 */
router.get('/users', adminLimiter, getAllUsers);

/**
 * @route GET /api/admin/users/:id
 * @desc Get specific user details
 * @access Admin
 */
router.get('/users/:id', adminLimiter, getUserById);

/**
 * @route PUT /api/admin/users/:id
 * @desc Update user information
 * @access Admin
 */
router.put('/users/:id', adminLimiter, updateUser);

/**
 * @route POST /api/admin/users/:id/suspend
 * @desc Suspend user account
 * @access Admin
 */
router.post('/users/:id/suspend', adminLimiter, suspendUser);

/**
 * @route POST /api/admin/users/:id/unsuspend
 * @desc Unsuspend user account
 * @access Admin
 */
router.post('/users/:id/unsuspend', adminLimiter, unsuspendUser);

/**
 * @route POST /api/admin/users/:id/ban
 * @desc Ban user permanently
 * @access Admin
 */
router.post('/users/:id/ban', adminLimiter, banUser);

/**
 * @route POST /api/admin/users/:id/unban
 * @desc Unban user
 * @access Admin
 */
router.post('/users/:id/unban', adminLimiter, unbanUser);

/**
 * @route GET /api/admin/users/banned
 * @desc Get list of banned users
 * @access Admin
 */
router.get('/users/banned', adminLimiter, getBannedUsers);

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete user account permanently
 * @access Admin
 */
router.delete('/users/:id', adminLimiter, deleteUser);

// CONTENT MANAGEMENT ROUTES

/**
 * @route GET /api/admin/content
 * @desc Get all content with filters
 * @access Admin
 */
router.get('/content', adminLimiter, getContent);

/**
 * @route GET /api/admin/content/:id
 * @desc Get content details
 * @access Admin
 */
router.get('/content/:id', adminLimiter, getContentById);

/**
 * @route PUT /api/admin/content/:id
 * @desc Update content
 * @access Admin
 */
router.put('/content/:id', adminLimiter, updateContent);

/**
 * @route POST /api/admin/content/:id/publish
 * @desc Publish content
 * @access Admin
 */
router.post('/content/:id/publish', adminLimiter, publishContent);

/**
 * @route POST /api/admin/content/:id/unpublish
 * @desc Unpublish content
 * @access Admin
 */
router.post('/content/:id/unpublish', adminLimiter, unpublishContent);

/**
 * @route POST /api/admin/content/:id/approve
 * @desc Approve content for publishing
 * @access Admin
 */
router.post('/content/:id/approve', adminLimiter, approveContent);

/**
 * @route POST /api/admin/content/:id/reject
 * @desc Reject content with reason
 * @access Admin
 */
router.post('/content/:id/reject', adminLimiter, rejectContent);

/**
 * @route DELETE /api/admin/content/:id
 * @desc Delete content
 * @access Admin
 */
router.delete('/content/:id', adminLimiter, deleteContent);

/**
 * @route GET /api/admin/content/moderation
 * @desc Get pending content moderation queue
 * @access Admin
 */
router.get('/content/moderation', adminLimiter, getContentModeration);

/**
 * @route POST /api/admin/content/moderation/:id/approve
 * @desc Approve moderated content
 * @access Admin
 */
router.post('/content/moderation/:id/approve', adminLimiter, approveModeration);

/**
 * @route POST /api/admin/content/moderation/:id/reject
 * @desc Reject moderated content
 * @access Admin
 */
router.post('/content/moderation/:id/reject', adminLimiter, rejectModeration);

// REPORTS & MODERATION ROUTES

/**
 * @route GET /api/admin/reports
 * @desc Get user reports about content/users
 * @access Admin
 */
router.get('/reports', adminLimiter, getReports);

/**
 * @route GET /api/admin/reports/:id
 * @desc Get specific report
 * @access Admin
 */
router.get('/reports/:id', adminLimiter, getReportById);

/**
 * @route POST /api/admin/reports/:id/resolve
 * @desc Resolve a report
 * @access Admin
 */
router.post('/reports/:id/resolve', adminLimiter, resolveReport);

/**
 * @route POST /api/admin/reports/:id/dismiss
 * @desc Dismiss a report
 * @access Admin
 */
router.post('/reports/:id/dismiss', adminLimiter, dismissReport);

// SUBSCRIPTION & PAYMENT ROUTES

/**
 * @route GET /api/admin/subscriptions
 * @desc Get all subscriptions
 * @access Admin
 */
router.get('/subscriptions', adminLimiter, getSubscriptions);

/**
 * @route GET /api/admin/subscriptions/:id
 * @desc Get subscription details
 * @access Admin
 */
router.get('/subscriptions/:id', adminLimiter, getSubscriptionById);

/**
 * @route POST /api/admin/subscriptions/:id/refund
 * @desc Refund subscription
 * @access Admin
 */
router.post('/subscriptions/:id/refund', adminLimiter, refundSubscription);

/**
 * @route GET /api/admin/transactions
 * @desc Get all transactions
 * @access Admin
 */
router.get('/transactions', adminLimiter, getTransactions);

/**
 * @route GET /api/admin/transactions/:id
 * @desc Get transaction details
 * @access Admin
 */
router.get('/transactions/:id', adminLimiter, getTransactionById);

/**
 * @route POST /api/admin/transactions/:id/refund
 * @desc Refund transaction
 * @access Admin
 */
router.post('/transactions/:id/refund', adminLimiter, refundTransaction);

// PROMOTION MANAGEMENT ROUTES

/**
 * @route GET /api/admin/promos
 * @desc Get all promo codes
 * @access Admin
 */
router.get('/promos', adminLimiter, managePromos);

/**
 * @route POST /api/admin/promos
 * @desc Create new promo code
 * @access Admin
 */
router.post('/promos', adminLimiter, createPromo);

/**
 * @route PUT /api/admin/promos/:id
 * @desc Update promo code
 * @access Admin
 */
router.put('/promos/:id', adminLimiter, updatePromo);

/**
 * @route DELETE /api/admin/promos/:id
 * @desc Delete promo code
 * @access Admin
 */
router.delete('/promos/:id', adminLimiter, deletePromo);

// SYSTEM & LOGS ROUTES

/**
 * @route GET /api/admin/logs/system
 * @desc Get system logs
 * @access Admin
 */
router.get('/logs/system', adminLimiter, getSystemLogs);

/**
 * @route GET /api/admin/logs/audit
 * @desc Get audit logs
 * @access Admin
 */
router.get('/logs/audit', adminLimiter, getAuditLogs);

/**
 * @route GET /api/admin/health
 * @desc Get system health status
 * @access Admin
 */
router.get('/health', adminLimiter, getSystemHealth);

// GEO & RESTRICTIONS ROUTES

/**
 * @route GET /api/admin/geo-restrictions
 * @desc Get geo-restriction policies
 * @access Admin
 */
router.get('/geo-restrictions', adminLimiter, getGeoRestrictions);

/**
 * @route PUT /api/admin/geo-restrictions
 * @desc Update geo-restriction policies
 * @access Admin
 */
router.put('/geo-restrictions', adminLimiter, updateGeoRestrictions);

/**
 * @route POST /api/admin/content-restrictions/:id
 * @desc Set content restrictions
 * @access Admin
 */
router.post('/content-restrictions/:id', adminLimiter, setContentRestrictions);

// ADMIN MANAGEMENT ROUTES

/**
 * @route GET /api/admin/admins
 * @desc Get list of admin users
 * @access Admin
 */
router.get('/admins', adminLimiter, manageAdmins);

/**
 * @route GET /api/admin/roles
 * @desc Get available roles and permissions
 * @access Admin
 */
router.get('/roles', adminLimiter, manageRoles);

/**
 * @route POST /api/admin/permissions/:id
 * @desc Set user permissions
 * @access Admin
 */
router.post('/permissions/:id', adminLimiter, setPermissions);

// NOTIFICATIONS ROUTE

/**
 * @route GET /api/admin/notifications
 * @desc Get admin notifications
 * @access Admin
 */
router.get('/notifications', adminLimiter, viewNotifications);

/**
 * @route POST /api/admin/notifications/send
 * @desc Send notification to users
 * @access Admin
 */
router.post('/notifications/send', adminLimiter, sendNotification);

// CONFIGURATION ROUTES

/**
 * @route GET /api/admin/settings
 * @desc Get system configuration settings
 * @access Admin
 */
router.get('/settings', adminLimiter, getConfigSettings);

/**
 * @route PUT /api/admin/settings
 * @desc Update system configuration
 * @access Admin
 */
router.put('/settings', adminLimiter, updateConfigSettings);

/**
 * @route GET /api/admin/email-templates
 * @desc Get email templates
 * @access Admin
 */
router.get('/email-templates', adminLimiter, getEmailTemplates);

/**
 * @route PUT /api/admin/email-templates/:id
 * @desc Update email template
 * @access Admin
 */
router.put('/email-templates/:id', adminLimiter, updateEmailTemplate);

/**
 * @route POST /api/admin/email-templates/:id/test
 * @desc Test email template
 * @access Admin
 */
router.post('/email-templates/:id/test', adminLimiter, testEmailTemplate);

// BACKUP & DATA ROUTES

/**
 * @route GET /api/admin/backups
 * @desc Get list of backups
 * @access Admin
 */
router.get('/backups', adminLimiter, getBackups);

/**
 * @route POST /api/admin/backups
 * @desc Create new backup
 * @access Admin
 */
router.post('/backups', adminLimiter, createBackup);

/**
 * @route POST /api/admin/backups/:id/restore
 * @desc Restore from backup
 * @access Admin
 */
router.post('/backups/:id/restore', adminLimiter, restoreBackup);

/**
 * @route POST /api/admin/data/export
 * @desc Export data
 * @access Admin
 */
router.post('/data/export', adminLimiter, exportData);

/**
 * @route POST /api/admin/data/import
 * @desc Import data
 * @access Admin
 */
router.post('/data/import', adminLimiter, importData);

// CDN MANAGEMENT ROUTES

/**
 * @route GET /api/admin/cdn
 * @desc Get CDN management info
 * @access Admin
 */
router.get('/cdn', adminLimiter, manageCDN);

// CONTENT UPLOAD ROUTES

/**
 * @route POST /api/admin/upload-movie
 * @desc Upload a new movie with video file and metadata
 * @access Admin
 */
router.post('/upload-movie', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'poster', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 }
]), adminLimiter, uploadMovie);

/**
 * @route POST /api/admin/upload-series
 * @desc Create a new series with metadata
 * @access Admin
 */
router.post('/upload-series', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 }
]), adminLimiter, uploadSeries);

/**
 * @route POST /api/admin/upload-episode/:seriesId
 * @desc Upload an episode to an existing series
 * @access Admin
 */
router.post('/upload-episode/:seriesId', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), adminLimiter, uploadEpisode);

/**
 * @route GET /api/admin/stats
 * @desc Get platform statistics for admin dashboard
 * @access Admin
 */
router.get('/stats', adminLimiter, getPlatformAnalytics);

export default router;

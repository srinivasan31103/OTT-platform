import express from 'express';
import {
  getAllAds,
  getActiveAds,
  createAd,
  updateAd,
  deleteAd,
  trackImpression,
  trackClick,
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  trackBannerView,
  trackBannerClick
} from '../controllers/adController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// PUBLIC ROUTES
router.get('/ads/active', getActiveAds);
router.post('/ads/:id/impression', trackImpression);
router.post('/ads/:id/click', trackClick);

router.get('/banners/active', getActiveBanners);
router.post('/banners/:id/view', trackBannerView);
router.post('/banners/:id/click', trackBannerClick);

// ADMIN ROUTES
router.use(verifyToken, verifyAdmin);

// Ads management
router.get('/admin/ads', getAllAds);
router.post('/admin/ads', createAd);
router.put('/admin/ads/:id', updateAd);
router.delete('/admin/ads/:id', deleteAd);

// Banners management
router.get('/admin/banners', getAllBanners);
router.post('/admin/banners', createBanner);
router.put('/admin/banners/:id', updateBanner);
router.delete('/admin/banners/:id', deleteBanner);

export default router;

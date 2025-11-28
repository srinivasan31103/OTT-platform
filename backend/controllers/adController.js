import Advertisement from '../models/Advertisement.js';
import Banner from '../models/Banner.js';

// ==================== ADVERTISEMENTS ====================

// Get all ads (admin)
export const getAllAds = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, placement } = req.query;

    const query = {};
    if (status) query.status = status;
    if (placement) query.placement = placement;

    const ads = await Advertisement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Advertisement.countDocuments(query);

    res.json({
      success: true,
      data: ads,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active ads for display (public)
export const getActiveAds = async (req, res) => {
  try {
    const { placement } = req.query;
    const now = new Date();

    const query = {
      status: 'active',
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now }
    };

    if (placement) query.placement = placement;

    const ads = await Advertisement.find(query)
      .sort({ priority: -1 })
      .select('-analytics -pricing.budget -pricing.spent');

    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create ad
export const createAd = async (req, res) => {
  try {
    const ad = new Advertisement(req.body);
    await ad.save();
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update ad
export const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Advertisement.findByIdAndUpdate(id, req.body, { new: true });

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    res.json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete ad
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    await Advertisement.findByIdAndDelete(id);
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Track ad impression
export const trackImpression = async (req, res) => {
  try {
    const { id } = req.params;
    await Advertisement.findByIdAndUpdate(id, {
      $inc: { 'analytics.impressions': 1 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Track ad click
export const trackClick = async (req, res) => {
  try {
    const { id } = req.params;
    await Advertisement.findByIdAndUpdate(id, {
      $inc: { 'analytics.clicks': 1 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== BANNERS ====================

// Get all banners (admin)
export const getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, position } = req.query;

    const query = {};
    if (status) query.status = status;
    if (position) query.position = position;

    const banners = await Banner.find(query)
      .populate('contentId', 'title poster backdrop')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Banner.countDocuments(query);

    res.json({
      success: true,
      data: banners,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active banners for display (public)
export const getActiveBanners = async (req, res) => {
  try {
    const { page = 'home', position } = req.query;
    const now = new Date();

    const query = {
      status: 'active',
      targetPages: { $in: [page, 'all'] },
      $or: [
        { schedule: { $exists: false } },
        {
          'schedule.startDate': { $lte: now },
          'schedule.endDate': { $gte: now }
        }
      ]
    };

    if (position) query.position = position;

    const banners = await Banner.find(query)
      .populate('contentId', 'title poster backdrop rating year')
      .sort({ order: 1 })
      .select('-analytics');

    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create banner
export const createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Track banner view
export const trackBannerView = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndUpdate(id, {
      $inc: { 'analytics.views': 1 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Track banner click
export const trackBannerClick = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndUpdate(id, {
      $inc: { 'analytics.clicks': 1 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

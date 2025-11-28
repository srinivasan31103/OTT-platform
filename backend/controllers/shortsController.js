import Shorts from '../models/Shorts.js';
import WatchHistory from '../models/WatchHistory.js';
import Watchlist from '../models/Watchlist.js';
import Rating from '../models/Rating.js';
import { signHLSUrl } from '../utils/hlsSigner.js';

/**
 * Get shorts feed with pagination
 */
export const getShorts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const shorts = await Shorts.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Shorts.countDocuments();

    res.json({
      success: true,
      data: shorts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shorts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shorts',
      error: error.message
    });
  }
};

/**
 * Get short by ID
 */
export const getShortsById = async (req, res) => {
  try {
    const { id } = req.params;

    const short = await Shorts.findById(id).lean();

    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    res.json({
      success: true,
      data: short
    });
  } catch (error) {
    console.error('Error fetching short:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch short',
      error: error.message
    });
  }
};

/**
 * Search shorts
 */
export const searchShorts = async (req, res) => {
  try {
    const { q, hashtag } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { creator: { $regex: q, $options: 'i' } }
      ];
    }

    if (hashtag) {
      query.hashtags = { $in: [hashtag] };
    }

    const shorts = await Shorts.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Shorts.countDocuments(query);

    res.json({
      success: true,
      data: shorts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching shorts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search shorts',
      error: error.message
    });
  }
};

/**
 * Get shorts by genre
 */
export const getShortsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const shorts = await Shorts.find({ category: genre })
      .sort({ views: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Shorts.countDocuments({ category: genre });

    res.json({
      success: true,
      data: shorts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shorts by genre:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shorts',
      error: error.message
    });
  }
};

/**
 * Get trending shorts
 */
export const getTrendingShorts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const shorts = await Shorts.find({ trending: true })
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: shorts
    });
  } catch (error) {
    console.error('Error fetching trending shorts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending shorts',
      error: error.message
    });
  }
};

/**
 * Get featured shorts
 */
export const getFeaturedShorts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const shorts = await Shorts.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: shorts
    });
  } catch (error) {
    console.error('Error fetching featured shorts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured shorts',
      error: error.message
    });
  }
};

/**
 * Get shorts recommendations
 */
export const getShortsRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const currentShort = await Shorts.findById(id);
    if (!currentShort) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    // Find similar shorts based on category
    const shorts = await Shorts.find({
      _id: { $ne: id },
      category: currentShort.category
    })
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: shorts
    });
  } catch (error) {
    console.error('Error fetching short recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

/**
 * Get shorts stream URL
 */
export const getShortsStream = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const profileId = req.query.profileId;

    const short = await Shorts.findById(id);

    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    // Sign HLS URL for secure streaming
    const signedUrl = signHLSUrl(short.videoUrl);

    // Increment view count
    short.views = (short.views || 0) + 1;
    await short.save();

    // Create or update watch history
    await WatchHistory.findOneAndUpdate(
      { userId, profileId, contentId: id, contentType: 'short' },
      {
        userId,
        profileId,
        contentId: id,
        contentType: 'short',
        lastWatchedAt: new Date(),
        progress: 0
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        streamUrl: signedUrl,
        duration: short.duration,
        thumbnail: short.thumbnail
      }
    });
  } catch (error) {
    console.error('Error getting short stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stream URL',
      error: error.message
    });
  }
};

/**
 * Rate a short
 */
export const rateShort = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 10'
      });
    }

    const short = await Shorts.findById(id);
    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    // Create or update rating
    const existingRating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'short'
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();
    } else {
      await Rating.create({
        userId,
        contentId: id,
        contentType: 'short',
        rating,
        review
      });
    }

    // Recalculate average rating
    const ratings = await Rating.find({ contentId: id, contentType: 'short' });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    short.averageRating = avgRating;
    short.likes = ratings.length;
    await short.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        averageRating: avgRating,
        totalRatings: ratings.length
      }
    });
  } catch (error) {
    console.error('Error rating short:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

/**
 * Get user's rating for a short
 */
export const getShortRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'short'
    });

    res.json({
      success: true,
      data: rating || null
    });
  } catch (error) {
    console.error('Error fetching short rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message
    });
  }
};

/**
 * Add short to watchlist
 */
export const addShortToWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.body;

    const short = await Shorts.findById(id);
    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    const existing = await Watchlist.findOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'short'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Short already in watchlist'
      });
    }

    await Watchlist.create({
      userId,
      profileId,
      contentId: id,
      contentType: 'short'
    });

    res.json({
      success: true,
      message: 'Short added to watchlist'
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to watchlist',
      error: error.message
    });
  }
};

/**
 * Remove short from watchlist
 */
export const removeShortFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.query;

    await Watchlist.deleteOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'short'
    });

    res.json({
      success: true,
      message: 'Short removed from watchlist'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from watchlist',
      error: error.message
    });
  }
};

/**
 * Get watch progress
 */
export const getShortProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = req.user._id;

    const watchHistory = await WatchHistory.findOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'short'
    });

    res.json({
      success: true,
      data: watchHistory || { progress: 0 }
    });
  } catch (error) {
    console.error('Error fetching short progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

/**
 * Update watch progress
 */
export const updateShortProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, profileId } = req.body;
    const userId = req.user._id;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const watchHistory = await WatchHistory.findOneAndUpdate(
      { userId, profileId, contentId: id, contentType: 'short' },
      {
        userId,
        profileId,
        contentId: id,
        contentType: 'short',
        progress,
        lastWatchedAt: new Date(),
        completed: progress >= 90
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: watchHistory
    });
  } catch (error) {
    console.error('Error updating short progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/**
 * Get shorts from a specific creator
 */
export const getCreatorShorts = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const shorts = await Shorts.find({ creator: creatorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Shorts.countDocuments({ creator: creatorId });

    res.json({
      success: true,
      data: shorts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching creator shorts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shorts',
      error: error.message
    });
  }
};

/**
 * Like a short
 */
export const likeShort = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const short = await Shorts.findById(id);
    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    // Check if already rated (liked)
    const existingRating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'short'
    });

    if (!existingRating) {
      await Rating.create({
        userId,
        contentId: id,
        contentType: 'short',
        rating: 10 // Like = max rating
      });

      short.likes = (short.likes || 0) + 1;
      await short.save();
    }

    res.json({
      success: true,
      message: 'Short liked',
      data: { likes: short.likes }
    });
  } catch (error) {
    console.error('Error liking short:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like short',
      error: error.message
    });
  }
};

/**
 * Unlike a short
 */
export const unlikeShort = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const short = await Shorts.findById(id);
    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    await Rating.deleteOne({
      userId,
      contentId: id,
      contentType: 'short'
    });

    short.likes = Math.max(0, (short.likes || 0) - 1);
    await short.save();

    res.json({
      success: true,
      message: 'Short unliked',
      data: { likes: short.likes }
    });
  } catch (error) {
    console.error('Error unliking short:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike short',
      error: error.message
    });
  }
};

/**
 * Share a short (track sharing)
 */
export const shareShort = async (req, res) => {
  try {
    const { id } = req.params;

    const short = await Shorts.findById(id);
    if (!short) {
      return res.status(404).json({
        success: false,
        message: 'Short not found'
      });
    }

    short.shares = (short.shares || 0) + 1;
    await short.save();

    res.json({
      success: true,
      message: 'Share recorded',
      data: { shares: short.shares }
    });
  } catch (error) {
    console.error('Error sharing short:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record share',
      error: error.message
    });
  }
};

/**
 * Report inappropriate short
 */
export const reportShort = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const userId = req.user._id;

    // Log report (in production, save to database or send to moderation queue)
    console.log('Short reported:', {
      shortId: id,
      userId,
      reason,
      description,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Short reported successfully. Our team will review it.'
    });
  } catch (error) {
    console.error('Error reporting short:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report short',
      error: error.message
    });
  }
};

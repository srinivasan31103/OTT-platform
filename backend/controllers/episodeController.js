import Episode from '../models/Episode.js';
import Series from '../models/Series.js';
import WatchHistory from '../models/WatchHistory.js';
import Rating from '../models/Rating.js';
import { signHLSUrl } from '../utils/hlsSigner.js';

/**
 * Get episode by ID
 */
export const getEpisodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findById(id)
      .populate('seriesId', 'title thumbnail genres')
      .lean();

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    res.json({
      success: true,
      data: episode
    });
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch episode',
      error: error.message
    });
  }
};

/**
 * Get all episodes for a specific season
 */
export const getEpisodesBySeasonId = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const episodes = await Episode.find({ seasonId: parseInt(seasonId) })
      .populate('seriesId', 'title thumbnail')
      .sort({ episodeNumber: 1 })
      .lean();

    res.json({
      success: true,
      count: episodes.length,
      data: episodes
    });
  } catch (error) {
    console.error('Error fetching episodes by season:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch episodes',
      error: error.message
    });
  }
};

/**
 * Get episode streaming URL
 */
export const getEpisodeStream = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const profileId = req.query.profileId;

    const episode = await Episode.findById(id);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Check subscription access
    const hasAccess = await checkContentAccess(req.user, episode.subscriptionTier);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required to watch this episode'
      });
    }

    // Sign HLS URL for secure streaming
    const signedUrl = signHLSUrl(episode.hlsUrl);

    // Increment view count
    episode.views = (episode.views || 0) + 1;
    await episode.save();

    // Create or update watch history
    await WatchHistory.findOneAndUpdate(
      { userId, profileId, contentId: id, contentType: 'episode' },
      {
        userId,
        profileId,
        contentId: id,
        contentType: 'episode',
        lastWatchedAt: new Date(),
        progress: 0
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        streamUrl: signedUrl,
        qualities: episode.qualities || ['1080p', '720p', '480p', '360p'],
        duration: episode.duration,
        subtitles: episode.subtitles || [],
        thumbnail: episode.thumbnail
      }
    });
  } catch (error) {
    console.error('Error getting episode stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stream URL',
      error: error.message
    });
  }
};

/**
 * Rate an episode
 */
export const rateEpisode = async (req, res) => {
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

    const episode = await Episode.findById(id);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Create or update rating
    const existingRating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'episode'
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();
    } else {
      await Rating.create({
        userId,
        contentId: id,
        contentType: 'episode',
        rating,
        review
      });
    }

    // Recalculate average rating
    const ratings = await Rating.find({ contentId: id, contentType: 'episode' });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    episode.averageRating = avgRating;
    episode.totalRatings = ratings.length;
    await episode.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        averageRating: avgRating,
        totalRatings: ratings.length
      }
    });
  } catch (error) {
    console.error('Error rating episode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

/**
 * Get user's rating for an episode
 */
export const getEpisodeRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'episode'
    });

    res.json({
      success: true,
      data: rating || null
    });
  } catch (error) {
    console.error('Error fetching episode rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message
    });
  }
};

/**
 * Update watch progress
 */
export const updateEpisodeProgress = async (req, res) => {
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
      { userId, profileId, contentId: id, contentType: 'episode' },
      {
        userId,
        profileId,
        contentId: id,
        contentType: 'episode',
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
    console.error('Error updating episode progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/**
 * Get watch progress
 */
export const getEpisodeProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = req.user._id;

    const watchHistory = await WatchHistory.findOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'episode'
    });

    res.json({
      success: true,
      data: watchHistory || { progress: 0 }
    });
  } catch (error) {
    console.error('Error fetching episode progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

/**
 * Get full episode details
 */
export const getEpisodeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.query;

    const episode = await Episode.findById(id)
      .populate('seriesId', 'title description thumbnail banner genres cast crew year maturityRating')
      .lean();

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Get user's watch progress
    const watchHistory = await WatchHistory.findOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'episode'
    });

    // Get user's rating
    const userRating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'episode'
    });

    // Get other episodes in the same season
    const relatedEpisodes = await Episode.find({
      seriesId: episode.seriesId._id,
      seasonId: episode.seasonId,
      _id: { $ne: id }
    })
      .sort({ episodeNumber: 1 })
      .limit(10)
      .select('title episodeNumber thumbnail duration')
      .lean();

    res.json({
      success: true,
      data: {
        ...episode,
        progress: watchHistory?.progress || 0,
        userRating: userRating?.rating || null,
        relatedEpisodes
      }
    });
  } catch (error) {
    console.error('Error fetching episode details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch episode details',
      error: error.message
    });
  }
};

/**
 * Get episode subtitles
 */
export const getEpisodeSubtitles = async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findById(id).select('subtitles').lean();

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    res.json({
      success: true,
      data: episode.subtitles || []
    });
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subtitles',
      error: error.message
    });
  }
};

/**
 * Report playback issue
 */
export const reportEpisodeIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { issueType, description } = req.body;
    const userId = req.user._id;

    // Log issue (in production, save to database or send to monitoring service)
    console.log('Episode playback issue reported:', {
      episodeId: id,
      userId,
      issueType,
      description,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Issue reported successfully. Our team will investigate.'
    });
  } catch (error) {
    console.error('Error reporting episode issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: error.message
    });
  }
};

// Helper function to check content access
async function checkContentAccess(user, requiredTier) {
  const tierHierarchy = { basic: 1, standard: 2, premium: 3 };
  const userTier = user.subscription?.type || 'basic';

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

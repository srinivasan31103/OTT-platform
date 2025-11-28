import WatchHistory from '../models/WatchHistory.js';
import Profile from '../models/Profile.js';
import Movie from '../models/Movie.js';
import Episode from '../models/Episode.js';

// Update watch history
export const updateWatchHistory = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { contentId, contentType, lastPosition, duration, quality, subtitleLanguage, audioLanguage, device } = req.body;

    // Validation
    if (!profileId || !contentId || !contentType || duration === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID, content ID, type, and duration are required'
      });
    }

    if (!['Movie', 'Episode', 'Shorts'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    // Verify profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update or create watch history
    const watchHistory = await WatchHistory.findOneAndUpdate(
      {
        profile: profileId,
        contentId,
        contentType
      },
      {
        profile: profileId,
        contentId,
        contentType,
        lastPosition: lastPosition || 0,
        duration,
        lastWatchedAt: new Date(),
        quality: quality || 'auto',
        subtitleLanguage: subtitleLanguage || 'en',
        audioLanguage: audioLanguage || 'en',
        device: device || {}
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Watch history updated',
      data: {
        _id: watchHistory._id,
        lastPosition: watchHistory.lastPosition,
        watchedPercentage: watchHistory.watchedPercentage,
        finished: watchHistory.finished,
        lastWatchedAt: watchHistory.lastWatchedAt
      }
    });
  } catch (error) {
    console.error('Update watch history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating watch history',
      error: error.message
    });
  }
};

// Get continue watching
export const getContinueWatching = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { limit = 20 } = req.query;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const continueWatching = await WatchHistory.find({
      profile: profileId,
      finished: false
    })
      .sort('-lastWatchedAt')
      .limit(parseInt(limit))
      .populate({
        path: 'contentId',
        select: 'title thumbnail slug duration'
      });

    const formatted = continueWatching.map(history => ({
      _id: history._id,
      content: {
        _id: history.contentId?._id,
        title: history.contentId?.title,
        thumbnail: history.contentId?.thumbnail,
        slug: history.contentId?.slug,
        type: history.contentType
      },
      lastPosition: history.lastPosition,
      duration: history.duration,
      watchedPercentage: history.watchedPercentage,
      lastWatchedAt: history.lastWatchedAt
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Get continue watching error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching continue watching',
      error: error.message
    });
  }
};

// Get watch history
export const getWatchHistory = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { page = 1, limit = 20, contentType } = req.query;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const filter = { profile: profileId };
    if (contentType) {
      filter.contentType = contentType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await WatchHistory.countDocuments(filter);

    const watchHistory = await WatchHistory.find(filter)
      .sort('-lastWatchedAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'contentId',
        select: 'title thumbnail slug duration year'
      });

    const formatted = watchHistory.map(history => ({
      _id: history._id,
      content: {
        _id: history.contentId?._id,
        title: history.contentId?.title,
        thumbnail: history.contentId?.thumbnail,
        slug: history.contentId?.slug,
        type: history.contentType,
        year: history.contentId?.year
      },
      lastPosition: history.lastPosition,
      duration: history.duration,
      watchedPercentage: history.watchedPercentage,
      finished: history.finished,
      lastWatchedAt: history.lastWatchedAt
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching watch history',
      error: error.message
    });
  }
};

// Clear watch history
export const clearWatchHistory = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { contentId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (contentId) {
      // Delete specific entry
      await WatchHistory.deleteOne({
        profile: profileId,
        contentId
      });

      return res.status(200).json({
        success: true,
        message: 'Watch history entry deleted'
      });
    } else {
      // Delete all entries for profile
      await WatchHistory.deleteMany({ profile: profileId });

      return res.status(200).json({
        success: true,
        message: 'Watch history cleared'
      });
    }
  } catch (error) {
    console.error('Clear watch history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing watch history',
      error: error.message
    });
  }
};

// Get viewing statistics
export const getViewingStats = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { startDate, endDate } = req.query;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const filter = { profile: profileId };
    if (startDate && endDate) {
      filter.lastWatchedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const watchHistory = await WatchHistory.find(filter);

    // Calculate statistics
    const totalWatched = watchHistory.length;
    const totalMinutesWatched = watchHistory.reduce((sum, h) => {
      return sum + Math.min(h.lastPosition || 0, h.duration || 0);
    }, 0);

    const finishedContent = watchHistory.filter(h => h.finished).length;

    // Breakdown by content type
    const contentTypeBreakdown = {};
    watchHistory.forEach(h => {
      contentTypeBreakdown[h.contentType] = (contentTypeBreakdown[h.contentType] || 0) + 1;
    });

    // Most watched times
    const preferredWatchTimes = await WatchHistory.aggregate([
      {
        $match: { profile: profile._id }
      },
      {
        $group: {
          _id: {
            $hour: '$lastWatchedAt'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalWatched,
        totalMinutesWatched,
        averageSessionLength: totalWatched > 0 ? Math.round(totalMinutesWatched / totalWatched) : 0,
        finishedContent,
        completionRate: totalWatched > 0 ? Math.round((finishedContent / totalWatched) * 100) : 0,
        contentTypeBreakdown,
        preferredWatchTimes: preferredWatchTimes.slice(0, 3)
      }
    });
  } catch (error) {
    console.error('Get viewing stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching viewing statistics',
      error: error.message
    });
  }
};

// Mark as watched
export const markAsWatched = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { contentId, contentType } = req.body;

    if (!profileId || !contentId || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID, content ID, and type are required'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const watchHistory = await WatchHistory.findOneAndUpdate(
      {
        profile: profileId,
        contentId,
        contentType
      },
      {
        finished: true,
        watchedPercentage: 100,
        lastWatchedAt: new Date()
      },
      { new: true }
    );

    if (!watchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Watch history entry not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Content marked as watched',
      data: watchHistory
    });
  } catch (error) {
    console.error('Mark as watched error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking content as watched',
      error: error.message
    });
  }
};

// Get resume positions
export const getResumePositions = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { contentIds } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    let filter = { profile: profileId };
    if (contentIds && Array.isArray(contentIds)) {
      filter.contentId = { $in: contentIds };
    }

    const positions = await WatchHistory.find(filter)
      .select('contentId contentType lastPosition duration');

    const formatted = positions.map(p => ({
      contentId: p.contentId,
      contentType: p.contentType,
      lastPosition: p.lastPosition,
      duration: p.duration,
      resumableAt: p.lastPosition > 0 ? p.lastPosition : 0
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Get resume positions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching resume positions',
      error: error.message
    });
  }
};

// Add to watch history
export const addToWatchHistory = updateWatchHistory; // Alias

// Remove from watch history
export const removeFromWatchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.query;

    await WatchHistory.deleteOne({
      userId,
      profileId,
      contentId: id
    });

    res.json({
      success: true,
      message: 'Removed from watch history'
    });
  } catch (error) {
    console.error('Error removing from watch history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from watch history',
      error: error.message
    });
  }
};

// Get recently watched
export const getRecentlyWatched = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    const recentlyWatched = await WatchHistory.find({
      userId,
      profileId
    })
      .sort({ lastWatchedAt: -1 })
      .limit(limit)
      .populate('contentId')
      .lean();

    res.json({
      success: true,
      data: recentlyWatched
    });
  } catch (error) {
    console.error('Error fetching recently watched:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recently watched',
      error: error.message
    });
  }
};

// Get watch stats
export const getWatchStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.query;

    const stats = await WatchHistory.aggregate([
      { $match: { userId: userId.toString(), profileId } },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching watch stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watch stats',
      error: error.message
    });
  }
};

// Get total watch time
export const getTotalWatchTime = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.query;

    const result = await WatchHistory.aggregate([
      { $match: { userId: userId.toString(), profileId } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$duration' }
        }
      }
    ]);

    const totalMinutes = result.length > 0 ? result[0].totalMinutes : 0;

    res.json({
      success: true,
      data: {
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
        totalDays: Math.floor(totalMinutes / (60 * 24))
      }
    });
  } catch (error) {
    console.error('Error fetching total watch time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch total watch time',
      error: error.message
    });
  }
};

// Get watch streak
export const getWatchStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.query;

    const watchHistory = await WatchHistory.find({
      userId,
      profileId
    })
      .sort({ lastWatchedAt: -1 })
      .select('lastWatchedAt')
      .lean();

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const item of watchHistory) {
      const watchDate = new Date(item.lastWatchedAt);
      watchDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - watchDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        currentStreak: streak,
        longestStreak: streak
      }
    });
  } catch (error) {
    console.error('Error fetching watch streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watch streak',
      error: error.message
    });
  }
};

// Get watched content
export const getWatchedContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId, contentType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { userId, profileId };
    if (contentType) {
      query.contentType = contentType;
    }

    const watchHistory = await WatchHistory.find(query)
      .sort({ lastWatchedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('contentId')
      .lean();

    const total = await WatchHistory.countDocuments(query);

    res.json({
      success: true,
      data: watchHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching watched content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watched content',
      error: error.message
    });
  }
};

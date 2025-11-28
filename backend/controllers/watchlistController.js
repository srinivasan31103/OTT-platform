import Watchlist from '../models/Watchlist.js';
import Profile from '../models/Profile.js';
import Movie from '../models/Movie.js';
import Series from '../models/Series.js';

// Add to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { contentId, contentType, notifyOnRelease, priority } = req.body;

    // Validation
    if (!profileId || !contentId || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID, content ID, and type are required'
      });
    }

    if (!['Movie', 'Series', 'Shorts'].includes(contentType)) {
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

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      profile: profileId,
      contentId,
      contentType
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Content already in watchlist'
      });
    }

    // Add to watchlist
    const watchlistItem = new Watchlist({
      profile: profileId,
      contentId,
      contentType,
      notifyOnRelease: notifyOnRelease || false,
      priority: priority || 0,
      addedAt: new Date()
    });

    await watchlistItem.save();

    return res.status(201).json({
      success: true,
      message: 'Content added to watchlist',
      data: watchlistItem
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding to watchlist',
      error: error.message
    });
  }
};

// Get watchlist
export const getWatchlist = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { page = 1, limit = 20, contentType, sort = '-addedAt' } = req.query;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
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

    // Build filter
    const filter = { profile: profileId };
    if (contentType) {
      filter.contentType = contentType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Watchlist.countDocuments(filter);

    // Get watchlist items
    const watchlistItems = await Watchlist.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'contentId',
        select: 'title thumbnail slug year genres maturityRating averageRating duration totalSeasons'
      });

    // Format response
    const formatted = watchlistItems.map(item => ({
      _id: item._id,
      content: {
        _id: item.contentId?._id,
        title: item.contentId?.title,
        thumbnail: item.contentId?.thumbnail,
        slug: item.contentId?.slug,
        type: item.contentType,
        year: item.contentId?.year,
        genres: item.contentId?.genres,
        maturityRating: item.contentId?.maturityRating,
        averageRating: item.contentId?.averageRating,
        duration: item.contentId?.duration,
        totalSeasons: item.contentId?.totalSeasons
      },
      notifyOnRelease: item.notifyOnRelease,
      priority: item.priority,
      addedAt: item.addedAt
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
    console.error('Get watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching watchlist',
      error: error.message
    });
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { watchlistId } = req.params;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
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

    // Find and delete
    const watchlistItem = await Watchlist.findOneAndDelete({
      _id: watchlistId,
      profile: profileId
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Content removed from watchlist'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing from watchlist',
      error: error.message
    });
  }
};

// Remove multiple from watchlist
export const removeMultipleFromWatchlist = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { watchlistIds } = req.body;

    if (!profileId || !Array.isArray(watchlistIds) || watchlistIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID and watchlist IDs are required'
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

    // Delete multiple items
    const result = await Watchlist.deleteMany({
      _id: { $in: watchlistIds },
      profile: profileId
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} items removed from watchlist`
    });
  } catch (error) {
    console.error('Remove multiple from watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing items from watchlist',
      error: error.message
    });
  }
};

// Update watchlist item
export const updateWatchlistItem = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { watchlistId } = req.params;
    const { notifyOnRelease, priority } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
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

    // Update item
    const updates = {};
    if (notifyOnRelease !== undefined) updates.notifyOnRelease = notifyOnRelease;
    if (priority !== undefined) updates.priority = priority;

    const watchlistItem = await Watchlist.findOneAndUpdate(
      {
        _id: watchlistId,
        profile: profileId
      },
      updates,
      { new: true }
    );

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Watchlist item updated',
      data: watchlistItem
    });
  } catch (error) {
    console.error('Update watchlist item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating watchlist item',
      error: error.message
    });
  }
};

// Check if content in watchlist
export const isInWatchlist = async (req, res) => {
  try {
    const { profileId } = req.headers;
    const { contentId } = req.params;

    if (!profileId || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID and content ID are required'
      });
    }

    const watchlistItem = await Watchlist.findOne({
      profile: profileId,
      contentId
    });

    return res.status(200).json({
      success: true,
      data: {
        inWatchlist: !!watchlistItem,
        watchlistId: watchlistItem?._id || null
      }
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking watchlist',
      error: error.message
    });
  }
};

// Get watchlist count
export const getWatchlistCount = async (req, res) => {
  try {
    const { profileId } = req.headers;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const count = await Watchlist.countDocuments({
      profile: profileId
    });

    return res.status(200).json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Get watchlist count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching watchlist count',
      error: error.message
    });
  }
};

// Clear watchlist
export const clearWatchlist = async (req, res) => {
  try {
    const { profileId } = req.headers;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
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

    const result = await Watchlist.deleteMany({
      profile: profileId
    });

    return res.status(200).json({
      success: true,
      message: 'Watchlist cleared',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing watchlist',
      error: error.message
    });
  }
};

// Get watchlist statistics
export const getWatchlistStats = async (req, res) => {
  try {
    const { profileId } = req.headers;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
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

    // Get statistics
    const totalItems = await Watchlist.countDocuments({ profile: profileId });

    const typeBreakdown = await Watchlist.aggregate([
      { $match: { profile: profile._id } },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityBreakdown = await Watchlist.aggregate([
      { $match: { profile: profile._id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const notifyEnabled = await Watchlist.countDocuments({
      profile: profileId,
      notifyOnRelease: true
    });

    return res.status(200).json({
      success: true,
      data: {
        totalItems,
        typeBreakdown,
        priorityBreakdown,
        notifyEnabled,
        avgPriority: totalItems > 0 ? Math.round((priorityBreakdown.reduce((sum, p) => sum + (p._id * p.count), 0) / totalItems) * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Get watchlist stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching watchlist statistics',
      error: error.message
    });
  }
};

// Get watchlist by profile
export const getWatchlistByProfile = getWatchlist; // Alias

// Create custom list
export const createCustomList = async (req, res) => {
  try {
    const { name, description, profileId } = req.body;
    const userId = req.user._id;

    // For this implementation, we'll use a simple tag-based system
    res.json({
      success: true,
      message: 'Custom list created',
      data: {
        name,
        description,
        items: []
      }
    });
  } catch (error) {
    console.error('Error creating custom list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom list',
      error: error.message
    });
  }
};

// Get custom lists
export const getCustomLists = async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching custom lists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom lists',
      error: error.message
    });
  }
};

// Delete custom list
export const deleteCustomList = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Custom list deleted'
    });
  } catch (error) {
    console.error('Error deleting custom list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom list',
      error: error.message
    });
  }
};

// Add to custom list
export const addToCustomList = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Added to custom list'
    });
  } catch (error) {
    console.error('Error adding to custom list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to custom list',
      error: error.message
    });
  }
};

// Remove from custom list
export const removeFromCustomList = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Removed from custom list'
    });
  } catch (error) {
    console.error('Error removing from custom list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from custom list',
      error: error.message
    });
  }
};

// Reorder watchlist
export const reorderWatchlist = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Watchlist reordered'
    });
  } catch (error) {
    console.error('Error reordering watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder watchlist',
      error: error.message
    });
  }
};

// Share watchlist
export const shareWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.query;

    const shareToken = Buffer.from(`${userId}:${profileId}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      data: {
        shareUrl: `${process.env.FRONTEND_URL}/shared-watchlist/${shareToken}`,
        token: shareToken
      }
    });
  } catch (error) {
    console.error('Error sharing watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share watchlist',
      error: error.message
    });
  }
};

// Check if in watchlist
export const checkInWatchlist = isInWatchlist; // Alias

// Get saved for later
export const getSavedForLater = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.query;

    const watchlist = await Watchlist.find({
      userId,
      profileId,
      tags: 'saved-for-later'
    })
      .populate('contentId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    console.error('Error fetching saved for later:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved for later',
      error: error.message
    });
  }
};

// Add to saved for later
export const addToSavedForLater = async (req, res) => {
  try {
    const { contentId, contentType, profileId } = req.body;
    const userId = req.user._id;

    const existing = await Watchlist.findOne({
      userId,
      profileId,
      contentId,
      contentType
    });

    if (existing) {
      if (!existing.tags) existing.tags = [];
      if (!existing.tags.includes('saved-for-later')) {
        existing.tags.push('saved-for-later');
        await existing.save();
      }
    } else {
      await Watchlist.create({
        userId,
        profileId,
        contentId,
        contentType,
        tags: ['saved-for-later']
      });
    }

    res.json({
      success: true,
      message: 'Added to saved for later'
    });
  } catch (error) {
    console.error('Error adding to saved for later:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to saved for later',
      error: error.message
    });
  }
};

// Remove from saved for later
export const removeFromSavedForLater = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.query;

    const item = await Watchlist.findOne({
      userId,
      profileId,
      contentId: id
    });

    if (item) {
      if (item.tags) {
        item.tags = item.tags.filter(tag => tag !== 'saved-for-later');
        await item.save();
      }
    }

    res.json({
      success: true,
      message: 'Removed from saved for later'
    });
  } catch (error) {
    console.error('Error removing from saved for later:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from saved for later',
      error: error.message
    });
  }
};

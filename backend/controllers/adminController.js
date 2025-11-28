import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import Episode from '../models/Episode.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload movie
export const uploadMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      year,
      duration,
      genres,
      maturityRating,
      subscriptionTier,
      videoUrl,
      hlsUrl,
      dashUrl,
      cast,
      director,
      studio
    } = req.body;

    // Validation
    if (!title || !description || !year || !duration || !genres || !maturityRating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Upload thumbnail if provided
    let thumbnailUrl = req.body.thumbnail;
    if (req.files?.thumbnail) {
      const uploadResult = await cloudinary.v2.uploader.upload(req.files.thumbnail.path, {
        folder: 'streamverse/movies/thumbnails',
        public_id: `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      });
      thumbnailUrl = uploadResult.secure_url;
    }

    // Create movie document
    const movie = new Movie({
      title,
      description,
      shortDescription: description.substring(0, 200),
      year: parseInt(year),
      duration: parseInt(duration),
      genres: Array.isArray(genres) ? genres : [genres],
      maturityRating,
      subscriptionTier: subscriptionTier || 'free',
      thumbnail: thumbnailUrl,
      videoUrl,
      hlsUrl,
      dashUrl,
      cast: cast || [],
      director: director || [],
      studio,
      status: 'published',
      uploadedBy: req.user._id
    });

    await movie.save();

    return res.status(201).json({
      success: true,
      message: 'Movie uploaded successfully',
      data: movie
    });
  } catch (error) {
    console.error('Upload movie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading movie',
      error: error.message
    });
  }
};

// Upload series
export const uploadSeries = async (req, res) => {
  try {
    const {
      title,
      description,
      year,
      genres,
      maturityRating,
      subscriptionTier,
      totalSeasons,
      cast,
      director,
      creators,
      studio
    } = req.body;

    // Validation
    if (!title || !description || !year || !genres || !maturityRating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Upload thumbnail
    let thumbnailUrl = req.body.thumbnail;
    if (req.files?.thumbnail) {
      const uploadResult = await cloudinary.v2.uploader.upload(req.files.thumbnail.path, {
        folder: 'streamverse/series/thumbnails',
        public_id: `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      });
      thumbnailUrl = uploadResult.secure_url;
    }

    const series = new Series({
      title,
      description,
      shortDescription: description.substring(0, 200),
      year: parseInt(year),
      genres: Array.isArray(genres) ? genres : [genres],
      maturityRating,
      subscriptionTier: subscriptionTier || 'free',
      totalSeasons: parseInt(totalSeasons) || 1,
      thumbnail: thumbnailUrl,
      cast: cast || [],
      director: director || [],
      creators: creators || [],
      studio,
      status: 'ongoing',
      uploadedBy: req.user._id
    });

    await series.save();

    return res.status(201).json({
      success: true,
      message: 'Series created successfully',
      data: series
    });
  } catch (error) {
    console.error('Upload series error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading series',
      error: error.message
    });
  }
};

// Upload episode
export const uploadEpisode = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const {
      title,
      description,
      seasonNumber,
      episodeNumber,
      duration,
      videoUrl,
      hlsUrl,
      dashUrl,
      releaseDate
    } = req.body;

    // Validation
    if (!title || !seasonNumber || !episodeNumber || !duration || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Upload thumbnail
    let thumbnailUrl = req.body.thumbnail;
    if (req.files?.thumbnail) {
      const uploadResult = await cloudinary.v2.uploader.upload(req.files.thumbnail.path, {
        folder: `streamverse/series/${seriesId}/episodes`,
        public_id: `s${seasonNumber}e${episodeNumber}-${Date.now()}`
      });
      thumbnailUrl = uploadResult.secure_url;
    }

    const episode = new Episode({
      series: seriesId,
      title,
      description,
      shortDescription: description?.substring(0, 200) || '',
      seasonNumber: parseInt(seasonNumber),
      episodeNumber: parseInt(episodeNumber),
      duration: parseInt(duration),
      thumbnail: thumbnailUrl,
      videoUrl,
      hlsUrl,
      dashUrl,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      status: 'published',
      uploadedBy: req.user._id
    });

    await episode.save();

    // Update series total episodes
    series.totalEpisodes = await Episode.countDocuments({
      series: seriesId,
      status: 'published'
    });
    await series.save();

    return res.status(201).json({
      success: true,
      message: 'Episode uploaded successfully',
      data: episode
    });
  } catch (error) {
    console.error('Upload episode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading episode',
      error: error.message
    });
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Subscription statistics
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalSubscriptions = await Subscription.countDocuments();

    const subscriptionRevenue = await Subscription.aggregate([
      {
        $match: {
          status: 'active',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Content statistics
    const totalMovies = await Movie.countDocuments({ status: 'published' });
    const totalSeries = await Series.countDocuments({ status: { $in: ['ongoing', 'completed'] } });
    const totalEpisodes = await Episode.countDocuments({ status: 'published' });

    // Top content
    const topMovies = await Movie.find({ status: 'published' })
      .sort('-views')
      .limit(5)
      .select('title views');

    const topSeries = await Series.find({ status: { $in: ['ongoing', 'completed'] } })
      .sort('-views')
      .limit(5)
      .select('title views');

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalContent: totalMovies + totalSeries + totalEpisodes,
        totalRevenue: subscriptionRevenue[0]?.totalRevenue || 0,
        activeSubscriptions,
        totalMovies,
        totalSeries,
        totalEpisodes,
        newUsers,
        users: {
          total: totalUsers,
          new: newUsers
        },
        subscriptions: {
          active: activeSubscriptions,
          total: totalSubscriptions,
          revenue: subscriptionRevenue[0] || { totalRevenue: 0, count: 0 }
        },
        content: {
          totalMovies,
          totalSeries,
          totalEpisodes
        },
        topContent: {
          movies: topMovies,
          series: topSeries
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Subscription plan distribution
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Region distribution
    const regionStats = await User.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        growth: userGrowth,
        subscriptionDistribution: subscriptionStats,
        regionDistribution: regionStats
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

// Manage users - suspend/activate
export const manageUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;

    if (!['suspend', 'activate', 'promote', 'demote'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    switch (action) {
      case 'suspend':
        user.subscription.status = 'cancelled';
        break;
      case 'activate':
        user.subscription.status = 'active';
        break;
      case 'promote':
        user.isAdmin = true;
        break;
      case 'demote':
        user.isAdmin = false;
        break;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${action}ed successfully`,
      data: user
    });
  } catch (error) {
    console.error('Manage user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error managing user',
      error: error.message
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const filter = {
      isAdmin: { $ne: true } // Exclude admin users
    };

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter['subscription.status'] = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Update movie
export const updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const updates = req.body;

    const movie = await Movie.findByIdAndUpdate(
      movieId,
      updates,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating movie',
      error: error.message
    });
  }
};

// Delete movie
export const deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Soft delete
    movie.status = 'archived';
    await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting movie',
      error: error.message
    });
  }
};

// Feature movie
export const featureContent = async (req, res) => {
  try {
    const { contentId, contentType, featured } = req.body;

    if (!contentId || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content ID and type are required'
      });
    }

    let content;
    if (contentType === 'Series') {
      content = await Series.findByIdAndUpdate(
        contentId,
        { featured: featured === true },
        { new: true }
      );
    } else {
      content = await Movie.findByIdAndUpdate(
        contentId,
        { featured: featured === true },
        { new: true }
      );
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Content featured status updated',
      data: content
    });
  } catch (error) {
    console.error('Feature content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating featured status',
      error: error.message
    });
  }
};

// Get content moderation queue
export const getModerationQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, contentType } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (contentType === 'Movie') {
      const movies = await Movie.find({ status: 'draft' })
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt');

      const total = await Movie.countDocuments({ status: 'draft' });

      return res.status(200).json({
        success: true,
        data: movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } else {
      const series = await Series.find({ status: 'draft' })
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt');

      const total = await Series.countDocuments({ status: 'draft' });

      return res.status(200).json({
        success: true,
        data: series,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }
  } catch (error) {
    console.error('Get moderation queue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching moderation queue',
      error: error.message
    });
  }
};

// Approve/Reject content
export const reviewContent = async (req, res) => {
  try {
    const { contentId, contentType, approved, notes } = req.body;

    let content;
    if (contentType === 'Series') {
      content = await Series.findById(contentId);
    } else {
      content = await Movie.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    content.status = approved ? 'published' : 'archived';
    await content.save();

    return res.status(200).json({
      success: true,
      message: approved ? 'Content approved' : 'Content rejected',
      data: content
    });
  } catch (error) {
    console.error('Review content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error reviewing content',
      error: error.message
    });
  }
};

// Approve content for publishing
export const approveContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Movie.findByIdAndUpdate(id, { status: 'published' }, { new: true });
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete content
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    await Movie.findByIdAndDelete(id);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Additional stub exports for admin routes
export const getDashboard = async (req, res) => { res.json({ success: true, data: {} }); };
export const getAnalytics = async (req, res) => { res.json({ success: true, data: {} }); };
export const getUsers = async (req, res) => { res.json({ success: true, data: [] }); };
export const getUserById = async (req, res) => { res.json({ success: true, data: null }); };
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const suspendUser = async (req, res) => { res.json({ success: true }); };
export const unsuspendUser = async (req, res) => { res.json({ success: true }); };
export const getContent = async (req, res) => { res.json({ success: true, data: [] }); };
export const getContentById = async (req, res) => { res.json({ success: true, data: null }); };
export const publishContent = async (req, res) => { res.json({ success: true }); };
export const unpublishContent = async (req, res) => { res.json({ success: true }); };
export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const content = await Movie.findByIdAndUpdate(id, updates, { new: true });
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content, message: 'Content updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const rejectContent = async (req, res) => { res.json({ success: true }); };
export const getReports = async (req, res) => { res.json({ success: true, data: [] }); };
export const getReportById = async (req, res) => { res.json({ success: true, data: null }); };
export const resolveReport = async (req, res) => { res.json({ success: true }); };
export const dismissReport = async (req, res) => { res.json({ success: true }); };
export const getSubscriptions = async (req, res) => { res.json({ success: true, data: [] }); };
export const getSubscriptionById = async (req, res) => { res.json({ success: true, data: null }); };
export const refundSubscription = async (req, res) => { res.json({ success: true }); };
export const getTransactions = async (req, res) => { res.json({ success: true, data: [] }); };
export const getTransactionById = async (req, res) => { res.json({ success: true, data: null }); };
export const refundTransaction = async (req, res) => { res.json({ success: true }); };
export const getSystemLogs = async (req, res) => { res.json({ success: true, data: [] }); };
export const getAuditLogs = async (req, res) => { res.json({ success: true, data: [] }); };
export const manageModerators = async (req, res) => { res.json({ success: true, data: [] }); };
export const setContentRestrictions = async (req, res) => { res.json({ success: true }); };
export const getGeoRestrictions = async (req, res) => { res.json({ success: true, data: [] }); };
export const updateGeoRestrictions = async (req, res) => { res.json({ success: true }); };
export const managePromos = async (req, res) => { res.json({ success: true, data: [] }); };
export const createPromo = async (req, res) => { res.json({ success: true }); };
export const updatePromo = async (req, res) => { res.json({ success: true }); };
export const deletePromo = async (req, res) => { res.json({ success: true }); };
export const getSystemHealth = async (req, res) => { res.json({ success: true, data: {} }); };
export const manageCDN = async (req, res) => { res.json({ success: true, data: {} }); };
export const viewNotifications = async (req, res) => { res.json({ success: true, data: [] }); };
export const sendNotification = async (req, res) => { res.json({ success: true }); };
export const manageAdmins = async (req, res) => { res.json({ success: true, data: [] }); };
export const manageRoles = async (req, res) => { res.json({ success: true, data: [] }); };
export const setPermissions = async (req, res) => { res.json({ success: true }); };
export const exportData = async (req, res) => { res.json({ success: true }); };
export const importData = async (req, res) => { res.json({ success: true }); };
export const getBackups = async (req, res) => { res.json({ success: true, data: [] }); };
export const createBackup = async (req, res) => { res.json({ success: true }); };
export const restoreBackup = async (req, res) => { res.json({ success: true }); };
export const getConfigSettings = async (req, res) => { res.json({ success: true, data: {} }); };
export const updateConfigSettings = async (req, res) => { res.json({ success: true }); };
export const getEmailTemplates = async (req, res) => { res.json({ success: true, data: [] }); };
export const updateEmailTemplate = async (req, res) => { res.json({ success: true }); };
export const testEmailTemplate = async (req, res) => { res.json({ success: true }); };
export const getBannedUsers = async (req, res) => { res.json({ success: true, data: [] }); };
export const banUser = async (req, res) => { res.json({ success: true }); };
export const unbanUser = async (req, res) => { res.json({ success: true }); };
export const getContentModeration = async (req, res) => { res.json({ success: true, data: [] }); };
export const approveModeration = async (req, res) => { res.json({ success: true }); };
export const rejectModeration = async (req, res) => { res.json({ success: true }); };

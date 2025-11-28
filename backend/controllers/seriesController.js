import Series from '../models/Series.js';
import Episode from '../models/Episode.js';
import Rating from '../models/Rating.js';

// Get all series with filtering and pagination
export const getSeries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      year,
      sort = '-createdAt',
      search,
      featured,
      trending,
      subscriptionTier,
      status
    } = req.query;

    // Build filter
    const filter = { status: { $in: ['ongoing', 'completed'] } };

    if (genre) {
      filter.genres = { $in: Array.isArray(genre) ? genre : [genre] };
    }

    if (year) {
      filter.year = parseInt(year);
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (trending === 'true') {
      filter.trending = true;
    }

    if (subscriptionTier) {
      filter.subscriptionTier = { $in: [subscriptionTier, 'free'] };
    }

    if (status && ['ongoing', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Series.countDocuments(filter);

    const series = await Series.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

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
  } catch (error) {
    console.error('Get series error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching series',
      error: error.message
    });
  }
};

// Get single series
export const getSeriesById = async (req, res) => {
  try {
    const { seriesId } = req.params;

    const series = await Series.findById(seriesId)
      .populate('uploadedBy', 'name email');

    if (!series || (series.status !== 'ongoing' && series.status !== 'completed')) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: series
    });
  } catch (error) {
    console.error('Get series error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching series',
      error: error.message
    });
  }
};

// Get series by slug
export const getSeriesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const series = await Series.findOne({
      slug,
      status: { $in: ['ongoing', 'completed'] }
    })
      .populate('uploadedBy', 'name email');

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: series
    });
  } catch (error) {
    console.error('Get series by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching series',
      error: error.message
    });
  }
};

// Get all episodes for a series
export const getEpisodes = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { season, page = 1, limit = 20, sort = 'episodeNumber' } = req.query;

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Build filter
    const filter = { series: seriesId, status: 'published' };
    if (season) {
      filter.seasonNumber = parseInt(season);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Episode.countDocuments(filter);

    const episodes = await Episode.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-encryption.keyUri -drm.keyId');

    return res.status(200).json({
      success: true,
      data: episodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get episodes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching episodes',
      error: error.message
    });
  }
};

// Get episodes by season
export const getEpisodesBySeason = async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.params;

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const episodes = await Episode.find({
      series: seriesId,
      seasonNumber: parseInt(seasonNumber),
      status: 'published'
    })
      .sort('episodeNumber')
      .select('-encryption.keyUri -drm.keyId');

    return res.status(200).json({
      success: true,
      data: episodes
    });
  } catch (error) {
    console.error('Get episodes by season error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching episodes',
      error: error.message
    });
  }
};

// Get single episode
export const getEpisodeById = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const episode = await Episode.findById(episodeId)
      .select('-encryption.keyUri -drm.keyId')
      .populate('series', 'title slug');

    if (!episode || episode.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Get ratings
    const ratings = await Rating.find({
      contentId: episodeId,
      contentType: 'Episode'
    })
      .select('-_id profile rating review helpful notHelpful')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        ...episode.toObject(),
        ratings
      }
    });
  } catch (error) {
    console.error('Get episode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching episode',
      error: error.message
    });
  }
};

// Get episode by slug
export const getEpisodeBySlug = async (req, res) => {
  try {
    const { seriesId, slug } = req.params;

    const episode = await Episode.findOne({
      series: seriesId,
      slug,
      status: 'published'
    })
      .select('-encryption.keyUri -drm.keyId')
      .populate('series', 'title slug');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Get ratings
    const ratings = await Rating.find({
      contentId: episode._id,
      contentType: 'Episode'
    })
      .select('-_id profile rating review helpful notHelpful')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        ...episode.toObject(),
        ratings
      }
    });
  } catch (error) {
    console.error('Get episode by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching episode',
      error: error.message
    });
  }
};

// Increment episode views
export const incrementEpisodeViews = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const episode = await Episode.findByIdAndUpdate(
      episodeId,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { views: episode.views }
    });
  } catch (error) {
    console.error('Increment episode views error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating views',
      error: error.message
    });
  }
};

// Rate episode
export const rateEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { profileId } = req.headers;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    const episodeRating = await Rating.findOneAndUpdate(
      {
        profile: profileId,
        contentId: episodeId,
        contentType: 'Episode'
      },
      {
        profile: profileId,
        contentId: episodeId,
        contentType: 'Episode',
        rating: parseInt(rating),
        review: review || null
      },
      { upsert: true, new: true }
    );

    // Update episode average rating
    const allRatings = await Rating.find({
      contentId: episodeId,
      contentType: 'Episode'
    });

    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    episode.averageRating = avgRating;
    episode.totalRatings = allRatings.length;
    await episode.save();

    return res.status(200).json({
      success: true,
      message: 'Rating saved successfully',
      data: {
        rating: episodeRating,
        episodeAverageRating: episode.averageRating,
        totalRatings: episode.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate episode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving rating',
      error: error.message
    });
  }
};

// Get next episode
export const getNextEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    const nextEpisode = await Episode.findOne({
      series: episode.series,
      seasonNumber: { $gte: episode.seasonNumber },
      episodeNumber: { $gt: episode.episodeNumber },
      status: 'published'
    })
      .sort('seasonNumber episodeNumber')
      .select('_id title thumbnail slug');

    if (nextEpisode) {
      return res.status(200).json({
        success: true,
        data: nextEpisode
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No next episode available'
    });
  } catch (error) {
    console.error('Get next episode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching next episode',
      error: error.message
    });
  }
};

// Get trending series
export const getTrendingSeries = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const series = await Series.find({
      status: { $in: ['ongoing', 'completed'] },
      trending: true
    })
      .sort('-views -createdAt')
      .limit(parseInt(limit))
      .select('title thumbnail slug views averageRating');

    return res.status(200).json({
      success: true,
      data: series
    });
  } catch (error) {
    console.error('Get trending series error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching trending series',
      error: error.message
    });
  }
};

// Get featured series
export const getFeaturedSeries = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const series = await Series.find({
      status: { $in: ['ongoing', 'completed'] },
      featured: true
    })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .select('title thumbnail banner slug');

    return res.status(200).json({
      success: true,
      data: series
    });
  } catch (error) {
    console.error('Get featured series error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching featured series',
      error: error.message
    });
  }
};

// Get series seasons
export const getSeriesSeasons = async (req, res) => {
  try {
    const { seriesId } = req.params;

    const series = await Series.findById(seriesId).select('totalSeasons');
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const seasons = [];
    for (let i = 1; i <= series.totalSeasons; i++) {
      const episodeCount = await Episode.countDocuments({
        series: seriesId,
        seasonNumber: i,
        status: 'published'
      });
      seasons.push({
        seasonNumber: i,
        episodeCount
      });
    }

    return res.status(200).json({
      success: true,
      data: seasons
    });
  } catch (error) {
    console.error('Get series seasons error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching seasons',
      error: error.message
    });
  }
};

// Search series
export const searchSeries = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const series = await Series.find(
      { $text: { $search: query }, status: { $in: ['ongoing', 'completed'] } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title thumbnail slug maturityRating totalSeasons');

    const total = series.length;

    return res.status(200).json({
      success: true,
      data: series,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    console.error('Search series error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching series',
      error: error.message
    });
  }
};

// Increment series views
export const incrementSeriesViews = async (req, res) => {
  try {
    const { seriesId } = req.params;

    const series = await Series.findByIdAndUpdate(
      seriesId,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { views: series.views }
    });
  } catch (error) {
    console.error('Increment series views error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating views',
      error: error.message
    });
  }
};

// Get series by genre
export const getSeriesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const series = await Series.find({ genres: { $in: [genre] } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Series.countDocuments({ genres: { $in: [genre] } });

    res.json({
      success: true,
      data: series,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching series by genre:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch series',
      error: error.message
    });
  }
};

// Get series recommendations
export const getSeriesRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const currentSeries = await Series.findById(id);
    if (!currentSeries) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const recommendations = await Series.find({
      _id: { $ne: id },
      genres: { $in: currentSeries.genres }
    })
      .sort({ averageRating: -1, views: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching series recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

// Get series episodes
export const getSeriesEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const { season } = req.query;

    const Episode = (await import('../models/Episode.js')).default;

    let query = { seriesId: id };
    if (season) {
      query.seasonId = parseInt(season);
    }

    const episodes = await Episode.find(query)
      .sort({ seasonId: 1, episodeNumber: 1 })
      .lean();

    res.json({
      success: true,
      count: episodes.length,
      data: episodes
    });
  } catch (error) {
    console.error('Error fetching series episodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch episodes',
      error: error.message
    });
  }
};

// Rate series
export const rateSeries = async (req, res) => {
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

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const Rating = (await import('../models/Rating.js')).default;

    const existingRating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'series'
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();
    } else {
      await Rating.create({
        userId,
        contentId: id,
        contentType: 'series',
        rating,
        review
      });
    }

    const ratings = await Rating.find({ contentId: id, contentType: 'series' });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    series.averageRating = avgRating;
    series.totalRatings = ratings.length;
    await series.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        averageRating: avgRating,
        totalRatings: ratings.length
      }
    });
  } catch (error) {
    console.error('Error rating series:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

// Get series rating
export const getSeriesRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const Rating = (await import('../models/Rating.js')).default;

    const rating = await Rating.findOne({
      userId,
      contentId: id,
      contentType: 'series'
    });

    res.json({
      success: true,
      data: rating || null
    });
  } catch (error) {
    console.error('Error fetching series rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message
    });
  }
};

// Add series to watchlist
export const addSeriesToWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.body;

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const Watchlist = (await import('../models/Watchlist.js')).default;

    const existing = await Watchlist.findOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'series'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Series already in watchlist'
      });
    }

    await Watchlist.create({
      userId,
      profileId,
      contentId: id,
      contentType: 'series'
    });

    res.json({
      success: true,
      message: 'Series added to watchlist'
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

// Remove series from watchlist
export const removeSeriesFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { profileId } = req.query;

    const Watchlist = (await import('../models/Watchlist.js')).default;

    await Watchlist.deleteOne({
      userId,
      profileId,
      contentId: id,
      contentType: 'series'
    });

    res.json({
      success: true,
      message: 'Series removed from watchlist'
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

// Get series progress
export const getSeriesProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = req.user._id;

    const WatchHistory = (await import('../models/WatchHistory.js')).default;

    const watchHistory = await WatchHistory.find({
      userId,
      profileId,
      contentType: 'episode'
    }).populate('contentId');

    const Episode = (await import('../models/Episode.js')).default;
    const episodesWatched = await Episode.find({
      seriesId: id,
      _id: { $in: watchHistory.map(h => h.contentId) }
    });

    res.json({
      success: true,
      data: {
        episodesWatched: episodesWatched.length,
        watchHistory
      }
    });
  } catch (error) {
    console.error('Error fetching series progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

// Update series progress
export const updateSeriesProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { episodeId, progress, profileId } = req.body;
    const userId = req.user._id;

    const WatchHistory = (await import('../models/WatchHistory.js')).default;

    const watchHistory = await WatchHistory.findOneAndUpdate(
      { userId, profileId, contentId: episodeId, contentType: 'episode' },
      {
        userId,
        profileId,
        contentId: episodeId,
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
    console.error('Error updating series progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

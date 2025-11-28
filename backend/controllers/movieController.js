import Movie from '../models/Movie.js';
import Rating from '../models/Rating.js';

// Get all movies with filtering and pagination
export const getMovies = async (req, res) => {
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
      maturityRating
    } = req.query;

    // Build filter object
    const filter = { status: 'published' };

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

    if (maturityRating) {
      const ratings = { 'G': 0, 'PG': 1, 'PG-13': 2, 'R': 3, 'NC-17': 4 };
      const userRatingLevel = ratings[maturityRating] || 0;
      filter.$or = Object.keys(ratings)
        .filter(r => ratings[r] <= userRatingLevel)
        .map(r => ({ maturityRating: r }));
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Movie.countDocuments(filter);

    // Get movies
    const movies = await Movie.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -encryption.keyUri -drm.keyId');

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
  } catch (error) {
    console.error('Get movies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching movies',
      error: error.message
    });
  }
};

// Get single movie
export const getMovieById = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId)
      .select('-encryption.keyUri -drm.keyId')
      .populate('uploadedBy', 'name email');

    if (!movie || movie.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Get ratings
    const ratings = await Rating.find({
      contentId: movieId,
      contentType: 'Movie'
    })
      .select('-_id profile rating review helpful notHelpful')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        ...movie.toObject(),
        ratings
      }
    });
  } catch (error) {
    console.error('Get movie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching movie',
      error: error.message
    });
  }
};

// Get movie by slug
export const getMovieBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const movie = await Movie.findOne({ slug, status: 'published' })
      .select('-encryption.keyUri -drm.keyId')
      .populate('uploadedBy', 'name email');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Get ratings
    const ratings = await Rating.find({
      contentId: movie._id,
      contentType: 'Movie'
    })
      .select('-_id profile rating review helpful notHelpful')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        ...movie.toObject(),
        ratings
      }
    });
  } catch (error) {
    console.error('Get movie by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching movie',
      error: error.message
    });
  }
};

// Increment movie views
export const incrementViews = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findByIdAndUpdate(
      movieId,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        views: movie.views
      }
    });
  } catch (error) {
    console.error('Increment views error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating views',
      error: error.message
    });
  }
};

// Add/Update movie rating
export const rateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { profileId } = req.headers;
    const { rating, review } = req.body;

    // Validation
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

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Upsert rating
    const movieRating = await Rating.findOneAndUpdate(
      {
        profile: profileId,
        contentId: movieId,
        contentType: 'Movie'
      },
      {
        profile: profileId,
        contentId: movieId,
        contentType: 'Movie',
        rating: parseInt(rating),
        review: review || null
      },
      { upsert: true, new: true }
    );

    // Update movie average rating
    const allRatings = await Rating.find({
      contentId: movieId,
      contentType: 'Movie'
    });

    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    movie.averageRating = avgRating;
    movie.totalRatings = allRatings.length;
    await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Rating saved successfully',
      data: {
        rating: movieRating,
        movieAverageRating: movie.averageRating,
        totalRatings: movie.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate movie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving rating',
      error: error.message
    });
  }
};

// Get trending movies
export const getTrendingMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({
      status: 'published',
      trending: true
    })
      .sort('-views -createdAt')
      .limit(parseInt(limit))
      .select('title thumbnail slug maturityRating views averageRating');

    return res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Get trending movies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching trending movies',
      error: error.message
    });
  }
};

// Get featured movies
export const getFeaturedMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({
      status: 'published',
      featured: true
    })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .select('title thumbnail banner slug');

    return res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Get featured movies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching featured movies',
      error: error.message
    });
  }
};

// Get new releases
export const getNewReleases = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({
      status: 'published',
      newRelease: true
    })
      .sort('-releaseDate -createdAt')
      .limit(parseInt(limit))
      .select('title thumbnail slug releaseDate duration');

    return res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Get new releases error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching new releases',
      error: error.message
    });
  }
};

// Get movies by genre
export const getMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Movie.countDocuments({
      status: 'published',
      genres: genre
    });

    const movies = await Movie.find({
      status: 'published',
      genres: genre
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .select('title thumbnail slug maturityRating averageRating');

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
  } catch (error) {
    console.error('Get movies by genre error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching movies by genre',
      error: error.message
    });
  }
};

// Search movies
export const searchMovies = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movies = await Movie.find(
      { $text: { $search: query }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title thumbnail slug maturityRating');

    const total = movies.length;

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    console.error('Search movies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching movies',
      error: error.message
    });
  }
};

// Get movie recommendations
export const getMovieRecommendations = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { limit = 8 } = req.query;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const similarMovies = await Movie.find({
      status: 'published',
      _id: { $ne: movieId },
      genres: { $in: movie.genres }
    })
      .sort('-views -createdAt')
      .limit(parseInt(limit))
      .select('title thumbnail slug maturityRating averageRating');

    return res.status(200).json({
      success: true,
      data: similarMovies
    });
  } catch (error) {
    console.error('Get similar movies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching similar movies',
      error: error.message
    });
  }
};

// Get user's rating for a movie
export const getMovieRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { profileId } = req.headers;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const rating = await Rating.findOne({
      profile: profileId,
      contentId: movieId,
      contentType: 'Movie'
    }).select('rating review');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Get movie rating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching rating',
      error: error.message
    });
  }
};

// Get movie statistics (admin)
export const getMovieStats = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId).select('views likes dislikes averageRating totalRatings');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        views: movie.views,
        likes: movie.likes,
        dislikes: movie.dislikes,
        engagement: ((movie.likes + movie.dislikes) / Math.max(movie.views, 1)) * 100,
        averageRating: movie.averageRating,
        totalRatings: movie.totalRatings
      }
    });
  } catch (error) {
    console.error('Get movie stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching movie statistics',
      error: error.message
    });
  }
};

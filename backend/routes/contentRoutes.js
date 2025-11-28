import express from 'express';
import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get trending content (based on views)
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get trending movies
    const trendingMovies = await Movie.find({ status: 'published' })
      .sort({ views: -1, rating: -1 })
      .limit(limit)
      .select('-__v');

    // Get trending series
    const trendingSeries = await Series.find({ status: 'published' })
      .sort({ views: -1, rating: -1 })
      .limit(limit)
      .select('-__v');

    // Combine and sort by views
    const trending = [...trendingMovies, ...trendingSeries]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    res.json({
      success: true,
      data: trending,
      count: trending.length
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending content',
      error: error.message
    });
  }
});

// Get recommendations (based on rating and recent releases)
router.get('/recommendations', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get high-rated recent movies
    const recommendedMovies = await Movie.find({ status: 'published' })
      .sort({ rating: -1, releaseDate: -1 })
      .limit(limit)
      .select('-__v');

    // Get high-rated recent series
    const recommendedSeries = await Series.find({ status: 'published' })
      .sort({ rating: -1, releaseDate: -1 })
      .limit(limit)
      .select('-__v');

    // Combine and sort by rating
    const recommendations = [...recommendedMovies, ...recommendedSeries]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
});

// Search content
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, genre, year, type, limit = 20 } = req.query;

    if (!q && !genre) {
      return res.status(400).json({
        success: false,
        message: 'Search query or genre is required'
      });
    }

    const searchQuery = {
      status: 'published'
    };

    if (q) {
      searchQuery.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cast: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } }
      ];
    }

    if (genre) {
      searchQuery.genres = { $in: [genre] };
    }

    if (year) {
      searchQuery.year = parseInt(year);
    }

    let results = [];

    if (!type || type === 'movie') {
      const movies = await Movie.find(searchQuery)
        .limit(parseInt(limit))
        .select('-__v');
      results = [...results, ...movies];
    }

    if (!type || type === 'series') {
      const series = await Series.find(searchQuery)
        .limit(parseInt(limit))
        .select('-__v');
      results = [...results, ...series];
    }

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search content',
      error: error.message
    });
  }
});

export default router;

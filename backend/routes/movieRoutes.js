import express from 'express';
import {
  getMovies,
  getMovieById,
  searchMovies,
  getMoviesByGenre,
  getTrendingMovies,
  getFeaturedMovies,
  getMovieRecommendations,
  rateMovie,
  getMovieRating
} from '../controllers/movieController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { checkSubscription, checkContentAccess } from '../middleware/subscription.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const movieLimiter = rateLimiter({ windowMs: 60000, maxRequests: 100 });

/**
 * @route GET /api/movies
 * @desc Get all movies with pagination and filtering
 * @access Public (limited), Private (full access)
 */
router.get('/', optionalAuth, movieLimiter, getMovies);

/**
 * @route GET /api/movies/trending
 * @desc Get trending movies
 * @access Public
 */
router.get('/trending', movieLimiter, getTrendingMovies);

/**
 * @route GET /api/movies/featured
 * @desc Get featured/promoted movies
 * @access Public
 */
router.get('/featured', movieLimiter, getFeaturedMovies);

/**
 * @route GET /api/movies/search
 * @desc Search movies by title, genre, actor
 * @access Public
 */
router.get('/search', optionalAuth, movieLimiter, searchMovies);

/**
 * @route GET /api/movies/genre/:genre
 * @desc Get movies by specific genre
 * @access Public
 */
router.get('/genre/:genre', optionalAuth, movieLimiter, getMoviesByGenre);

/**
 * @route GET /api/movies/:id
 * @desc Get detailed movie information
 * @access Public (limited), Private (full)
 */
router.get('/:id', optionalAuth, movieLimiter, getMovieById);

/**
 * @route GET /api/movies/:id/recommendations
 * @desc Get recommendations based on a movie
 * @access Public
 */
router.get('/:id/recommendations', movieLimiter, getMovieRecommendations);

/**
 * @route POST /api/movies/:id/rating
 * @desc Rate a movie (1-10)
 * @access Private
 */
router.post('/:id/rating', verifyToken, movieLimiter, rateMovie);

/**
 * @route GET /api/movies/:id/rating
 * @desc Get user's rating for a movie
 * @access Private
 */
router.get('/:id/rating', verifyToken, movieLimiter, getMovieRating);



export default router;

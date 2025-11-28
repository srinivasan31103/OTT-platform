import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import WatchHistory from '../models/WatchHistory.js';
import { generateMoodPlaylist } from './aiClient.js';

export const generatePersonalizedPlaylist = async (profileId, options = {}) => {
  try {
    const {
      limit = 20,
      genres = [],
      excludeWatched = false
    } = options;

    const watchHistory = await WatchHistory.find({ profile: profileId })
      .sort({ lastWatchedAt: -1 })
      .limit(50)
      .populate('contentId');

    const watchedGenres = {};
    const watchedIds = new Set();

    watchHistory.forEach(item => {
      if (item.contentId && item.contentId.genres) {
        item.contentId.genres.forEach(genre => {
          watchedGenres[genre] = (watchedGenres[genre] || 0) + 1;
        });

        watchedIds.add(item.contentId._id.toString());
      }
    });

    const topGenres = Object.entries(watchedGenres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    const preferredGenres = genres.length > 0 ? genres : topGenres;

    const query = {
      status: 'published',
      genres: { $in: preferredGenres }
    };

    if (excludeWatched && watchedIds.size > 0) {
      query._id = { $nin: Array.from(watchedIds) };
    }

    const movies = await Movie.find(query)
      .sort({ views: -1, averageRating: -1 })
      .limit(limit);

    const series = await Series.find(query)
      .sort({ views: -1, averageRating: -1 })
      .limit(Math.floor(limit / 2));

    const playlist = [
      ...movies.map(m => ({ ...m.toObject(), contentType: 'Movie' })),
      ...series.map(s => ({ ...s.toObject(), contentType: 'Series' }))
    ];

    playlist.sort(() => Math.random() - 0.5);

    return {
      success: true,
      playlist: playlist.slice(0, limit),
      basedOn: {
        genres: preferredGenres,
        watchHistory: watchHistory.length
      }
    };
  } catch (error) {
    console.error('Playlist generation error:', error);
    return {
      success: false,
      error: error.message,
      playlist: []
    };
  }
};

export const generateMoodBasedPlaylist = async (mood, timeOfDay = '') => {
  try {
    const aiPlaylist = await generateMoodPlaylist(mood, timeOfDay);

    if (!aiPlaylist.success || !aiPlaylist.playlist) {
      return {
        success: false,
        error: 'Failed to generate AI playlist'
      };
    }

    const playlist = [];

    for (const item of aiPlaylist.playlist.items) {
      const searchQuery = {
        status: 'published',
        $or: [
          { title: new RegExp(item.title, 'i') },
          { tags: new RegExp(item.title, 'i') }
        ]
      };

      let content = null;

      if (item.type === 'movie') {
        content = await Movie.findOne(searchQuery);
      } else {
        content = await Series.findOne(searchQuery);
      }

      if (content) {
        playlist.push({
          ...content.toObject(),
          contentType: item.type === 'movie' ? 'Movie' : 'Series',
          recommendationReason: item.reason,
          vibe: item.vibe
        });
      }
    }

    return {
      success: true,
      playlistName: aiPlaylist.playlist.playlistName,
      description: aiPlaylist.playlist.description,
      mood,
      timeOfDay,
      items: playlist
    };
  } catch (error) {
    console.error('Mood playlist generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateContinueWatchingPlaylist = async (profileId) => {
  try {
    const continueWatching = await WatchHistory.find({
      profile: profileId,
      finished: false,
      watchedPercentage: { $gte: 5, $lte: 90 }
    })
      .sort({ lastWatchedAt: -1 })
      .limit(20)
      .populate('contentId');

    const playlist = continueWatching
      .filter(item => item.contentId)
      .map(item => ({
        ...item.contentId.toObject(),
        contentType: item.contentType,
        lastPosition: item.lastPosition,
        watchedPercentage: item.watchedPercentage,
        lastWatchedAt: item.lastWatchedAt
      }));

    return {
      success: true,
      playlist
    };
  } catch (error) {
    console.error('Continue watching playlist error:', error);
    return {
      success: false,
      error: error.message,
      playlist: []
    };
  }
};

export const generateTrendingPlaylist = async (limit = 20, region = 'US') => {
  try {
    const movies = await Movie.find({
      status: 'published',
      trending: true
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    const series = await Series.find({
      status: 'published',
      trending: true
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(Math.floor(limit / 2));

    const playlist = [
      ...movies.map(m => ({ ...m.toObject(), contentType: 'Movie' })),
      ...series.map(s => ({ ...s.toObject(), contentType: 'Series' }))
    ];

    playlist.sort((a, b) => b.views - a.views);

    return {
      success: true,
      playlist: playlist.slice(0, limit),
      category: 'Trending Now',
      region
    };
  } catch (error) {
    console.error('Trending playlist error:', error);
    return {
      success: false,
      error: error.message,
      playlist: []
    };
  }
};

export const generateNewReleasesPlaylist = async (limit = 20) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movies = await Movie.find({
      status: 'published',
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    const series = await Series.find({
      status: 'published',
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 2));

    const playlist = [
      ...movies.map(m => ({ ...m.toObject(), contentType: 'Movie' })),
      ...series.map(s => ({ ...s.toObject(), contentType: 'Series' }))
    ];

    playlist.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      success: true,
      playlist: playlist.slice(0, limit),
      category: 'New Releases'
    };
  } catch (error) {
    console.error('New releases playlist error:', error);
    return {
      success: false,
      error: error.message,
      playlist: []
    };
  }
};

export const generateGenrePlaylist = async (genre, limit = 20) => {
  try {
    const movies = await Movie.find({
      status: 'published',
      genres: genre
    })
      .sort({ averageRating: -1, views: -1 })
      .limit(limit);

    const series = await Series.find({
      status: 'published',
      genres: genre
    })
      .sort({ averageRating: -1, views: -1 })
      .limit(Math.floor(limit / 2));

    const playlist = [
      ...movies.map(m => ({ ...m.toObject(), contentType: 'Movie' })),
      ...series.map(s => ({ ...s.toObject(), contentType: 'Series' }))
    ];

    playlist.sort(() => Math.random() - 0.5);

    return {
      success: true,
      playlist: playlist.slice(0, limit),
      category: `Best of ${genre}`,
      genre
    };
  } catch (error) {
    console.error('Genre playlist error:', error);
    return {
      success: false,
      error: error.message,
      playlist: []
    };
  }
};

export default {
  generatePersonalizedPlaylist,
  generateMoodBasedPlaylist,
  generateContinueWatchingPlaylist,
  generateTrendingPlaylist,
  generateNewReleasesPlaylist,
  generateGenrePlaylist
};

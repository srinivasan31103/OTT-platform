import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import { contentApi } from '../api/apiClient';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    rating: searchParams.get('rating') || '',
    type: searchParams.get('type') || 'all', // movie, series, short
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery && !filters.genre) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await contentApi.search(
          searchQuery || filters.genre
        );

        let filtered = response.data || [];

        // Apply filters
        if (filters.genre) {
          filtered = filtered.filter((item) =>
            item.genres?.includes(filters.genre)
          );
        }
        if (filters.year) {
          filtered = filtered.filter((item) => item.year === Number(filters.year));
        }
        if (filters.rating) {
          filtered = filtered.filter((item) =>
            item.rating >= Number(filters.rating)
          );
        }
        if (filters.type !== 'all') {
          filtered = filtered.filter((item) => {
            if (filters.type === 'movie') return item.duration;
            if (filters.type === 'series') return item.seasons;
            return true;
          });
        }

        setResults(filtered);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ q: searchQuery, ...filters });
    }
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      rating: '',
      type: 'all',
    });
  };

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== 'all').length;

  return (
    <div className="min-h-screen gradient-dark pb-12 particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Search Bar */}
      <div className="sticky top-20 z-40 glass-neon border-b border-neon-purple/30 px-4 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, series, shorts..."
                className="w-full pl-12 pr-4 py-3"
              />
            </div>
            <button
              type="submit"
              className="btn-neon px-6 py-3"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 btn-cyber px-4 py-3"
            >
              <FiFilter size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-neon-purple to-neon-pink text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)'
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass-neon rounded-2xl animate-slide-in">
              {/* Type Filter */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="series">Series</option>
                  <option value="short">Shorts</option>
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) =>
                    setFilters({ ...filters, genre: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm"
                >
                  <option value="">All Genres</option>
                  <option value="Action">Action</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Horror">Horror</option>
                  <option value="Romance">Romance</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) =>
                    setFilters({ ...filters, year: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm"
                >
                  <option value="">Any Year</option>
                  {[...Array(25)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Min. Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters({ ...filters, rating: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="9">9.0+</option>
                  <option value="8">8.0+</option>
                  <option value="7">7.0+</option>
                  <option value="6">6.0+</option>
                </select>
              </div>

              {/* Clear Button */}
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 btn-hologram px-3 py-2 text-sm"
                  >
                    <FiX size={16} />
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 lg:px-8 py-8 max-w-7xl mx-auto relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin mb-4">
              <div className="w-12 h-12 border-4 border-transparent border-t-neon-purple rounded-full"
                style={{
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
                }}
              />
            </div>
            <p className="text-gray-400">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 rounded-full glass-neon flex items-center justify-center mb-6"
              style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
              }}
            >
              <FiSearch className="text-neon-cyan text-4xl" />
            </div>
            <p className="text-gray-300 text-lg mb-2 font-semibold">
              {searchQuery ? 'No results found' : 'Start searching to find content'}
            </p>
            {searchQuery && (
              <p className="text-gray-500 text-sm">
                Try different keywords or adjust your filters
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-400">
                Found <span className="text-neon-cyan font-bold">{results.length}</span> results
                {searchQuery && (
                  <>
                    {' '}
                    for <span className="text-neon-purple font-bold">"{searchQuery}"</span>
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((item) => (
                <MovieCard
                  key={item._id}
                  movie={item}
                  series={!!item.seasons}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;

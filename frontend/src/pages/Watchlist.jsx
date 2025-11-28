import { useEffect, useState } from 'react';
import { FiTrash2, FiGrid, FiList } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import { useWatchlistStore } from '../store/watchlistStore';
import { useAuthStore } from '../store/authStore';

const Watchlist = () => {
  const { token } = useAuthStore();
  const { items, fetchWatchlist, remove, isLoading } = useWatchlistStore();
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    if (token) {
      fetchWatchlist(token);
    }
  }, [token, fetchWatchlist]);

  const handleRemove = async (contentId) => {
    try {
      await remove(contentId);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4 inline-block">
            <div className="w-12 h-12 border-4 border-transparent border-t-neon-purple rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
              }}
            />
          </div>
          <p className="text-gray-400">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark pb-12 particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Header */}
      <div className="px-4 lg:px-8 py-8 border-b border-neon-purple/30 sticky top-20 glass-neon z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-section">My List</h1>
            <p className="text-gray-400 text-sm mt-1">
              <span className="text-neon-cyan font-bold">{items.length}</span> {items.length === 1 ? 'item' : 'items'} in your watchlist
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex glass-neon rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white'
                    : 'text-gray-400 hover:text-neon-cyan'
                }`}
                style={viewMode === 'grid' ? {
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                } : {}}
              >
                <FiGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white'
                    : 'text-gray-400 hover:text-neon-cyan'
                }`}
                style={viewMode === 'list' ? {
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                } : {}}
              >
                <FiList size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-8 relative z-10">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full glass-neon flex items-center justify-center mb-6"
              style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
              }}
            >
              <FiGrid className="text-neon-cyan text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-gray-400 mb-6 max-w-sm">
              Start adding movies and series to your watchlist to keep track of
              what you want to watch
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} className="relative group">
                <MovieCard
                  movie={item.content || item}
                  series={!!item.content?.seasons}
                />
                <button
                  onClick={() => handleRemove(item.contentId || item._id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                  }}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3 max-w-4xl">
            {items.map((item) => {
              const content = item.content || item;
              return (
                <div
                  key={item._id}
                  className="group flex gap-4 p-4 glass-neon rounded-2xl hover:scale-[1.02] transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex-shrink-0">
                    {content.poster && (
                      <img
                        src={content.poster}
                        alt={content.title || content.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-neon-cyan transition-colors">
                      {content.title || content.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {content.description}
                    </p>
                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                      {content.rating && (
                        <span className="flex items-center gap-1">
                          <span className="text-neon-orange">★</span>
                          {content.rating}
                        </span>
                      )}
                      {content.year && <span>{content.year}</span>}
                      {content.duration && <span>{content.duration} min</span>}
                      {content.seasons && (
                        <span>{content.seasons.length} seasons</span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.contentId || item._id)}
                    className="p-2 rounded-full glass-neon hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-all duration-300 self-center"
                    style={{
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiPlus, FiCheck } from 'react-icons/fi';
import { useWatchlistStore } from '../store/watchlistStore';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MovieCard = ({ movie, series = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { add, remove } = useWatchlistStore();

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWatchlist) {
        await remove(movie._id);
      } else {
        await add(movie._id, series ? 'series' : 'movie');
      }
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Failed to toggle watchlist:', error);
    }
  };

  const href = series ? `/series/${movie._id}` : `/movie/${movie._id}`;

  return (
    <Link to={href} className="block">
      <div
        className="group relative overflow-hidden rounded-2xl cursor-pointer w-[160px] sm:w-[180px] lg:w-[220px] aspect-[2/3] card-neon hover-float"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <LazyLoadImage
          src={movie.poster || movie.thumbnail || 'https://via.placeholder.com/400x600/1a0b2e/a855f7?text=No+Image'}
          alt={movie.title || movie.name}
          effect="blur"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x600/1a0b2e/a855f7?text=No+Image';
          }}
        />

        {/* Neon Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-streamverse-darker via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-all duration-500" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overlay-glow" />

        {/* Content on Hover */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-end p-4 animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 drop-shadow-lg">
              {movie.title || movie.name}
            </h3>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {movie.description || movie.synopsis}
            </p>

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <Link
                  to={href}
                  className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-2 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-neon-purple/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiPlay className="text-lg" />
                  <span className="hidden sm:inline text-sm">Play</span>
                </Link>

                <button
                  onClick={handleWatchlistToggle}
                  className="p-2.5 rounded-full glass-cyber text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all duration-300"
                >
                  {isInWatchlist ? (
                    <FiCheck className="text-lg" />
                  ) : (
                    <FiPlus className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Rating and Info */}
            <div className="flex items-center gap-3 text-xs">
              {movie.rating && (
                <span className="flex items-center gap-1 px-2 py-1 glass-neon rounded-full">
                  <span className="text-neon-orange">★</span>
                  <span className="text-white font-bold">{movie.rating}</span>
                </span>
              )}
              {movie.year && <span className="text-gray-400 px-2 py-1 glass-neon rounded">{movie.year}</span>}
              {movie.duration && <span className="text-gray-400 px-2 py-1 glass-neon rounded">{movie.duration}m</span>}
              {movie.seasons && <span className="text-gray-400 px-2 py-1 glass-neon rounded">{movie.seasons}S</span>}
            </div>
          </div>
        )}

        {/* Badges */}
        {(movie.newRelease || movie.isNew) && (
          <div className="absolute top-3 left-3 badge-neon text-white">
            NEW
          </div>
        )}

        {(movie.trending || movie.isTrending) && (
          <div className="absolute top-3 right-3 badge-cyber">
            TRENDING
          </div>
        )}

        {/* Neon Border Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.1)'
        }} />
      </div>
    </Link>
  );
};

export default MovieCard;

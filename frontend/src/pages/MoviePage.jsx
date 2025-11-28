import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiPlus, FiCheck, FiShare2, FiArrowLeft } from 'react-icons/fi';
import { contentApi } from '../api/apiClient';
import { useWatchlistStore } from '../store/watchlistStore';
import AIRecommender from '../components/AIRecommender';
import SceneChapters from '../components/SceneChapters';

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { add, remove, isInWatchlist: checkWatchlist } = useWatchlistStore();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        const response = await contentApi.getMovie(id);
        setMovie(response.data);
        setIsInWatchlist(checkWatchlist(id));
      } catch (error) {
        console.error('Failed to fetch movie:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, navigate, checkWatchlist]);

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await remove(id);
      } else {
        await add(id, 'movie');
      }
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Failed to toggle watchlist:', error);
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
          <p className="text-gray-400">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center gap-4 particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <p className="text-gray-400 mb-4">Movie not found</p>
          <button
            onClick={() => navigate('/')}
            className="btn-neon"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark pb-12 particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Back Button */}
      <div className="px-4 lg:px-8 pt-4 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 glass-neon px-4 py-2 rounded-xl text-gray-300 hover:text-neon-cyan transition-all duration-300 mb-4"
          style={{
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
          }}
        >
          <FiArrowLeft size={20} />
          Back to Home
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-96 lg:h-screen flex items-end mb-8 overflow-hidden z-10">
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${movie.backdrop || movie.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-streamverse-darker via-streamverse-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-streamverse-darker via-streamverse-dark/40 to-transparent" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 50%)'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-4 lg:px-8 pb-8 lg:pb-16 animate-slide-up">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-white via-neon-purple to-neon-pink bg-clip-text text-transparent mb-4 drop-shadow-lg"
              style={{
                textShadow: '0 0 40px rgba(168, 85, 247, 0.5)'
              }}
            >
              {movie.title}
            </h1>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{movie.description}</p>

            {/* Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
              {movie.rating && (
                <span className="flex items-center gap-1 badge-neon">
                  <span className="text-neon-orange">★</span>
                  <span className="text-white font-bold">{movie.rating}</span>/10
                </span>
              )}
              {movie.year && <span className="badge-cyber">{movie.year}</span>}
              {movie.duration && <span className="badge-cyber">{movie.duration} min</span>}
              {movie.contentRating && (
                <span className="border-2 border-neon-purple px-3 py-1 rounded-lg text-neon-purple font-bold"
                  style={{
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  {movie.contentRating}
                </span>
              )}
              {movie.genres && (
                <span className="text-neon-cyan font-semibold">{movie.genres.join(', ')}</span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate(`/watch/movie/${id}`)}
                className="flex items-center gap-3 btn-neon px-8 py-4 text-lg font-bold"
              >
                <FiPlay size={24} />
                Play Now
              </button>

              <button
                onClick={handleWatchlistToggle}
                className={`flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 ${
                  isInWatchlist
                    ? 'glass-neon border-2 border-neon-cyan text-neon-cyan'
                    : 'btn-cyber'
                }`}
                style={isInWatchlist ? {
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                } : {}}
              >
                {isInWatchlist ? (
                  <>
                    <FiCheck size={24} />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <FiPlus size={24} />
                    Add to Watchlist
                  </>
                )}
              </button>

              <button className="flex items-center gap-3 btn-hologram px-8 py-4 text-lg font-bold">
                <FiShare2 size={24} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="px-4 lg:px-8 max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="glass-neon card-spacing animate-slide-up" style={{
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}>
            <h3 className="heading-card mb-6">Cast</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {movie.cast.map((actor, idx) => (
                <div key={idx} className="text-center group cursor-pointer">
                  <div className="mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 group-hover:scale-105 transition-all duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
                    }}
                  >
                    {actor.image && (
                      <img
                        src={actor.image}
                        alt={actor.name}
                        className="w-full h-32 object-cover"
                      />
                    )}
                  </div>
                  <p className="text-white font-bold text-sm group-hover:text-neon-cyan transition-colors">{actor.name}</p>
                  <p className="text-gray-400 text-xs">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Director & Crew */}
        {(movie.director || movie.writers) && (
          <div className="glass-neon card-spacing grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style={{
            animationDelay: '0.1s',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}>
            {movie.director && (
              <div>
                <p className="text-neon-cyan text-sm mb-2 font-semibold">Director</p>
                <p className="text-white font-bold">{movie.director}</p>
              </div>
            )}
            {movie.writers && (
              <div>
                <p className="text-neon-cyan text-sm mb-2 font-semibold">Writers</p>
                <p className="text-white font-bold">{movie.writers.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Chapters */}
        {movie.chapters && (
          <SceneChapters chapters={movie.chapters} />
        )}

        {/* Recommendations */}
        <AIRecommender currentMovie={movie} />
      </div>
    </div>
  );
};

export default MoviePage;

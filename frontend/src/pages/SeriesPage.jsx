import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { contentApi } from '../api/apiClient';

const SeriesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true);
        const response = await contentApi.getSeriesDetail(id);
        setSeries(response.data);
      } catch (error) {
        console.error('Failed to fetch series:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [id, navigate]);

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
          <p className="text-gray-400">Loading series...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center gap-4 particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <p className="text-gray-400 mb-4">Series not found</p>
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

  const currentSeason = series.seasons?.[selectedSeason];

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
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${series.backdrop || series.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-streamverse-darker via-streamverse-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-streamverse-darker via-streamverse-dark/40 to-transparent" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.15), transparent 50%)'
          }} />
        </div>

        <div className="relative z-10 w-full px-4 lg:px-8 pb-8 lg:pb-16 animate-slide-up">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-white via-neon-pink to-neon-purple bg-clip-text text-transparent mb-4 drop-shadow-lg"
              style={{
                textShadow: '0 0 40px rgba(236, 72, 153, 0.5)'
              }}
            >
              {series.name}
            </h1>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{series.description}</p>

            {/* Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
              {series.rating && (
                <span className="flex items-center gap-1 badge-neon">
                  <span className="text-neon-orange">★</span>
                  <span className="text-white font-bold">{series.rating}</span>/10
                </span>
              )}
              {series.year && <span className="badge-cyber">{series.year}</span>}
              {series.seasons && (
                <span className="badge-neon">{series.seasons.length} Seasons</span>
              )}
              {series.contentRating && (
                <span className="border-2 border-neon-pink px-3 py-1 rounded-lg text-neon-pink font-bold"
                  style={{
                    boxShadow: '0 0 10px rgba(236, 72, 153, 0.4)'
                  }}
                >
                  {series.contentRating}
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const firstEpisode = currentSeason?.episodes?.[0];
                  if (firstEpisode) {
                    navigate(`/episode/${firstEpisode._id}`);
                  }
                }}
                className="flex items-center gap-3 btn-neon px-8 py-4 text-lg font-bold"
              >
                <FiPlay size={24} />
                Play First Episode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seasons & Episodes */}
      <div className="px-4 lg:px-8 max-w-4xl mx-auto relative z-10">
        {/* Season Selector */}
        {series.seasons && series.seasons.length > 1 && (
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-white font-bold text-lg">Select Season:</label>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none glass-neon text-white px-6 py-3 rounded-xl focus:outline-none cursor-pointer pr-12 font-semibold border-2 border-neon-purple/30 hover:border-neon-purple transition-all duration-300"
                  style={{
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  {series.seasons.map((season, idx) => (
                    <option key={idx} value={idx}>
                      Season {season.seasonNumber || idx + 1}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neon-cyan" />
              </div>
            </div>
          </div>
        )}

        {/* Episodes Grid */}
        {currentSeason && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="heading-section mb-6">
              Season {currentSeason.seasonNumber || selectedSeason + 1} Episodes
            </h2>

            <div className="space-y-4">
              {currentSeason.episodes?.map((episode, idx) => (
                <button
                  key={episode._id}
                  onClick={() => navigate(`/episode/${episode._id}`)}
                  className="w-full group flex gap-4 p-4 glass-neon rounded-2xl hover:scale-[1.02] transition-all duration-300 text-left"
                  style={{
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
                    animationDelay: `${idx * 0.05}s`
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border-2 border-neon-purple/20 group-hover:border-neon-purple transition-all duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    {episode.thumbnail && (
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-neon-cyan font-bold text-sm mb-1">
                          Episode {episode.episodeNumber}
                        </h3>
                        <p className="text-white font-bold text-lg group-hover:text-neon-pink transition-colors">{episode.title}</p>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{
                          boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)'
                        }}
                      >
                        <FiPlay className="text-white" size={20} />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {episode.description}
                    </p>
                    {episode.duration && (
                      <p className="text-gray-500 text-xs font-semibold">
                        {episode.duration} minutes
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;

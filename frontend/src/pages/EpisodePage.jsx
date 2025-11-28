import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import HLSPlayer from '../components/HLSPlayer';
import { contentApi, playbackApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import { usePlaybackStore } from '../store/playbackStore';

const EpisodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { setCurrentVideo, saveProgress } = usePlaybackStore();
  const [episode, setEpisode] = useState(null);
  const [series, setSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextEpisode, setNextEpisode] = useState(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        setIsLoading(true);
        const episodeRes = await contentApi.getEpisode(id);
        setEpisode(episodeRes.data);

        if (episodeRes.data.seriesId) {
          const seriesRes = await contentApi.getSeriesDetail(episodeRes.data.seriesId);
          setSeries(seriesRes.data);

          // Find next episode
          const currentSeason = seriesRes.data.seasons?.find(
            (s) => s.seasonNumber === episodeRes.data.seasonNumber
          );
          const currentEpisodeIdx = currentSeason?.episodes?.findIndex(
            (e) => e._id === id
          );

          if (currentEpisodeIdx !== undefined && currentEpisodeIdx < currentSeason.episodes.length - 1) {
            setNextEpisode(currentSeason.episodes[currentEpisodeIdx + 1]);
          }
        }

        setCurrentVideo(episodeRes.data);
      } catch (error) {
        console.error('Failed to fetch episode:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisode();
  }, [id, navigate, setCurrentVideo]);

  const handleProgress = async (currentTime) => {
    if (token && episode) {
      try {
        await saveProgress(token, id, currentTime, episode.duration || 0);
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
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
          <p className="text-gray-400">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center gap-4 particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <p className="text-gray-400 mb-4">Episode not found</p>
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
    <div className="min-h-screen gradient-dark particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Back Button */}
      <div className="px-4 lg:px-8 pt-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 glass-neon px-4 py-2 rounded-xl text-gray-300 hover:text-neon-cyan transition-all duration-300"
          style={{
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
          }}
        >
          <FiArrowLeft size={20} />
          Back
        </button>
      </div>

      {/* Player */}
      <div className="px-4 lg:px-8 py-4">
        <HLSPlayer
          url={episode.streamUrl || episode.url}
          videoId={id}
          onProgress={handleProgress}
          title={`${series?.name} - S${episode.seasonNumber}E${episode.episodeNumber} - ${episode.title}`}
        />
      </div>

      {/* Episode Info */}
      <div className="px-4 lg:px-8 py-8 max-w-4xl relative z-10">
        <div className="glass-neon card-spacing mb-6 animate-slide-up" style={{
          boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent mb-2">
                {episode.title}
              </h1>
              {series && (
                <p className="text-neon-cyan text-lg font-semibold">
                  {series.name} - Season {episode.seasonNumber} Episode {episode.episodeNumber}
                </p>
              )}
            </div>
            <button className="p-3 rounded-xl glass-neon border-2 border-neon-purple/30 hover:border-neon-purple text-neon-purple hover:text-neon-pink transition-all duration-300"
              style={{
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              <FiDownload size={24} />
            </button>
          </div>

          <p className="text-gray-300 text-lg mb-4 leading-relaxed">{episode.description}</p>

          {/* Episode Stats */}
          <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
            {episode.releaseDate && (
              <span className="badge-cyber">
                Air Date: {new Date(episode.releaseDate).toLocaleDateString()}
              </span>
            )}
            {episode.duration && <span className="badge-neon">Duration: {episode.duration} minutes</span>}
            {episode.director && <span className="text-neon-cyan font-semibold">Director: {episode.director}</span>}
          </div>
        </div>

        {/* Next Episode */}
        {nextEpisode && (
          <div className="glass-neon card-spacing animate-slide-up" style={{
            animationDelay: '0.1s',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}>
            <p className="text-neon-cyan font-bold text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
              Up Next
            </p>
            <button
              onClick={() => navigate(`/episode/${nextEpisode._id}`)}
              className="group flex gap-4 w-full text-left p-4 rounded-xl hover:bg-neon-purple/10 transition-all duration-300 border-2 border-transparent hover:border-neon-purple"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="w-32 h-20 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 flex-shrink-0 border-2 border-neon-purple/20 group-hover:border-neon-purple transition-all overflow-hidden"
                style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
                }}
              >
                {nextEpisode.thumbnail && (
                  <img
                    src={nextEpisode.thumbnail}
                    alt={nextEpisode.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1 group-hover:text-neon-pink transition-colors">
                  Episode {nextEpisode.episodeNumber}: {nextEpisode.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {nextEpisode.description}
                </p>
              </div>
              <div className="flex items-center p-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)'
                }}
              >
                <FiPlay className="text-white" size={20} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodePage;

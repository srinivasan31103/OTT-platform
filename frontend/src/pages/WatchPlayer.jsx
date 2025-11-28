import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import HLSPlayer from '../components/HLSPlayer';
import { contentApi, playbackApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import { usePlaybackStore } from '../store/playbackStore';

const WatchPlayer = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { saveProgress } = usePlaybackStore();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        let response;

        if (type === 'movie') {
          response = await contentApi.getMovie(id);
        } else if (type === 'episode') {
          response = await contentApi.getEpisode(id);
        } else if (type === 'short') {
          response = await contentApi.getShort(id);
        }

        setContent(response.data);

        // Load saved progress
        if (token) {
          try {
            const progressRes = await playbackApi.getProgress(id);
            if (progressRes.data?.currentTime) {
              // Apply saved progress
              console.log('Resume from:', progressRes.data.currentTime);
            }
          } catch (error) {
            console.error('Failed to get progress:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, type, navigate, token]);

  const handleProgress = async (currentTime) => {
    if (token && content) {
      try {
        await saveProgress(token, id, currentTime, content.duration || 0);
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
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center gap-4 particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <p className="text-gray-400 mb-4">Content not found</p>
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

  const getStreamUrl = () => {
    return content.streamUrl || content.url || content.videoUrl;
  };

  const getTitle = () => {
    if (type === 'movie') return content.title;
    if (type === 'episode') return `${content.seriesName} - S${content.seasonNumber}E${content.episodeNumber} - ${content.title}`;
    return content.title;
  };

  return (
    <div className="min-h-screen gradient-dark relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 glass-neon px-4 py-2 rounded-xl text-neon-cyan hover:text-neon-pink transition-all duration-300"
          style={{
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
          }}
        >
          <FiArrowLeft size={24} />
        </button>
      </div>

      {/* Player */}
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full h-full border-4 border-neon-purple/20"
          style={{
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
          }}
        >
          <HLSPlayer
            url={getStreamUrl()}
            videoId={id}
            onProgress={handleProgress}
            title={getTitle()}
          />
        </div>
      </div>
    </div>
  );
};

export default WatchPlayer;

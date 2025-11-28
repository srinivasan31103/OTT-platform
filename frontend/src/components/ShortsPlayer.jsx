import { useEffect, useRef, useState } from 'react';
import { FiThumbsUp, FiShare2, FiMoreVertical, FiPlay, FiPause } from 'react-icons/fi';
import { usePlaybackStore } from '../store/playbackStore';

const ShortsPlayer = ({ short, onNext, onPrevious }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { currentVideo, setCurrentVideo } = usePlaybackStore();

  useEffect(() => {
    setCurrentVideo(short);
  }, [short, setCurrentVideo]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'up') {
      onNext?.();
    } else if (direction === 'down') {
      onPrevious?.();
    }
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center relative group">
      <video
        ref={videoRef}
        src={short.url}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={handleDurationChange}
        onClick={handlePlayPause}
        loop
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <button
            onClick={handlePlayPause}
            className="bg-primary hover:bg-pink-700 text-white p-4 rounded-full transition-colors"
          >
            <FiPlay size={48} />
          </button>
        </div>
      )}

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* Left Controls */}
      <div className="absolute bottom-20 left-4 flex flex-col gap-4 z-10">
        {/* Like Button */}
        <button className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
            <FiThumbsUp size={20} />
          </div>
          <span className="text-xs">{short.likes || 0}</span>
        </button>

        {/* Share Button */}
        <button className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
            <FiShare2 size={20} />
          </div>
          <span className="text-xs">Share</span>
        </button>

        {/* More Button */}
        <button className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
            <FiMoreVertical size={20} />
          </div>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-4 right-4 z-10 max-w-sm">
        <h3 className="text-white font-bold text-lg mb-2">{short.title}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {short.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-600 rounded overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>

      {/* Pause Indicator */}
      {!isPlaying && (
        <div className="absolute top-4 right-4 bg-slate-900 bg-opacity-50 text-white px-3 py-1 rounded text-sm font-bold">
          PAUSED
        </div>
      )}
    </div>
  );
};

export default ShortsPlayer;

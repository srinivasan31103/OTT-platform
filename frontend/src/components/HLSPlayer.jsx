import { useEffect, useRef, useState } from 'react';
import HLS from 'hls.js';
import {
  FiPlay,
  FiPause,
  FiMaximize,
  FiMinimize,
  FiVolume2,
  FiVolumeX,
  FiSettings,
} from 'react-icons/fi';
import { usePlaybackStore } from '../store/playbackStore';

const HLSPlayer = ({ url, videoId, onProgress, onDuration, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const hlsRef = useRef(null);

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current || !url) return;

    const video = videoRef.current;

    if (HLS.isSupported()) {
      hlsRef.current = new HLS({
        debug: false,
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hlsRef.current.loadSource(url);
      hlsRef.current.attachMedia(video);

      hlsRef.current.on(HLS.Events.MANIFEST_PARSED, () => {
        const levels = hlsRef.current.levels.map((level, index) => ({
          index,
          name: `${level.height}p`,
          bitrate: level.bitrate,
        }));

        setAvailableQualities([{ index: -1, name: 'Auto' }, ...levels]);
      });

      hlsRef.current.on(HLS.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
      });

      return () => {
        hlsRef.current?.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }, [url]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle progress
  const handleProgress = (e) => {
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    if (onProgress) {
      onProgress(time);
    }
  };

  // Handle duration
  const handleDurationChange = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (onDuration) {
        onDuration(dur);
      }
    }
  };

  // Handle volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle mute
  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle quality change
  const handleQualityChange = (index) => {
    if (hlsRef.current) {
      if (index === -1) {
        hlsRef.current.currentLevel = -1;
        setQuality('auto');
      } else {
        hlsRef.current.currentLevel = index;
        setQuality(availableQualities[index + 1]?.name || 'auto');
      }
    }
    setShowQualityMenu(false);
  };

  // Handle time seeking
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Auto hide controls
  useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="w-full bg-black relative group"
      style={{ aspectRatio: '16 / 9' }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={handleDurationChange}
        onEnded={() => setIsPlaying(false)}
        controls={false}
      />

      {/* Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black via-transparent to-black transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Title */}
        <div className="p-4">
          <h3 className="text-white text-lg font-bold">{title}</h3>
        </div>

        {/* Progress Bar */}
        <div className="px-4">
          <div
            className="w-full h-1 bg-slate-600 rounded cursor-pointer group/progress hover:h-2 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary rounded"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-primary transition-colors"
            >
              {isPlaying ? (
                <FiPause size={24} />
              ) : (
                <FiPlay size={24} />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={handleMute}
                className="text-white hover:text-primary transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <FiVolumeX size={20} />
                ) : (
                  <FiVolume2 size={20} />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quality */}
            {availableQualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-primary transition-colors text-sm font-bold"
                >
                  {quality}
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 glass-effect rounded-lg p-2">
                    {availableQualities.map((q) => (
                      <button
                        key={q.index}
                        onClick={() => handleQualityChange(q.index)}
                        className={`w-full text-left px-3 py-1 rounded text-sm transition-colors ${
                          (q.index === -1 && quality === 'auto') ||
                          quality === q.name
                            ? 'bg-primary text-white'
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        {q.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            <button className="text-white hover:text-primary transition-colors">
              <FiSettings size={20} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-primary transition-colors"
            >
              {isFullscreen ? (
                <FiMinimize size={20} />
              ) : (
                <FiMaximize size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Play Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button
            onClick={handlePlayPause}
            className="bg-primary hover:bg-pink-700 text-white p-4 rounded-full transition-colors"
          >
            <FiPlay size={48} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HLSPlayer;

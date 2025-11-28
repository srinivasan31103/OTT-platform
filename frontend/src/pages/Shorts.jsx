import { useEffect, useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import ShortsPlayer from '../components/ShortsPlayer';
import { contentApi } from '../api/apiClient';

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setIsLoading(true);
        const response = await contentApi.getShorts({ limit: 50 });
        const shortsData = response.data?.data || response.data || [];
        setShorts(shortsData);
      } catch (error) {
        console.error('Failed to fetch shorts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShorts();
  }, []);

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') handlePrevious();
      if (e.key === 'ArrowDown') handleNext();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, shorts.length]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleSwipe = () => {
    if (touchStart - touchEnd > 50) {
      handleNext();
    } else if (touchEnd - touchStart > 50) {
      handlePrevious();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen gradient-dark flex items-center justify-center particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4 inline-block">
            <div className="w-12 h-12 border-4 border-transparent border-t-neon-purple rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
              }}
            />
          </div>
          <p className="text-gray-400">Loading shorts...</p>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="w-full h-screen gradient-dark flex items-center justify-center particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <p className="text-gray-400 relative z-10">No shorts available</p>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <div
      className="w-full h-screen gradient-dark relative overflow-hidden"
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientY)}
      onTouchEnd={(e) => {
        setTouchEnd(e.changedTouches[0].clientY);
        handleSwipe();
      }}
    >
      {/* Player */}
      <ShortsPlayer
        short={currentShort}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/* Navigation Controls */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 animate-slide-in">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full glass-neon border-2 border-neon-purple/30 hover:border-neon-purple flex items-center justify-center text-neon-cyan hover:text-neon-pink transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-neon-purple/10"
          style={{
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
          }}
        >
          <FiChevronUp size={24} />
        </button>

        {/* Counter */}
        <div className="w-14 h-14 rounded-full glass-neon border-2 border-neon-cyan flex flex-col items-center justify-center text-white text-xs font-bold"
          style={{
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
          }}
        >
          <span className="text-neon-cyan text-base">{currentIndex + 1}</span>
          <span className="text-gray-400 text-xs">/ {shorts.length}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === shorts.length - 1}
          className="w-14 h-14 rounded-full glass-neon border-2 border-neon-purple/30 hover:border-neon-purple flex items-center justify-center text-neon-cyan hover:text-neon-pink transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-neon-purple/10"
          style={{
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
          }}
        >
          <FiChevronDown size={24} />
        </button>
      </div>

      {/* Keyboard Hint */}
      <div className="fixed top-4 left-4 z-40 glass-neon px-4 py-2 rounded-xl text-neon-cyan text-xs font-semibold animate-slide-up"
        style={{
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
        }}
      >
        <p>↑↓ Arrow keys or swipe to navigate</p>
      </div>
    </div>
  );
};

export default Shorts;

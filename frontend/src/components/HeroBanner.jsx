import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const HeroBanner = ({ page = 'home', autoRotate = true, showControls = true }) => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, [page]);

  useEffect(() => {
    if (autoRotate && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 6000); // Rotate every 6 seconds
      return () => clearInterval(interval);
    }
  }, [autoRotate, banners]);

  // Track banner view when displayed
  useEffect(() => {
    if (banners[currentIndex]?._id) {
      trackBannerView(banners[currentIndex]._id);
    }
  }, [currentIndex, banners]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/banners/active?page=${page}&position=hero`
      );
      if (response.data.success && response.data.data.length > 0) {
        setBanners(response.data.data);
      } else {
        setError('No banners available');
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const trackBannerView = async (bannerId) => {
    try {
      await axios.post(`http://localhost:5000/api/banners/${bannerId}/view`);
    } catch (err) {
      console.error('Error tracking banner view:', err);
    }
  };

  const trackBannerClick = async (bannerId) => {
    try {
      await axios.post(`http://localhost:5000/api/banners/${bannerId}/click`);
    } catch (err) {
      console.error('Error tracking banner click:', err);
    }
  };

  const handleBannerClick = async (banner) => {
    await trackBannerClick(banner._id);

    if (banner.ctaLink) {
      navigate(banner.ctaLink);
    } else if (banner.contentId) {
      // Navigate to content page
      navigate(`/movie/${banner.contentId._id}`);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="relative h-[80vh] bg-gradient-to-r from-gray-900 to-gray-800 animate-pulse">
        <div className="absolute bottom-20 left-10 space-y-4">
          <div className="h-12 w-96 bg-gray-700 rounded"></div>
          <div className="h-6 w-80 bg-gray-700 rounded"></div>
          <div className="h-6 w-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null; // Don't show anything if there are no banners
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[80vh] group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${currentBanner.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <p className="text-xl md:text-2xl mb-4 text-gray-200 drop-shadow-md">
                {currentBanner.subtitle}
              </p>
            )}

            {/* Description */}
            {currentBanner.description && (
              <p className="text-base md:text-lg mb-6 text-gray-300 drop-shadow-md max-w-xl line-clamp-3">
                {currentBanner.description}
              </p>
            )}

            {/* Content Info (if linked to content) */}
            {currentBanner.contentId && (
              <div className="flex items-center space-x-4 mb-6 text-sm md:text-base">
                {currentBanner.contentId.rating && (
                  <span className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span>{currentBanner.contentId.rating.toFixed(1)}</span>
                  </span>
                )}
                {currentBanner.contentId.year && (
                  <span className="text-gray-300">{currentBanner.contentId.year}</span>
                )}
              </div>
            )}

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleBannerClick(currentBanner)}
                className="px-8 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition flex items-center space-x-2 shadow-lg"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                <span>{currentBanner.ctaText || 'Play'}</span>
              </button>

              {currentBanner.contentId && (
                <button
                  onClick={() => navigate(`/movie/${currentBanner.contentId._id}`)}
                  className="px-8 py-3 bg-gray-600/80 text-white rounded font-semibold hover:bg-gray-600 transition flex items-center space-x-2 shadow-lg backdrop-blur-sm"
                >
                  <Info className="w-5 h-5" />
                  <span>More Info</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && banners.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                } rounded-full`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Video Background (if provided) */}
      {currentBanner.videoUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src={currentBanner.videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;

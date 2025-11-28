import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

/**
 * AdBanner Component
 * Displays advertisements with analytics tracking
 *
 * Props:
 * - placement: Ad placement (home-top, home-middle, sidebar, etc.)
 * - className: Additional CSS classes
 * - dismissible: Whether the ad can be dismissed
 * - maxAds: Maximum number of ads to show
 */
const AdBanner = ({
  placement = 'home-top',
  className = '',
  dismissible = false,
  maxAds = 1
}) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [placement]);

  useEffect(() => {
    // Rotate ads if multiple are available
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000); // Rotate every 10 seconds
      return () => clearInterval(interval);
    }
  }, [ads]);

  // Track impression when ad is displayed
  useEffect(() => {
    if (ads[currentAdIndex]?._id) {
      trackImpression(ads[currentAdIndex]._id);
    }
  }, [currentAdIndex, ads]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/ads/active?placement=${placement}`
      );

      if (response.data.success && response.data.data.length > 0) {
        const limitedAds = response.data.data.slice(0, maxAds);
        setAds(limitedAds);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (adId) => {
    try {
      await axios.post(`http://localhost:5000/api/ads/${adId}/impression`);
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId) => {
    try {
      await axios.post(`http://localhost:5000/api/ads/${adId}/click`);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = async (ad) => {
    await trackClick(ad._id);
    if (ad.clickUrl) {
      window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in session storage
    sessionStorage.setItem(`ad-dismissed-${placement}`, 'true');
  };

  // Check if ad was previously dismissed
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(`ad-dismissed-${placement}`);
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, [placement]);

  if (loading || dismissed || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Different layouts based on ad type
  const renderAdContent = () => {
    switch (currentAd.type) {
      case 'video':
        return (
          <div className="relative w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover rounded"
            >
              <source src={currentAd.videoUrl} type="video/mp4" />
            </video>
            {currentAd.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white font-semibold">{currentAd.title}</h3>
                {currentAd.description && (
                  <p className="text-gray-300 text-sm">{currentAd.description}</p>
                )}
              </div>
            )}
          </div>
        );

      case 'banner':
      default:
        return (
          <div className="relative w-full h-full">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover rounded"
            />
            {(currentAd.title || currentAd.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                {currentAd.title && (
                  <h3 className="text-white font-semibold">{currentAd.title}</h3>
                )}
                {currentAd.description && (
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {currentAd.description}
                  </p>
                )}
              </div>
            )}
            {currentAd.sponsor?.logo && (
              <div className="absolute top-4 right-4">
                <img
                  src={currentAd.sponsor.logo}
                  alt={currentAd.sponsor.name}
                  className="h-8 w-auto bg-white/90 px-2 py-1 rounded"
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Sponsored Label */}
      <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
        Sponsored
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100"
          aria-label="Dismiss ad"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Ad Content */}
      <div
        onClick={() => handleAdClick(currentAd)}
        className="cursor-pointer transition-transform hover:scale-[1.02] duration-200"
      >
        {renderAdContent()}
      </div>

      {/* Multiple Ads Indicator */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition ${
                index === currentAdIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Preset components for common placements
export const TopBanner = (props) => (
  <AdBanner
    placement="home-top"
    className="w-full h-24 md:h-32 mb-6"
    dismissible
    {...props}
  />
);

export const SidebarAd = (props) => (
  <AdBanner
    placement="sidebar"
    className="w-full h-64"
    dismissible
    {...props}
  />
);

export const MiddleBanner = (props) => (
  <AdBanner
    placement="home-middle"
    className="w-full h-40 md:h-48 my-6"
    dismissible
    {...props}
  />
);

export const VideoPlayerAd = (props) => (
  <AdBanner
    placement="video-player"
    className="w-full aspect-video"
    {...props}
  />
);

export default AdBanner;

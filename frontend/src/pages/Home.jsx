import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiInfo } from 'react-icons/fi';
import Slider from '../components/Slider';
import { contentApi } from '../api/apiClient';

const Home = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        // Fetch trending content
        const trendingRes = await contentApi.getTrending();
        const trendingData = trendingRes.data?.data || trendingRes.data || [];
        setTrending(trendingData);

        // Set featured movie from trending
        if (trendingData.length > 0) {
          setFeaturedMovie(trendingData[0]);
        }

        // Fetch new releases
        const moviesRes = await contentApi.getMovies({ sort: '-createdAt', limit: 12 });
        const moviesData = moviesRes.data?.data || moviesRes.data || [];
        setNewReleases(moviesData);

        // Fetch recommendations
        const recsRes = await contentApi.getRecommendations();
        const recsData = recsRes.data?.data || recsRes.data || [];
        setRecommendations(recsData);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen gradient-dark">
      {/* Featured Section */}
      {featuredMovie ? (
        <div className="relative h-screen flex items-center justify-center overflow-hidden mb-12 particles-bg">
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${featuredMovie.backdrop || featuredMovie.poster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 overlay-neon" />
            <div className="absolute inset-0 overlay-glow" />
            <div className="absolute inset-0 bg-gradient-to-r from-streamverse-darker via-transparent to-streamverse-darker" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl section-spacing lg:mr-auto text-white">
            <h1 className="heading-hero mb-6 animate-slide-up">
              {featuredMovie.title}
            </h1>

            <p className="text-xl text-gray-300 mb-8 line-clamp-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {featuredMovie.description}
            </p>

            {/* Info */}
            <div className="flex items-center gap-6 text-gray-300 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {featuredMovie.averageRating && (
                <div className="flex items-center gap-2 px-4 py-2 glass-neon rounded-full">
                  <span className="text-neon-orange text-xl">★</span>
                  <span className="font-bold text-white">{featuredMovie.averageRating}</span>
                </div>
              )}
              {featuredMovie.year && <span className="px-4 py-2 glass-neon rounded-lg">{featuredMovie.year}</span>}
              {featuredMovie.duration && <span className="px-4 py-2 glass-neon rounded-lg">{featuredMovie.duration} min</span>}
              {featuredMovie.maturityRating && (
                <span className="badge-cyber">
                  {featuredMovie.maturityRating}
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to={`/movie/${featuredMovie._id}`}
                className="btn-neon flex items-center gap-3"
              >
                <FiPlay size={22} />
                Watch Now
              </Link>

              <button className="btn-hologram flex items-center gap-3">
                <FiInfo size={22} />
                More Info
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center particles-bg">
          <div className="animate-pulse text-neon-purple text-xl">Loading featured content...</div>
        </div>
      )}

      {/* Sliders */}
      <Slider
        title="Trending Now"
        items={trending}
        isLoading={isLoading}
      />

      <Slider
        title="New Releases"
        items={newReleases}
        isLoading={isLoading}
      />

      <Slider
        title="Recommended For You"
        items={recommendations}
        isLoading={isLoading}
      />

      {/* Browse by Genre */}
      <div className="section-spacing">
        <h2 className="heading-section mb-8">Browse by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: 'Action', gradient: 'from-neon-orange to-neon-pink' },
            { name: 'Comedy', gradient: 'from-neon-green to-neon-cyan' },
            { name: 'Drama', gradient: 'from-neon-purple to-neon-pink' },
            { name: 'Horror', gradient: 'from-red-600 to-neon-orange' },
            { name: 'Romance', gradient: 'from-neon-pink to-neon-purple' },
            { name: 'Sci-Fi', gradient: 'from-neon-cyan to-blue-500' },
          ].map((genre) => (
            <Link
              key={genre.name}
              to={`/search?genre=${genre.name}`}
              className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer hover-float neon-border"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-20 group-hover:opacity-40 transition-all duration-500`} />
              <div className="absolute inset-0 glass-neon" />
              <div className="relative h-full flex items-center justify-center">
                <span className="text-white font-black text-xl text-center px-4 group-hover:scale-110 transition-transform duration-300">
                  {genre.name}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${genre.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

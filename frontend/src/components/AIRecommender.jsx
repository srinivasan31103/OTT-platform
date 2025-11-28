import { useEffect, useState } from 'react';
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { contentApi } from '../api/apiClient';
import MovieCard from './MovieCard';

const AIRecommender = ({ currentMovie }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await contentApi.getRecommendations();
        // Filter out current movie
        const filtered = (response.data || []).filter(
          (item) => item._id !== currentMovie?._id
        );
        setRecommendations(filtered.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentMovie?._id]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await contentApi.getRecommendations();
      const filtered = (response.data || []).filter(
        (item) => item._id !== currentMovie?._id
      );
      setRecommendations(filtered.slice(0, 8));
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin">
            <FiRefreshCw size={24} className="text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8 border-t border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-primary text-xl" />
          <h3 className="text-white font-bold text-lg">
            Recommended for you
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          className="text-primary hover:text-pink-700 transition-colors"
        >
          <FiRefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((item) => (
          <MovieCard key={item._id} movie={item} />
        ))}
      </div>

      <p className="text-gray-400 text-sm mt-4">
        Powered by AI - Based on your viewing history and preferences
      </p>
    </div>
  );
};

export default AIRecommender;

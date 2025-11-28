import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { adminApi } from '../api/apiClient';

const UploadMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: null,
    backdrop: null,
    video: null,
    duration: '',
    year: new Date().getFullYear().toString(),
    rating: '',
    contentRating: 'PG-13',
    director: '',
    writers: '',
    genres: '',
    cast: '',
  });
  const [uploadProgress, setUploadProgress] = useState({
    poster: 0,
    backdrop: 0,
    video: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title || !formData.description || !formData.video) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const form = new FormData();

      // Add text fields
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('duration', formData.duration);
      form.append('year', formData.year);
      form.append('rating', formData.rating);
      form.append('contentRating', formData.contentRating);
      form.append('director', formData.director);

      if (formData.writers) {
        form.append('writers', formData.writers.split(',').map((w) => w.trim()));
      }

      if (formData.genres) {
        form.append('genres', formData.genres.split(',').map((g) => g.trim()));
      }

      if (formData.cast) {
        form.append('cast', formData.cast.split(',').map((c) => c.trim()));
      }

      // Add files
      if (formData.poster) {
        form.append('poster', formData.poster);
      }
      if (formData.backdrop) {
        form.append('backdrop', formData.backdrop);
      }
      if (formData.video) {
        form.append('video', formData.video);
      }

      const response = await adminApi.uploadMovie(form);

      setSuccess('Movie uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        poster: null,
        backdrop: null,
        video: null,
        duration: '',
        year: new Date().getFullYear().toString(),
        rating: '',
        contentRating: 'PG-13',
        director: '',
        writers: '',
        genres: '',
        cast: '',
      });

      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload movie');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Header */}
      <div className="px-4 lg:px-8 py-8 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-white">Upload Movie</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 glass-effect rounded-lg border border-green-500 flex items-center gap-3">
            <FiCheck className="text-green-500" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 glass-effect rounded-lg border border-red-500 flex items-center gap-3">
            <FiX className="text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-effect rounded-lg p-8 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Basic Information</h2>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter movie title"
                className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter movie description"
                rows={4}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="120"
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  placeholder="8.5"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Content Rating
                </label>
                <select
                  name="contentRating"
                  value={formData.contentRating}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold text-white">Credits</h2>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Director
              </label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                placeholder="Enter director name"
                className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Writers (comma-separated)
              </label>
              <input
                type="text"
                name="writers"
                value={formData.writers}
                onChange={handleInputChange}
                placeholder="Writer 1, Writer 2"
                className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Genres (comma-separated)
              </label>
              <input
                type="text"
                name="genres"
                value={formData.genres}
                onChange={handleInputChange}
                placeholder="Action, Drama, Thriller"
                className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Cast (comma-separated)
              </label>
              <input
                type="text"
                name="cast"
                value={formData.cast}
                onChange={handleInputChange}
                placeholder="Actor 1, Actor 2"
                className="w-full bg-slate-900 text-white border border-slate-700 rounded px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold text-white">Media Files</h2>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Video File *
              </label>
              <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  name="video"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
                <div className="flex flex-col items-center gap-2">
                  <FiUpload className="text-3xl text-gray-400" />
                  <p className="text-gray-300">
                    {formData.video?.name || 'Click or drag video here'}
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, or HLS stream
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Poster Image
              </label>
              <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  name="poster"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <FiUpload className="text-3xl text-gray-400" />
                  <p className="text-gray-300">
                    {formData.poster?.name || 'Click or drag poster here'}
                  </p>
                  <p className="text-xs text-gray-500">JPG or PNG</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Backdrop Image
              </label>
              <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  name="backdrop"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <FiUpload className="text-3xl text-gray-400" />
                  <p className="text-gray-300">
                    {formData.backdrop?.name || 'Click or drag backdrop here'}
                  </p>
                  <p className="text-xs text-gray-500">JPG or PNG</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 border-t border-slate-700 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 gradient-primary text-white rounded-lg font-bold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Uploading...' : 'Upload Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMovie;

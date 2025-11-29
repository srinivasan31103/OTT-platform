import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (email, password, name) =>
    apiClient.post('/auth/register', { email, password, name }),
  verify: () => apiClient.get('/auth/verify'),
  logout: () => apiClient.post('/auth/logout'),
};

export const profileApi = {
  getAll: () => apiClient.get('/profiles'),
  create: (data) => apiClient.post('/profiles', data),
  update: (id, data) => apiClient.put(`/profiles/${id}`, data),
  delete: (id) => apiClient.delete(`/profiles/${id}`),
  verifyPin: (id, pin) => apiClient.post(`/profiles/${id}/verify-pin`, { pin }),
};

export const contentApi = {
  getMovies: (params) => apiClient.get('/movies', { params }),
  getMovie: (id) => apiClient.get(`/movies/${id}`),
  getSeries: (params) => apiClient.get('/series', { params }),
  getSeriesDetail: (id) => apiClient.get(`/series/${id}`),
  getEpisode: (id) => apiClient.get(`/episodes/${id}`),
  getShorts: (params) => apiClient.get('/shorts', { params }),
  getShort: (id) => apiClient.get(`/shorts/${id}`),
  getLiveTV: () => apiClient.get('/live-tv'),
  getLiveTVChannel: (id) => apiClient.get(`/live-tv/${id}`),
  search: (query) => apiClient.get('/search', { params: { q: query } }),
  getTrending: () => apiClient.get('/trending'),
  getRecommendations: () => apiClient.get('/recommendations'),
};

export const playbackApi = {
  saveProgress: (videoId, progress, duration) =>
    apiClient.post('/playback/progress', { videoId, progress, duration }),
  getProgress: (videoId) => apiClient.get(`/playback/progress/${videoId}`),
  addToHistory: (videoId) => apiClient.post('/playback/history', { videoId }),
  getHistory: () => apiClient.get('/playback/history'),
  clearHistory: () => apiClient.delete('/playback/history'),
};

export const watchlistApi = {
  getAll: () => apiClient.get('/watchlist'),
  add: (contentId, contentType) =>
    apiClient.post('/watchlist', { contentId, contentType }),
  remove: (contentId) => apiClient.delete(`/watchlist/${contentId}`),
};

export const chatApi = {
  getMessages: (channelId) =>
    apiClient.get(`/chat/${channelId}`, { params: { limit: 50 } }),
  sendMessage: (channelId, message) =>
    apiClient.post(`/chat/${channelId}`, { message }),
  deleteMessage: (messageId) =>
    apiClient.delete(`/chat/message/${messageId}`),
};

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  updatePassword: (currentPassword, newPassword) =>
    apiClient.post('/user/update-password', { currentPassword, newPassword }),
  deleteAccount: () => apiClient.delete('/user/account'),
};

export const paymentApi = {
  getSubscriptionPlans: () => apiClient.get('/payments/plans'),
  initiatePurchase: (planId) =>
    apiClient.post('/payments/initiate', { planId }),
  verifyPayment: (transactionId) =>
    apiClient.post('/payments/verify', { transactionId }),
  getSubscriptionStatus: () => apiClient.get('/payments/subscription'),
  cancelSubscription: () => apiClient.post('/payments/cancel'),
};

export const adminApi = {
  uploadMovie: (formData) =>
    apiClient.post('/admin/upload-movie', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadSeries: (formData) =>
    apiClient.post('/admin/upload-series', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadShort: (formData) =>
    apiClient.post('/admin/upload-short', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: () => apiClient.get('/admin/users'),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  getContent: () => apiClient.get('/admin/content'),
  deleteContent: (contentId) => apiClient.delete(`/admin/content/${contentId}`),
};

export const watchPartyApi = {
  create: (contentId, contentType) =>
    apiClient.post('/watch-party', { contentId, contentType }),
  join: (partyId) => apiClient.post(`/watch-party/${partyId}/join`),
  getParty: (partyId) => apiClient.get(`/watch-party/${partyId}`),
  leave: (partyId) => apiClient.post(`/watch-party/${partyId}/leave`),
  sync: (partyId, currentTime) =>
    apiClient.post(`/watch-party/${partyId}/sync`, { currentTime }),
};

export default apiClient;

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
  saveProgress: (contentId, progress, duration) =>
    apiClient.put(`/watch/history/${contentId}`, { progress, duration }),
  getProgress: (contentId) => apiClient.get(`/watch/watched/${contentId}`),
  addToHistory: (contentId) => apiClient.post('/watch/history', { contentId }),
  getHistory: () => apiClient.get('/watch/history'),
  clearHistory: () => apiClient.delete('/watch/history'),
  getContinueWatching: () => apiClient.get('/watch/continue-watching'),
  getRecentlyWatched: () => apiClient.get('/watch/recently-watched'),
};

export const watchlistApi = {
  getAll: () => apiClient.get('/watchlist'),
  add: (contentId, contentType) =>
    apiClient.post('/watchlist', { contentId, contentType }),
  remove: (contentId) => apiClient.delete(`/watchlist/${contentId}`),
};

export const userApi = {
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  updatePassword: (currentPassword, newPassword) =>
    apiClient.post('/auth/reset-password', { currentPassword, newPassword }),
};

export const paymentApi = {
  getSubscriptionPlans: () => apiClient.get('/subscriptions/plans'),
  initiatePurchase: (planId) =>
    apiClient.post('/subscriptions/upgrade', { planId }),
  getSubscriptionStatus: () => apiClient.get('/subscriptions/status'),
  getCurrentSubscription: () => apiClient.get('/subscriptions/current'),
  cancelSubscription: () => apiClient.post('/subscriptions/cancel'),
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
    apiClient.post('/party', { contentId, contentType }),
  join: (partyId) => apiClient.post(`/party/${partyId}/join`),
  getParty: (partyId) => apiClient.get(`/party/${partyId}`),
  leave: (partyId) => apiClient.post(`/party/${partyId}/leave`),
  sync: (partyId, currentTime) =>
    apiClient.post(`/party/${partyId}/sync`, { currentTime }),
  getChat: (partyId) => apiClient.get(`/party/${partyId}/chat`),
  sendChat: (partyId, message) =>
    apiClient.post(`/party/${partyId}/chat`, { message }),
};

export const adApi = {
  getActiveAds: (placement) => apiClient.get('/ads/active', { params: { placement } }),
  trackImpression: (adId) => apiClient.post(`/ads/${adId}/impression`),
  trackClick: (adId) => apiClient.post(`/ads/${adId}/click`),
};

export const bannerApi = {
  getActiveBanners: (page) => apiClient.get('/banners/active', { params: { page } }),
  trackView: (bannerId) => apiClient.post(`/banners/${bannerId}/view`),
  trackClick: (bannerId) => apiClient.post(`/banners/${bannerId}/click`),
};

export const chatApi = {
  getMessages: (channelId) => apiClient.get(`/party/${channelId}/chat`),
  sendMessage: (channelId, message) => apiClient.post(`/party/${channelId}/chat`, { message }),
};

export default apiClient;

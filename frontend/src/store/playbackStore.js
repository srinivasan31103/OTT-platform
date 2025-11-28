import { create } from 'zustand';

export const usePlaybackStore = create((set, get) => ({
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  quality: 'auto',
  subtitles: false,
  subtitleLanguage: 'en',
  playbackRate: 1,
  isFullscreen: false,
  nextEpisode: null,
  watchHistory: [],

  setCurrentVideo: (video) => set({ currentVideo: video }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setQuality: (quality) => set({ quality }),
  setSubtitles: (enabled) => set({ subtitles: enabled }),
  setSubtitleLanguage: (language) => set({ subtitleLanguage: language }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  setNextEpisode: (episode) => set({ nextEpisode: episode }),

  saveProgress: async (token, videoId, progress, duration) => {
    try {
      await fetch('/api/playback/progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, progress, duration }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  getProgress: async (token, videoId) => {
    try {
      const response = await fetch(`/api/playback/progress/${videoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  },

  addToWatchHistory: async (token, videoId) => {
    try {
      const response = await fetch('/api/playback/history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) throw new Error('Failed to add to history');

      const data = await response.json();
      set((state) => ({
        watchHistory: [data, ...state.watchHistory.filter((v) => v.videoId !== videoId)],
      }));
      return data;
    } catch (error) {
      console.error('Failed to add to watch history:', error);
    }
  },

  getWatchHistory: async (token) => {
    try {
      const response = await fetch('/api/playback/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      set({ watchHistory: data });
      return data;
    } catch (error) {
      console.error('Failed to fetch watch history:', error);
      return [];
    }
  },

  clearWatchHistory: async (token) => {
    try {
      const response = await fetch('/api/playback/history', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to clear history');

      set({ watchHistory: [] });
    } catch (error) {
      console.error('Failed to clear watch history:', error);
    }
  },

  reset: () => {
    set({
      currentVideo: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      quality: 'auto',
      subtitles: false,
      subtitleLanguage: 'en',
      playbackRate: 1,
      isFullscreen: false,
      nextEpisode: null,
    });
  },
}));

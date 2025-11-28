import { create } from 'zustand';

export const useWatchlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWatchlist: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/watchlist', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch watchlist');

      const data = await response.json();
      set({ items: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  add: async (contentId, contentType = 'movie') => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType }),
      });

      if (!response.ok) throw new Error('Failed to add to watchlist');

      const data = await response.json();
      set((state) => ({
        items: [...state.items, data],
      }));
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  remove: async (contentId) => {
    try {
      const response = await fetch(`/api/watchlist/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from watchlist');

      set((state) => ({
        items: state.items.filter((item) => item.contentId !== contentId),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  isInWatchlist: (contentId) => {
    const state = get();
    return state.items.some((item) => item.contentId === contentId);
  },

  clear: () => set({ items: [] }),
}));

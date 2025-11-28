import { create } from 'zustand';

export const useProfileStore = create((set) => ({
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,

  fetchProfiles: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/profiles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch profiles');

      const data = await response.json();
      set({ profiles: data.data || [], isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setCurrentProfile: (profile) => set({ currentProfile: profile }),

  createProfile: async (token, profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to create profile');

      const data = await response.json();
      set((state) => ({
        profiles: [...state.profiles, data],
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (token, profileId, profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      set((state) => ({
        profiles: state.profiles.map((p) => (p._id === profileId ? data : p)),
        currentProfile: state.currentProfile?._id === profileId ? data : state.currentProfile,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteProfile: async (token, profileId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete profile');

      set((state) => ({
        profiles: state.profiles.filter((p) => p._id !== profileId),
        currentProfile: state.currentProfile?._id === profileId ? null : state.currentProfile,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  verifyPin: async (token, profileId, pin) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}/verify-pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) throw new Error('Invalid PIN');

      const data = await response.json();
      set({ currentProfile: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

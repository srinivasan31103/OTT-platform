import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password,
          });

          const data = response.data;
          set({
            user: {
              id: data.data.userId,
              email: data.data.email,
              name: data.data.name,
              isAdmin: data.data.isAdmin,
              subscription: data.data.subscription,
              profiles: data.data.profiles
            },
            token: data.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            email,
            password,
            name,
          });

          const data = response.data;
          set({
            user: {
              id: data.data.userId,
              email: data.data.email,
              name: data.data.name,
              isAdmin: data.data.isAdmin,
              subscription: data.data.subscription,
              profiles: data.data.profiles || []
            },
            token: data.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      verifyToken: async () => {
        const token = get().token;

        if (!token) return false;

        try {
          const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          const result = response.data;
          console.log('verifyToken - Response:', result);

          const userData = result.data;

          set({
            user: {
              id: userData._id,
              email: userData.email,
              name: userData.name,
              isAdmin: userData.isAdmin || false,
              subscription: userData.subscription,
              profiles: userData.profiles
            },
            isAuthenticated: true
          });

          console.log('verifyToken - User set:', {
            isAdmin: userData.isAdmin,
            user: userData
          });

          return true;
        } catch (error) {
          console.error('verifyToken error:', error);
          set({ isAuthenticated: false, user: null, token: null });
          return false;
        }
      },
    }),
    {
      name: 'authStore',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

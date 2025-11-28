import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
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
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
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
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(errorData.message || 'Registration failed');
          }

          const data = await response.json();
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
          set({ error: error.message, isLoading: false });
          throw error;
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
        const token = localStorage.getItem('authStore')
          ? JSON.parse(localStorage.getItem('authStore')).state.token
          : null;

        if (!token) return false;

        try {
          const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
            set({ isAuthenticated: false, token: null, user: null });
            return false;
          }

          const result = await response.json();
          console.log('verifyToken - Response:', result);

          // Backend returns { success: true, data: userObject }
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
          set({ isAuthenticated: false, user: null });
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

import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isLoading: false,
  isMenuOpen: false,
  isSearchOpen: false,
  isNotificationOpen: false,
  notifications: [],
  modals: {},
  toasts: [],

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsMenuOpen: (open) => set({ isMenuOpen: open }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setIsNotificationOpen: (open) => set({ isNotificationOpen: open }),

  openModal: (modalId, data) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: { open: true, data } },
    })),

  closeModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: { open: false, data: null } },
    })),

  toggleModal: (modalId) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: {
          open: !state.modals[modalId]?.open,
          data: state.modals[modalId]?.data || null,
        },
      },
    })),

  isModalOpen: (modalId) => (state) => state.modals[modalId]?.open || false,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now() }],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now() }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
  clearToasts: () => set({ toasts: [] }),
}));

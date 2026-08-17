import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Theme } from '../types';
import { setTokens, clearTokens } from '../api/client';

// ─── Auth Store ──────────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'blogverse-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Theme Store ─────────────────────────────────────────────────────
interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        });
      },

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'blogverse-theme',
    }
  )
);

// ─── UI Store ────────────────────────────────────────────────────────
interface UIStore {
  isSidebarOpen: boolean;
  isCreatePostOpen: boolean;
  unreadNotificationsCount: number;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openCreatePost: () => void;
  closeCreatePost: () => void;
  setUnreadNotificationsCount: (count: number) => void;
  markAllNotificationsRead: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  isCreatePostOpen: false,
  unreadNotificationsCount: 2,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openCreatePost: () => set({ isCreatePostOpen: true }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
  markAllNotificationsRead: () => set({ unreadNotificationsCount: 0 }),
}));

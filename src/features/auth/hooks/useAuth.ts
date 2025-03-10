import { create } from 'zustand';
import { AuthService } from '../services/auth.service';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (data: any) => Promise<void>;
  loginWithEmail: (data: any) => Promise<void>;
  loginWithPhone: (data: any) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  register: async (data) => {
    try {
      set({ loading: true, error: null });
      const result = await AuthService.register(data);
      set({ user: result.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  loginWithEmail: async (data) => {
    try {
      set({ loading: true, error: null });
      const result = await AuthService.loginWithEmail(data);
      set({ user: result.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  loginWithPhone: async (data) => {
    try {
      set({ loading: true, error: null });
      const result = await AuthService.loginWithPhone(data);
      set({ user: result.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  sendPhoneOtp: async (phone) => {
    try {
      set({ loading: true, error: null });
      await AuthService.sendPhoneOtp(phone);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await AuthService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null })
}));

// Inicializar el listener de sesión
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    useAuth.setState({ user: session.user, isAuthenticated: true });
  } else {
    useAuth.setState({ user: null, isAuthenticated: false });
  }
});

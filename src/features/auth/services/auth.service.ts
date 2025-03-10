import { supabase } from '@/lib/supabase';
import { LoginCredentials, RegisterCredentials, AuthUser } from '../types/auth.types';

export class AuthService {
  static async register({
    email,
    password,
    phone,
    firstName,
    lastName
  }: {
    email?: string;
    password: string;
    phone?: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email || undefined,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || undefined
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  static async loginWithEmail({ email, password }: { email: string; password: string }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  static async loginWithPhone({ phone, code }: { phone: string; code: string }) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en login con teléfono:', error);
      throw error;
    }
  }

  static async sendPhoneOtp(phone: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error enviando OTP:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user ?? null;
  }
}

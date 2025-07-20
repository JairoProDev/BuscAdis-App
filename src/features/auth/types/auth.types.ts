export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface RegisterCredentials {
  email?: string;
  phone: string;
  password?: string;
  fullName: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  code?: string;
  dni?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

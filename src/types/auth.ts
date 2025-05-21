
export type Role = 'admin' | 'commercial' | 'franchise_manager' | 'supervisor' | 'inspector';

export interface Franchise {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  franchises: Franchise[];
  profileUrl?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

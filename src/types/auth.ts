
export type UserRole = "admin" | "staff" | "volunteer" | "beneficiary";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  contactInfo?: string;
  createdAt: string;
  lastLoginAt?: string;
  additionalInfo?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>;
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
}

export interface LoginCredentials {
  email: string;
  password: string;
}


import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, LoginCredentials, User, UserRole } from "@/types/auth";
import { mockUsers, mockPasswords, generateUserId } from "@/data/mockUsers";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = "ngo_auth_user";
const USERS_STORAGE_KEY = "ngo_users";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize users from local storage or mock data
  useEffect(() => {
    // Attempt to restore the logged-in user from local storage
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize users from local storage or mock data
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(mockUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get all users
      const allUsers = getAllUsers();
      
      // Find user by email
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // In a real app, you would hash and compare passwords
      // Here we just check the mock passwords
      const correctPassword = mockPasswords[email.toLowerCase()];
      
      if (password !== correctPassword) {
        throw new Error("Invalid email or password");
      }
      
      if (!foundUser.isActive) {
        throw new Error("Your account is deactivated. Please contact an administrator.");
      }
      
      // Update last login time
      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date().toISOString()
      };
      
      // Update the user locally
      const updatedUsers = allUsers.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Set user as logged in
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.fullName}!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  // Get all users
  const getAllUsers = (): User[] => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    return users;
  };

  // Get user by ID
  const getUserById = (id: string): User | undefined => {
    return getAllUsers().find(u => u.id === id);
  };

  // Create a new user (admin only)
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if the current user is an admin
      if (user?.role !== "admin") {
        throw new Error("Only administrators can create new users");
      }
      
      // Check if the email is already in use
      const existingUser = getAllUsers().find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error("Email is already in use");
      }
      
      // Create new user object
      const newUser: User = {
        id: generateUserId(userData.role),
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        contactInfo: userData.contactInfo,
        isActive: true,
        createdAt: new Date().toISOString(),
        additionalInfo: userData.additionalInfo || {}
      };
      
      // Update the users list
      const updatedUsers = [...getAllUsers(), newUser];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Update the passwords (in a real app, this would be hashed)
      // Note: In a production app, never store passwords like this
      const updatedPasswords = {
        ...mockPasswords,
        [userData.email.toLowerCase()]: userData.password
      };
      
      // In a real app, you would save the hashed password to the database
      // For our mock app, we just update our mock passwords
      Object.assign(mockPasswords, updatedPasswords);
      
      toast({
        title: "User created",
        description: `${newUser.fullName} has been added as a ${newUser.role}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message || "An unexpected error occurred"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get current users
      const allUsers = getAllUsers();
      
      // Find the user to update
      const userToUpdate = allUsers.find(u => u.id === userId);
      
      if (!userToUpdate) {
        throw new Error("User not found");
      }
      
      // Check permissions:
      // - Admin can update any user
      // - Users can only update their own profile
      if (user?.role !== "admin" && user?.id !== userId) {
        throw new Error("You don't have permission to update this user");
      }
      
      // Admin-only fields that other users can't modify
      if (user?.role !== "admin") {
        delete data.role;
        delete data.isActive;
      }
      
      // Update the user
      const updatedUser = {
        ...userToUpdate,
        ...data
      };
      
      // Update users array
      const updatedUsers = allUsers.map(u => 
        u.id === userId ? updatedUser : u
      );
      
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // If updating the current user, also update the auth state
      if (user?.id === userId) {
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Profile updated",
        description: "User profile has been successfully updated."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message || "An unexpected error occurred"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    createUser,
    updateUserProfile,
    getAllUsers,
    getUserById
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

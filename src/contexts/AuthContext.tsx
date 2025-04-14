
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User, UserRole } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from Supabase
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // User is signed in
          try {
            // Get user profile from database
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            // Set user state with profile data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: profile?.full_name || '',
              role: (profile?.role as UserRole) || 'beneficiary',
              isActive: profile?.is_active || true,
              contactInfo: profile?.contact_info || '',
              createdAt: profile?.created_at || new Date().toISOString(),
              lastLoginAt: profile?.last_login_at || undefined,
              additionalInfo: profile?.additional_info || {}
            });
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          // User is signed out
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If there's an existing session, the onAuthStateChange will handle it
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Update last login time in profile
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id);
          
        if (updateError) console.error("Failed to update last login time:", updateError);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
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
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out."
      });
    }
  };

  // Get all users (admin only)
  const getAllUsers = async (): Promise<User[]> => {
    if (user?.role !== 'admin') return [];
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.id,
        email: '', // Email is not stored in profiles table for security
        fullName: profile.full_name,
        role: profile.role as UserRole,
        isActive: profile.is_active,
        contactInfo: profile.contact_info || '',
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at || undefined,
        additionalInfo: profile.additional_info || {}
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  // Get user by ID
  const getUserById = async (id: string): Promise<User | undefined> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return {
        id: profile.id,
        email: '', // Email is not stored in profiles table for security
        fullName: profile.full_name,
        role: profile.role as UserRole,
        isActive: profile.is_active,
        contactInfo: profile.contact_info || '',
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at || undefined,
        additionalInfo: profile.additional_info || {}
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  };

  // Create a new user (admin only)
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Check if the current user is an admin
      if (user?.role !== "admin") {
        throw new Error("Only administrators can create new users");
      }
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role
          }
        }
      });
      
      if (error) throw error;
      
      // The trigger will automatically create the profile entry
      
      toast({
        title: "User created",
        description: `${userData.fullName} has been added as a ${userData.role}.`
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
      // Check permissions:
      // - Admin can update any user
      // - Users can only update their own profile
      if (user?.role !== "admin" && user?.id !== userId) {
        throw new Error("You don't have permission to update this user");
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          role: data.role,
          is_active: data.isActive,
          contact_info: data.contactInfo,
          additional_info: data.additionalInfo
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // If updating the current user, refresh user state
      if (user?.id === userId) {
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (fetchError) throw fetchError;
        
        setUser({
          ...user,
          fullName: updatedProfile.full_name,
          role: updatedProfile.role as UserRole,
          isActive: updatedProfile.is_active,
          contactInfo: updatedProfile.contact_info || '',
          additionalInfo: updatedProfile.additional_info || {}
        });
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

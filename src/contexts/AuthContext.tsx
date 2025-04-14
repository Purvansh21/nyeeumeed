import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User, UserRole } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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

            // Parse additionalInfo as Record<string, any> or default to empty object
            const additionalInfo = typeof profile?.additional_info === 'object' 
              ? profile?.additional_info as Record<string, any>
              : {};

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
              additionalInfo
            });
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          // User is signed out
          setUser(null);
        }

        setIsLoading(false);
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
    if (user?.role !== 'admin' && user?.role !== 'staff') return [];
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      return data.map(profile => {
        // Ensure additionalInfo is always a Record<string, any> or empty object
        let additionalInfo: Record<string, any> = {};
        if (profile.additional_info && typeof profile.additional_info === 'object' && !Array.isArray(profile.additional_info)) {
          additionalInfo = profile.additional_info as Record<string, any>;
        }
          
        return {
          id: profile.id,
          email: '', // Email is not stored in profiles table for security
          fullName: profile.full_name,
          role: profile.role as UserRole,
          isActive: profile.is_active,
          contactInfo: profile.contact_info || '',
          createdAt: profile.created_at,
          lastLoginAt: profile.last_login_at || undefined,
          additionalInfo
        };
      });
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
      
      // Parse additionalInfo as Record<string, any> or default to empty object
      const additionalInfo = typeof profile.additional_info === 'object' 
        ? profile.additional_info as Record<string, any>
        : {};
        
      return {
        id: profile.id,
        email: '', // Email is not stored in profiles table for security
        fullName: profile.full_name,
        role: profile.role as UserRole,
        isActive: profile.is_active,
        contactInfo: profile.contact_info || '',
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at || undefined,
        additionalInfo
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

  // Modified function to handle role-specific data
  const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Check permissions:
      // - Admin can update any user
      // - Users can only update their own profile
      if (user?.role !== "admin" && user?.id !== userId) {
        throw new Error("You don't have permission to update this user");
      }
      
      // Get current user data to check for role changes
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Ensure additionalInfo is a valid object or null
      const additional_info = data.additionalInfo && typeof data.additionalInfo === 'object' 
        ? data.additionalInfo 
        : null;
      
      // Update profile in database - only update fields that are provided
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.contactInfo !== undefined) updateData.contact_info = data.contactInfo;
      if (additional_info !== undefined) updateData.additional_info = additional_info;
      
      // Only update role if it's changed and provided
      if (data.role !== undefined && data.role !== currentProfile.role) {
        updateData.role = data.role;
        
        // Get user data to use for role table operations
        const userData = {
          id: userId,
          full_name: data.fullName || currentProfile.full_name,
          email: `${data.role}-${userId.substring(0, 8)}@example.com`,
          contact_info: data.contactInfo || currentProfile.contact_info,
          is_active: data.isActive !== undefined ? data.isActive : currentProfile.is_active,
          created_at: currentProfile.created_at,
          last_login_at: currentProfile.last_login_at
        };
        
        // Delete from previous role table FIRST to avoid constraint violations
        if (currentProfile.role !== data.role) {
          if (currentProfile.role === 'admin') {
            await supabase.from('admin_users').delete().eq('id', userId);
          } else if (currentProfile.role === 'staff') {
            await supabase.from('staff_users').delete().eq('id', userId);
          } else if (currentProfile.role === 'volunteer') {
            await supabase.from('volunteer_users').delete().eq('id', userId);
          } else if (currentProfile.role === 'beneficiary') {
            await supabase.from('beneficiary_users').delete().eq('id', userId);
          }
        }
        
        // Then insert into new role table after deletion, to prevent key constraint violations
        try {
          let tableName = '';
          if (data.role === 'admin') {
            tableName = 'admin_users';
          } else if (data.role === 'staff') {
            tableName = 'staff_users';
          } else if (data.role === 'volunteer') {
            tableName = 'volunteer_users';
          } else if (data.role === 'beneficiary') {
            tableName = 'beneficiary_users';
          }
          
          if (tableName) {
            // First check if the record already exists
            const { data: existingRecord } = await supabase
              .from(tableName)
              .select('id')
              .eq('id', userId)
              .maybeSingle();
              
            if (!existingRecord) {
              // Only insert if record doesn't exist
              const { error: insertError } = await supabase
                .from(tableName)
                .insert(userData);
                
              if (insertError) {
                console.error(`Error inserting into ${tableName}:`, insertError);
                throw insertError;
              }
            }
          }
        } catch (error) {
          console.error('Error during role table update:', error);
          throw error;
        }
      }
      
      // Only perform the update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
          
        if (error) throw error;
      }
      
      // If updating the current user, refresh user state
      if (user?.id === userId) {
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Parse additionalInfo as Record<string, any> or default to empty object
        const additionalInfo = typeof updatedProfile.additional_info === 'object' 
          ? updatedProfile.additional_info as Record<string, any>
          : {};
          
        setUser({
          ...user,
          fullName: updatedProfile.full_name,
          role: updatedProfile.role as UserRole,
          isActive: updatedProfile.is_active,
          contactInfo: updatedProfile.contact_info || '',
          additionalInfo
        });
      }
      
      toast({
        title: "Profile updated",
        description: "User profile has been successfully updated."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
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

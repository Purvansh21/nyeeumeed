
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User, UserRole } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to ensure we're always using a valid table name
const getTableNameForRole = (role: UserRole): "admin_users" | "staff_users" | "volunteer_users" | "beneficiary_users" => {
  switch (role) {
    case 'admin':
      return "admin_users";
    case 'staff':
      return "staff_users";
    case 'volunteer':
      return "volunteer_users";
    case 'beneficiary':
      return "beneficiary_users";
    default:
      return "beneficiary_users";
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            const additionalInfo = typeof profile?.additional_info === 'object' 
              ? profile?.additional_info as Record<string, any>
              : {};

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
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
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

  const getAllUsers = async (): Promise<User[]> => {
    if (user?.role !== 'admin' && user?.role !== 'staff') return [];
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      return data.map(profile => {
        let additionalInfo: Record<string, any> = {};
        if (profile.additional_info && typeof profile.additional_info === 'object' && !Array.isArray(profile.additional_info)) {
          additionalInfo = profile.additional_info as Record<string, any>;
        }
          
        return {
          id: profile.id,
          email: '',
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

  const getUserById = async (id: string): Promise<User | undefined> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      const additionalInfo = typeof profile.additional_info === 'object' 
        ? profile.additional_info as Record<string, any>
        : {};
        
      return {
        id: profile.id,
        email: '',
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

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (user?.role !== "admin") {
        throw new Error("Only administrators can create new users");
      }
      
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

  const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (user?.role !== "admin" && user?.id !== userId) {
        throw new Error("You don't have permission to update this user");
      }
      
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const additional_info = data.additionalInfo && typeof data.additionalInfo === 'object' 
        ? data.additionalInfo 
        : null;
      
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.contactInfo !== undefined) updateData.contact_info = data.contactInfo;
      if (additional_info !== undefined) updateData.additional_info = additional_info;
      
      const roleChanged = data.role !== undefined && data.role !== currentProfile.role;
      if (roleChanged) {
        updateData.role = data.role;
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log(`Updating profile for user ${userId}:`, updateData);
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
          
        if (error) throw error;
      }
      
      // Handle specific role changes
      if (roleChanged && data.role) {
        try {
          // 1. First, remove the user from the old role table
          const oldRoleTable = getTableNameForRole(currentProfile.role as UserRole);
          console.log(`Deleting user ${userId} from ${oldRoleTable}`);
          
          const { error: deleteError } = await supabase
            .from(oldRoleTable)
            .delete()
            .eq('id', userId);
            
          if (deleteError) {
            console.error(`Error deleting from ${oldRoleTable}:`, deleteError);
            // Continue despite error to ensure we at least try to insert into new role table
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          
          // 2. Then add to the new role table
          const newRoleTable = getTableNameForRole(data.role);
          
          // Prepare user data for the new role table
          const userData = {
            id: userId,
            full_name: data.fullName || currentProfile.full_name,
            email: `${data.role}-${userId.substring(0, 8)}@example.com`,
            contact_info: data.contactInfo || currentProfile.contact_info,
            is_active: data.isActive !== undefined ? data.isActive : currentProfile.is_active,
            created_at: currentProfile.created_at,
            last_login_at: currentProfile.last_login_at
          };
          
          console.log(`Adding user ${userId} to ${newRoleTable}`, userData);
          
          // 3. Check if the user already exists in the new role table
          const { data: existingEntry, error: checkError } = await supabase
            .from(newRoleTable)
            .select('id')
            .eq('id', userId)
            .maybeSingle();
            
          if (checkError) {
            console.error(`Error checking for existing entry in ${newRoleTable}:`, checkError);
          }
          
          // 4. Either update or insert based on whether the user already exists
          if (existingEntry) {
            console.log(`User ${userId} already exists in ${newRoleTable}, updating...`);
            const { error: updateError } = await supabase
              .from(newRoleTable)
              .update(userData)
              .eq('id', userId);
              
            if (updateError) {
              console.error(`Error updating ${newRoleTable}:`, updateError);
              throw updateError;
            }
          } else {
            console.log(`User ${userId} does not exist in ${newRoleTable}, inserting...`);
            const { error: insertError } = await supabase
              .from(newRoleTable)
              .insert(userData);
              
            if (insertError) {
              console.error(`Error inserting into ${newRoleTable}:`, insertError);
              throw insertError;
            }
          }
        } catch (error) {
          console.error('Error during role table update:', error);
          throw error;
        }
      } else if (data.isActive !== undefined || data.fullName !== undefined || data.contactInfo !== undefined) {
        // If only updating active status, name, or contact info (not changing role)
        try {
          const roleTable = getTableNameForRole(currentProfile.role as UserRole);
          
          const roleTableUpdateData: any = {};
          if (data.isActive !== undefined) {
            roleTableUpdateData.is_active = data.isActive;
            console.log(`Updating is_active to ${data.isActive} in ${roleTable} for user ${userId}`);
          }
          if (data.fullName !== undefined) roleTableUpdateData.full_name = data.fullName;
          if (data.contactInfo !== undefined) roleTableUpdateData.contact_info = data.contactInfo;
          
          if (Object.keys(roleTableUpdateData).length > 0) {
            const { error: roleUpdateError } = await supabase
              .from(roleTable)
              .update(roleTableUpdateData)
              .eq('id', userId);
              
            if (roleUpdateError) {
              console.error(`Error updating ${roleTable}:`, roleUpdateError);
              throw roleUpdateError;
            }
          }
        } catch (error) {
          console.error('Error updating role-specific table:', error);
          throw error;
        }
      }
      
      // Update local user state if the current user is being updated
      if (user?.id === userId) {
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (fetchError) throw fetchError;
        
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

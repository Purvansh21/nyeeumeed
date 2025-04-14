
import { supabase } from "@/integrations/supabase/client";
import { 
  VolunteerOpportunity, 
  VolunteerRegistration, 
  VolunteerAchievement,
  VolunteerTask,
  VolunteerTrainingMaterial,
  VolunteerTrainingProgress,
  VolunteerHours
} from "@/types/volunteer";
import { toast } from "@/hooks/use-toast";

// Opportunities
export const getVolunteerOpportunities = async (): Promise<VolunteerOpportunity[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching volunteer opportunities:", error);
    return [];
  }
};

export const getVolunteerOpportunity = async (id: string): Promise<VolunteerOpportunity | null> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching volunteer opportunity with ID ${id}:`, error);
    return null;
  }
};

// Registrations
export const getVolunteerRegistrations = async (volunteerId: string): Promise<VolunteerRegistration[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select(`
        *,
        opportunity:volunteer_opportunities(*)
      `)
      .eq('volunteer_id', volunteerId)
      .order('registered_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching volunteer registrations:", error);
    return [];
  }
};

export const registerForOpportunity = async (opportunityId: string, volunteerId: string): Promise<boolean> => {
  try {
    // First check if there are spots available
    const { data: opportunity, error: opportunityError } = await supabase
      .from('volunteer_opportunities')
      .select('spots_available, spots_filled')
      .eq('id', opportunityId)
      .single();
      
    if (opportunityError) throw opportunityError;
    
    if (!opportunity || opportunity.spots_filled >= opportunity.spots_available) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "This opportunity is already full."
      });
      return false;
    }
    
    // Register the volunteer
    const { error: registrationError } = await supabase
      .from('volunteer_registrations')
      .insert({
        volunteer_id: volunteerId,
        opportunity_id: opportunityId,
        status: 'registered'
      });
      
    if (registrationError) throw registrationError;
    
    // Update the spots filled count
    const { error: updateError } = await supabase
      .from('volunteer_opportunities')
      .update({ 
        spots_filled: opportunity.spots_filled + 1,
        status: opportunity.spots_filled + 1 >= opportunity.spots_available ? 'full' : 'active'
      })
      .eq('id', opportunityId);
      
    if (updateError) throw updateError;
    
    toast({
      title: "Registration successful",
      description: "You've been signed up for this volunteer opportunity."
    });
    
    return true;
  } catch (error: any) {
    console.error("Error registering for opportunity:", error);
    
    // Handle unique constraint violation (already registered)
    if (error.code === '23505') {
      toast({
        variant: "destructive",
        title: "Already registered",
        description: "You are already registered for this opportunity."
      });
    } else {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An unexpected error occurred."
      });
    }
    
    return false;
  }
};

export const cancelRegistration = async (registrationId: string, opportunityId: string): Promise<boolean> => {
  try {
    // Update the registration status
    const { error: registrationError } = await supabase
      .from('volunteer_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);
      
    if (registrationError) throw registrationError;
    
    // Get the current opportunity details
    const { data: opportunity, error: opportunityError } = await supabase
      .from('volunteer_opportunities')
      .select('spots_filled')
      .eq('id', opportunityId)
      .single();
      
    if (opportunityError) throw opportunityError;
    
    // Update the spots filled count
    const { error: updateError } = await supabase
      .from('volunteer_opportunities')
      .update({ 
        spots_filled: Math.max(0, opportunity.spots_filled - 1),
        status: 'active' // Set back to active since a spot opened up
      })
      .eq('id', opportunityId);
      
    if (updateError) throw updateError;
    
    toast({
      title: "Registration cancelled",
      description: "Your registration has been cancelled."
    });
    
    return true;
  } catch (error: any) {
    console.error("Error cancelling registration:", error);
    toast({
      variant: "destructive",
      title: "Cancellation failed",
      description: error.message || "An unexpected error occurred."
    });
    
    return false;
  }
};

export const logVolunteerHours = async (
  registrationId: string, 
  hours: number, 
  feedback?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('volunteer_registrations')
      .update({
        status: 'completed',
        hours_logged: hours,
        completed_at: new Date().toISOString(),
        feedback
      })
      .eq('id', registrationId);
      
    if (error) throw error;
    
    toast({
      title: "Hours logged successfully",
      description: "Your volunteer hours have been recorded."
    });
    
    return true;
  } catch (error: any) {
    console.error("Error logging volunteer hours:", error);
    toast({
      variant: "destructive",
      title: "Failed to log hours",
      description: error.message || "An unexpected error occurred."
    });
    
    return false;
  }
};

// Achievements
export const getVolunteerAchievements = async (volunteerId: string): Promise<VolunteerAchievement[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_achievements')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .order('date_earned', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching volunteer achievements:", error);
    return [];
  }
};

// Training
export const getTrainingMaterials = async (): Promise<VolunteerTrainingMaterial[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_training_materials')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching training materials:", error);
    return [];
  }
};

export const getTrainingProgress = async (volunteerId: string): Promise<VolunteerTrainingProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_training_progress')
      .select(`
        *,
        material:volunteer_training_materials(*)
      `)
      .eq('volunteer_id', volunteerId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching training progress:", error);
    return [];
  }
};

export const updateTrainingProgress = async (
  volunteerId: string,
  materialId: string,
  status: 'in_progress' | 'completed',
  score?: number
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    const updates: any = {
      volunteer_id: volunteerId,
      material_id: materialId,
      status
    };
    
    if (status === 'in_progress' && !updates.started_at) {
      updates.started_at = now;
    }
    
    if (status === 'completed') {
      updates.completed_at = now;
      if (score !== undefined) {
        updates.score = score;
      }
    }
    
    // Check if progress entry already exists
    const { data: existing, error: checkError } = await supabase
      .from('volunteer_training_progress')
      .select('id')
      .eq('volunteer_id', volunteerId)
      .eq('material_id', materialId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('volunteer_training_progress')
        .update(updates)
        .eq('id', existing.id);
        
      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('volunteer_training_progress')
        .insert(updates);
        
      if (error) throw error;
    }
    
    toast({
      title: `Training ${status === 'completed' ? 'completed' : 'in progress'}`,
      description: `Your training progress has been updated.`
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating training progress:", error);
    toast({
      variant: "destructive",
      title: "Failed to update progress",
      description: error.message || "An unexpected error occurred."
    });
    
    return false;
  }
};

// Tasks
export const getVolunteerTasks = async (volunteerId: string): Promise<VolunteerTask[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_tasks')
      .select(`
        *,
        beneficiary:beneficiary_users(id, full_name)
      `)
      .eq('volunteer_id', volunteerId)
      .order('due_date', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching volunteer tasks:", error);
    return [];
  }
};

export const updateTaskStatus = async (
  taskId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('volunteer_tasks')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
      
    if (error) throw error;
    
    toast({
      title: "Task updated",
      description: `Task status has been updated to ${status}.`
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating task status:", error);
    toast({
      variant: "destructive",
      title: "Failed to update task",
      description: error.message || "An unexpected error occurred."
    });
    
    return false;
  }
};

// Hours summary
export const getVolunteerHoursSummary = async (volunteerId: string): Promise<VolunteerHours> => {
  try {
    // Get all completed registrations with hours logged
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select('hours_logged, completed_at')
      .eq('volunteer_id', volunteerId)
      .eq('status', 'completed')
      .not('hours_logged', 'is', null);
      
    if (error) throw error;
    
    const registrations = data || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let total = 0;
    let monthly = 0;
    let yearly = 0;
    
    // Group hours by month for the last 12 months
    const monthlyData: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }
    
    registrations.forEach(reg => {
      const hours = Number(reg.hours_logged) || 0;
      total += hours;
      
      if (reg.completed_at) {
        const completedDate = new Date(reg.completed_at);
        const isCurrentMonth = completedDate.getMonth() === currentMonth && 
                               completedDate.getFullYear() === currentYear;
        const isCurrentYear = completedDate.getFullYear() === currentYear;
        
        if (isCurrentMonth) {
          monthly += hours;
        }
        
        if (isCurrentYear) {
          yearly += hours;
        }
        
        // Add to monthly data if within last 12 months
        const monthDiff = (currentYear - completedDate.getFullYear()) * 12 + 
                          (currentMonth - completedDate.getMonth());
        
        if (monthDiff >= 0 && monthDiff < 12) {
          const monthKey = completedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          
          if (monthlyData[monthKey] !== undefined) {
            monthlyData[monthKey] += hours;
          }
        }
      }
    });
    
    // Convert monthly data to array for chart display
    const details = Object.entries(monthlyData).map(([month, hours]) => ({
      month,
      hours
    })).reverse();
    
    return {
      total,
      monthly,
      yearly,
      details
    };
  } catch (error) {
    console.error("Error calculating volunteer hours:", error);
    return {
      total: 0,
      monthly: 0,
      yearly: 0,
      details: []
    };
  }
};

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

// Mock data to use until Supabase types are updated
const mockOpportunities: VolunteerOpportunity[] = [
  {
    id: "1",
    title: "Food Bank Assistance",
    description: "Help distribute food to families in need",
    category: "Food Support",
    date: "2025-04-20",
    start_time: "2025-04-20T10:00:00",
    end_time: "2025-04-20T14:00:00",
    location: "Community Center",
    spots_available: 15,
    spots_filled: 8,
    status: "active",
    created_at: "2025-04-01T00:00:00",
    updated_at: "2025-04-01T00:00:00",
    created_by: "admin-1"
  },
  {
    id: "2",
    title: "After-School Tutoring",
    description: "Tutor elementary school students in math and reading",
    category: "Education",
    date: "2025-04-22",
    start_time: "2025-04-22T15:30:00",
    end_time: "2025-04-22T17:30:00",
    location: "Lincoln Elementary School",
    spots_available: 10,
    spots_filled: 5,
    status: "active",
    created_at: "2025-04-02T00:00:00",
    updated_at: "2025-04-02T00:00:00",
    created_by: "admin-1"
  },
  {
    id: "3",
    title: "Neighborhood Cleanup",
    description: "Help clean up trash and beautify the neighborhood",
    category: "Environment",
    date: "2025-04-25",
    start_time: "2025-04-25T09:00:00",
    end_time: "2025-04-25T12:00:00",
    location: "Riverside Park",
    spots_available: 20,
    spots_filled: 12,
    status: "active",
    created_at: "2025-04-03T00:00:00",
    updated_at: "2025-04-03T00:00:00",
    created_by: "admin-1"
  }
];

const mockRegistrations = (volunteerId: string): VolunteerRegistration[] => [
  {
    id: "1",
    volunteer_id: volunteerId,
    opportunity_id: "1",
    status: "registered",
    registered_at: "2025-04-05T00:00:00",
    opportunity: mockOpportunities[0]
  },
  {
    id: "2",
    volunteer_id: volunteerId,
    opportunity_id: "3",
    status: "registered",
    registered_at: "2025-04-07T00:00:00",
    opportunity: mockOpportunities[2]
  }
];

// Opportunities
export const getVolunteerOpportunities = async (): Promise<VolunteerOpportunity[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) {
      console.error("Error fetching volunteer opportunities:", error);
      throw error;
    }
    
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
      
    if (error) {
      console.error(`Error fetching volunteer opportunity with ID ${id}:`, error);
      throw error;
    }
    
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
      
    if (error) {
      console.error("Error fetching volunteer registrations:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching volunteer registrations:", error);
    return [];
  }
};

export const registerForOpportunity = async (opportunityId: string, volunteerId: string): Promise<boolean> => {
  try {
    // First, get the opportunity to check if it's full
    const { data: opportunity, error: opportunityError } = await supabase
      .from('volunteer_opportunities')
      .select('*')
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
    
    // Check if already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('volunteer_registrations')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingRegistration) {
      toast({
        variant: "destructive",
        title: "Already registered",
        description: "You are already registered for this opportunity."
      });
      return false;
    }
    
    // Create the registration
    const { error: registrationError } = await supabase
      .from('volunteer_registrations')
      .insert({
        volunteer_id: volunteerId,
        opportunity_id: opportunityId,
        status: 'registered',
        registered_at: new Date().toISOString()
      });
    
    if (registrationError) throw registrationError;
    
    // Update the opportunity
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
    
    toast({
      variant: "destructive",
      title: "Registration failed",
      description: error.message || "An unexpected error occurred."
    });
    
    return false;
  }
};

export const cancelRegistration = async (registrationId: string, opportunityId: string): Promise<boolean> => {
  try {
    // Mock successful cancellation
    toast({
      title: "Registration cancelled",
      description: "Your registration has been cancelled."
    });
    
    return true;

    /* Uncomment when types are updated
    // Update the registration
    const { error: registrationError } = await supabase
      .from('volunteer_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);
    
    if (registrationError) throw registrationError;
    
    // Get the opportunity
    const { data: opportunity, error: opportunityError } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    
    if (opportunityError) throw opportunityError;
    
    // Update the opportunity
    const { error: updateError } = await supabase
      .from('volunteer_opportunities')
      .update({ 
        spots_filled: Math.max(0, opportunity.spots_filled - 1),
        status: 'active'
      })
      .eq('id', opportunityId);
    
    if (updateError) throw updateError;
    
    toast({
      title: "Registration cancelled",
      description: "Your registration has been cancelled."
    });
    
    return true;
    */
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
    // Mock successful hours logging
    toast({
      title: "Hours logged successfully",
      description: "Your volunteer hours have been recorded."
    });
    
    return true;

    /* Uncomment when types are updated
    const { error } = await supabase
      .from('volunteer_registrations')
      .update({
        status: 'completed',
        hours_logged: hours,
        completed_at: new Date().toISOString(),
        feedback: feedback
      })
      .eq('id', registrationId);
    
    if (error) throw error;
    
    toast({
      title: "Hours logged successfully",
      description: "Your volunteer hours have been recorded."
    });
    
    return true;
    */
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
    // Mock achievements
    return [
      {
        id: "1",
        volunteer_id: volunteerId,
        title: "First Time Volunteer",
        description: "Completed your first volunteer activity",
        badge_name: "first_time",
        date_earned: "2025-04-01T00:00:00",
        category: "Milestone",
        points: 10
      },
      {
        id: "2",
        volunteer_id: volunteerId,
        title: "Helping Hand",
        description: "Volunteered for 10 hours",
        badge_name: "helping_hand",
        date_earned: "2025-04-10T00:00:00",
        category: "Hours",
        points: 25
      }
    ];

    /* Uncomment when types are updated
    const { data, error } = await supabase
      .from('volunteer_achievements')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .order('date_earned', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
    */
  } catch (error) {
    console.error("Error fetching volunteer achievements:", error);
    return [];
  }
};

// Training
export const getTrainingMaterials = async (): Promise<VolunteerTrainingMaterial[]> => {
  try {
    // Mock training materials
    return [
      {
        id: "1",
        title: "Volunteer Orientation",
        description: "Basic orientation for new volunteers",
        category: "Onboarding",
        content_type: "video",
        url: "https://example.com/orientation",
        created_at: "2025-03-01T00:00:00",
        updated_at: "2025-03-01T00:00:00",
        is_required: true
      },
      {
        id: "2",
        title: "Safety Guidelines",
        description: "Important safety information for all volunteers",
        category: "Safety",
        content_type: "document",
        url: "https://example.com/safety",
        created_at: "2025-03-10T00:00:00",
        updated_at: "2025-03-10T00:00:00",
        is_required: true
      }
    ];

    /* Uncomment when types are updated
    const { data, error } = await supabase
      .from('volunteer_training_materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
    */
  } catch (error) {
    console.error("Error fetching training materials:", error);
    return [];
  }
};

export const getTrainingProgress = async (volunteerId: string): Promise<VolunteerTrainingProgress[]> => {
  try {
    // Mock training progress
    return [
      {
        id: "1",
        volunteer_id: volunteerId,
        material_id: "1",
        status: "completed",
        started_at: "2025-04-01T00:00:00",
        completed_at: "2025-04-01T01:30:00",
        score: 95,
        material: {
          id: "1",
          title: "Volunteer Orientation",
          description: "Basic orientation for new volunteers",
          category: "Onboarding",
          content_type: "video",
          url: "https://example.com/orientation",
          created_at: "2025-03-01T00:00:00",
          updated_at: "2025-03-01T00:00:00",
          is_required: true
        }
      },
      {
        id: "2",
        volunteer_id: volunteerId,
        material_id: "2",
        status: "in_progress",
        started_at: "2025-04-05T00:00:00",
        material: {
          id: "2",
          title: "Safety Guidelines",
          description: "Important safety information for all volunteers",
          category: "Safety",
          content_type: "document",
          url: "https://example.com/safety",
          created_at: "2025-03-10T00:00:00",
          updated_at: "2025-03-10T00:00:00",
          is_required: true
        }
      }
    ];

    /* Uncomment when types are updated
    const { data, error } = await supabase
      .from('volunteer_training_progress')
      .select(`
        *,
        material:volunteer_training_materials(*)
      `)
      .eq('volunteer_id', volunteerId);
    
    if (error) throw error;
    
    return data || [];
    */
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
    // Mock successful update
    toast({
      title: `Training ${status === 'completed' ? 'completed' : 'in progress'}`,
      description: `Your training progress has been updated.`
    });
    
    return true;

    /* Uncomment when types are updated
    // Check if a record already exists
    const { data: existing, error: checkError } = await supabase
      .from('volunteer_training_progress')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .eq('material_id', materialId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    const now = new Date().toISOString();
    
    if (existing) {
      // Update existing record
      const updateData: any = { status };
      
      if (status === 'in_progress' && !existing.started_at) {
        updateData.started_at = now;
      }
      
      if (status === 'completed') {
        updateData.completed_at = now;
        if (score !== undefined) updateData.score = score;
      }
      
      const { error } = await supabase
        .from('volunteer_training_progress')
        .update(updateData)
        .eq('id', existing.id);
      
      if (error) throw error;
    } else {
      // Create new record
      const insertData: any = {
        volunteer_id: volunteerId,
        material_id: materialId,
        status
      };
      
      if (status === 'in_progress') {
        insertData.started_at = now;
      }
      
      if (status === 'completed') {
        insertData.started_at = now;
        insertData.completed_at = now;
        if (score !== undefined) insertData.score = score;
      }
      
      const { error } = await supabase
        .from('volunteer_training_progress')
        .insert(insertData);
      
      if (error) throw error;
    }
    
    toast({
      title: `Training ${status === 'completed' ? 'completed' : 'in progress'}`,
      description: `Your training progress has been updated.`
    });
    
    return true;
    */
  } catch (error: any) {
    console.error("Error updating training progress:", error);
    toast({
      variant: "destructive",
      title: "Failed to update training progress",
      description: error.message || "An unexpected error occurred."
    });
    return false;
  }
};

// Tasks
export const getVolunteerTasks = async (volunteerId: string): Promise<VolunteerTask[]> => {
  try {
    // Mock tasks
    return [
      {
        id: "1",
        volunteer_id: volunteerId,
        title: "Call New Beneficiary",
        description: "Make an introductory call to a new beneficiary to assess needs",
        status: "pending",
        priority: "high",
        due_date: "2025-04-20T00:00:00",
        created_at: "2025-04-10T00:00:00",
        updated_at: "2025-04-10T00:00:00",
        created_by: "staff-123",
        related_beneficiary_id: "benef-456",
        beneficiary: {
          id: "benef-456",
          full_name: "Maria Garcia"
        }
      },
      {
        id: "2",
        volunteer_id: volunteerId,
        title: "Complete Training",
        description: "Complete the required safety training module",
        status: "in_progress",
        priority: "medium",
        due_date: "2025-04-30T00:00:00",
        created_at: "2025-04-05T00:00:00",
        updated_at: "2025-04-15T00:00:00",
        created_by: "staff-123"
      }
    ];

    /* Uncomment when types are updated
    const { data, error } = await supabase
      .from('volunteer_tasks')
      .select(`
        *,
        beneficiary:beneficiary_users(id, full_name)
      `)
      .eq('volunteer_id', volunteerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
    */
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
    // Mock successful update
    toast({
      title: "Task updated",
      description: `Task status has been updated to ${status}.`
    });
    
    return true;

    /* Uncomment when types are updated
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
    */
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
    // Mock hours summary
    return {
      total: 35,
      monthly: 12,
      yearly: 35,
      details: [
        { month: "Apr 2025", hours: 12 },
        { month: "Mar 2025", hours: 15 },
        { month: "Feb 2025", hours: 8 },
        { month: "Jan 2025", hours: 0 },
        { month: "Dec 2024", hours: 0 },
        { month: "Nov 2024", hours: 0 },
        { month: "Oct 2024", hours: 0 },
        { month: "Sep 2024", hours: 0 },
        { month: "Aug 2024", hours: 0 },
        { month: "Jul 2024", hours: 0 },
        { month: "Jun 2024", hours: 0 },
        { month: "May 2024", hours: 0 }
      ]
    };

    /* Uncomment when types are updated
    // Get all completed registrations with hours
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select('hours_logged, completed_at')
      .eq('volunteer_id', volunteerId)
      .eq('status', 'completed')
      .not('hours_logged', 'is', null);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        total: 0,
        monthly: 0,
        yearly: 0,
        details: []
      };
    }
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Calculate totals
    let total = 0;
    let monthly = 0;
    let yearly = 0;
    
    // Organize hours by month
    const monthlyData: Record<string, number> = {};
    
    data.forEach(record => {
      const hours = Number(record.hours_logged) || 0;
      const completedDate = record.completed_at ? new Date(record.completed_at) : null;
      
      total += hours;
      
      if (completedDate) {
        // Add to monthly total if in current month
        if (completedDate >= firstDayOfMonth) {
          monthly += hours;
        }
        
        // Add to yearly total if in current year
        if (completedDate >= firstDayOfYear) {
          yearly += hours;
        }
        
        // Add to monthly breakdown
        const monthYear = completedDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += hours;
      }
    });
    
    // Create details array for the last 12 months
    const details = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
      details.push({
        month: monthYear,
        hours: monthlyData[monthYear] || 0
      });
    }
    
    return {
      total,
      monthly,
      yearly,
      details
    };
    */
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

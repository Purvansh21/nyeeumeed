
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

// Mock data for development until Supabase types are updated
const mockOpportunities: VolunteerOpportunity[] = [
  {
    id: "1",
    title: "Food Bank Assistant",
    description: "Help sort and distribute food to those in need",
    category: "Food Security",
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    start_time: new Date(Date.now() + 86400000 * 3 + 36000000).toISOString(), // 3 days + 10 hours
    end_time: new Date(Date.now() + 86400000 * 3 + 43200000).toISOString(), // 3 days + 12 hours
    location: "Community Center, 123 Main St",
    spots_available: 10,
    spots_filled: 6,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "After-school Mentor",
    description: "Mentor children in after-school programs, helping with homework and activities",
    category: "Education",
    date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    start_time: new Date(Date.now() + 86400000 * 5 + 54000000).toISOString(), // 5 days + 15 hours
    end_time: new Date(Date.now() + 86400000 * 5 + 61200000).toISOString(), // 5 days + 17 hours
    location: "Lincoln Elementary School",
    spots_available: 8,
    spots_filled: 7,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Community Garden Planting",
    description: "Help plant and maintain our community garden",
    category: "Environment",
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    start_time: new Date(Date.now() + 86400000 * 7 + 32400000).toISOString(), // 7 days + 9 hours
    end_time: new Date(Date.now() + 86400000 * 7 + 43200000).toISOString(), // 7 days + 12 hours
    location: "Green Street Garden",
    spots_available: 15,
    spots_filled: 15,
    status: "full",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    title: "Homeless Shelter Meal Service",
    description: "Prepare and serve meals at the downtown homeless shelter",
    category: "Food Security",
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    start_time: new Date(Date.now() + 86400000 * 2 + 61200000).toISOString(), // 2 days + 17 hours
    end_time: new Date(Date.now() + 86400000 * 2 + 68400000).toISOString(), // 2 days + 19 hours
    location: "Hope Shelter, 456 Park Avenue",
    spots_available: 12,
    spots_filled: 5,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "5",
    title: "Beach Cleanup",
    description: "Help clean up the local beach and protect marine wildlife",
    category: "Environment",
    date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
    start_time: new Date(Date.now() + 86400000 * 10 + 32400000).toISOString(), // 10 days + 9 hours
    end_time: new Date(Date.now() + 86400000 * 10 + 43200000).toISOString(), // 10 days + 12 hours
    location: "Sunshine Beach, Pier 3",
    spots_available: 20,
    spots_filled: 8,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockRegistrations: VolunteerRegistration[] = [
  {
    id: "101",
    volunteer_id: "volunteer-1",
    opportunity_id: "1",
    status: "registered",
    registered_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    opportunity: mockOpportunities[0]
  },
  {
    id: "102",
    volunteer_id: "volunteer-1",
    opportunity_id: "3",
    status: "registered",
    registered_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    opportunity: mockOpportunities[2]
  }
];

// Opportunities
export const getVolunteerOpportunities = async (): Promise<VolunteerOpportunity[]> => {
  try {
    // When the Supabase types are updated, uncomment this code
    // const { data, error } = await supabase
    //   .from('volunteer_opportunities')
    //   .select('*')
    //   .order('date', { ascending: true });
      
    // if (error) throw error;
    
    // return data || [];
    
    // Using mock data for now
    return mockOpportunities;
  } catch (error) {
    console.error("Error fetching volunteer opportunities:", error);
    return [];
  }
};

export const getVolunteerOpportunity = async (id: string): Promise<VolunteerOpportunity | null> => {
  try {
    // When the Supabase types are updated, uncomment this code
    // const { data, error } = await supabase
    //   .from('volunteer_opportunities')
    //   .select('*')
    //   .eq('id', id)
    //   .single();
      
    // if (error) throw error;
    
    // return data;
    
    // Using mock data for now
    return mockOpportunities.find(opp => opp.id === id) || null;
  } catch (error) {
    console.error(`Error fetching volunteer opportunity with ID ${id}:`, error);
    return null;
  }
};

// Registrations
export const getVolunteerRegistrations = async (volunteerId: string): Promise<VolunteerRegistration[]> => {
  try {
    // When the Supabase types are updated, uncomment this code
    // const { data, error } = await supabase
    //   .from('volunteer_registrations')
    //   .select(`
    //     *,
    //     opportunity:volunteer_opportunities(*)
    //   `)
    //   .eq('volunteer_id', volunteerId)
    //   .order('registered_at', { ascending: false });
      
    // if (error) throw error;
    
    // return data || [];
    
    // Using mock data for now
    return mockRegistrations.filter(reg => reg.volunteer_id === volunteerId);
  } catch (error) {
    console.error("Error fetching volunteer registrations:", error);
    return [];
  }
};

export const registerForOpportunity = async (opportunityId: string, volunteerId: string): Promise<boolean> => {
  try {
    // In mock data mode, we'll just simulate the registration
    const opportunity = mockOpportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity || opportunity.spots_filled >= opportunity.spots_available) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "This opportunity is already full."
      });
      return false;
    }
    
    if (mockRegistrations.some(reg => reg.volunteer_id === volunteerId && reg.opportunity_id === opportunityId)) {
      toast({
        variant: "destructive",
        title: "Already registered",
        description: "You are already registered for this opportunity."
      });
      return false;
    }
    
    // Add to mock registrations
    const newRegistration = {
      id: `${Date.now()}`,
      volunteer_id: volunteerId,
      opportunity_id: opportunityId,
      status: 'registered' as const,
      registered_at: new Date().toISOString(),
      opportunity: opportunity
    };
    
    mockRegistrations.push(newRegistration);
    
    // Update the opportunity
    opportunity.spots_filled += 1;
    if (opportunity.spots_filled >= opportunity.spots_available) {
      opportunity.status = 'full';
    }
    
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
    // In mock data mode, we'll just simulate the cancellation
    const registrationIndex = mockRegistrations.findIndex(reg => reg.id === registrationId);
    
    if (registrationIndex >= 0) {
      mockRegistrations[registrationIndex].status = 'cancelled';
      
      // Update the opportunity
      const opportunity = mockOpportunities.find(opp => opp.id === opportunityId);
      if (opportunity) {
        opportunity.spots_filled = Math.max(0, opportunity.spots_filled - 1);
        opportunity.status = 'active';
      }
      
      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled."
      });
      
      return true;
    }
    
    return false;
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
    // In mock data mode, we'll just simulate logging hours
    const registration = mockRegistrations.find(reg => reg.id === registrationId);
    
    if (registration) {
      registration.status = 'completed';
      registration.hours_logged = hours;
      registration.completed_at = new Date().toISOString();
      registration.feedback = feedback;
      
      toast({
        title: "Hours logged successfully",
        description: "Your volunteer hours have been recorded."
      });
      
      return true;
    }
    
    return false;
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
    // Mock achievements for now
    return [
      {
        id: "a1",
        volunteer_id: volunteerId,
        title: "First Time Volunteer",
        description: "Completed your first volunteer activity",
        badge_name: "first_time",
        date_earned: new Date(Date.now() - 86400000 * 30).toISOString(),
        category: "Milestone",
        points: 10
      },
      {
        id: "a2",
        volunteer_id: volunteerId,
        title: "Environmental Champion",
        description: "Participated in 3 environmental volunteer activities",
        badge_name: "eco_warrior",
        date_earned: new Date(Date.now() - 86400000 * 15).toISOString(),
        category: "Specialization",
        points: 25
      }
    ];
  } catch (error) {
    console.error("Error fetching volunteer achievements:", error);
    return [];
  }
};

// Training
export const getTrainingMaterials = async (): Promise<VolunteerTrainingMaterial[]> => {
  try {
    // Mock training materials for now
    return [
      {
        id: "t1",
        title: "Volunteer Orientation",
        description: "Introduction to volunteering with our organization",
        category: "Onboarding",
        content_type: "video",
        url: "https://example.com/orientation",
        created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        is_required: true
      },
      {
        id: "t2",
        title: "Food Safety Basics",
        description: "Learn the basics of food safety for kitchen volunteering",
        category: "Food Services",
        content_type: "document",
        url: "https://example.com/food-safety",
        created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 45).toISOString(),
        is_required: false
      }
    ];
  } catch (error) {
    console.error("Error fetching training materials:", error);
    return [];
  }
};

export const getTrainingProgress = async (volunteerId: string): Promise<VolunteerTrainingProgress[]> => {
  try {
    // Mock training progress for now
    const materials = await getTrainingMaterials();
    
    return [
      {
        id: "p1",
        volunteer_id: volunteerId,
        material_id: "t1",
        status: "completed",
        started_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        completed_at: new Date(Date.now() - 86400000 * 19).toISOString(),
        score: 95,
        material: materials[0]
      },
      {
        id: "p2",
        volunteer_id: volunteerId,
        material_id: "t2",
        status: "in_progress",
        started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        material: materials[1]
      }
    ];
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
  // Just return success for mock implementation
  toast({
    title: `Training ${status === 'completed' ? 'completed' : 'in progress'}`,
    description: `Your training progress has been updated.`
  });
  
  return true;
};

// Tasks
export const getVolunteerTasks = async (volunteerId: string): Promise<VolunteerTask[]> => {
  try {
    // Mock tasks for now
    return [
      {
        id: "task1",
        volunteer_id: volunteerId,
        title: "Call new beneficiary",
        description: "Reach out to new beneficiary John Smith to explain our programs",
        status: "pending",
        priority: "high",
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        related_beneficiary_id: "beneficiary-1",
        beneficiary: {
          id: "beneficiary-1",
          full_name: "John Smith"
        }
      },
      {
        id: "task2",
        volunteer_id: volunteerId,
        title: "Complete training report",
        description: "Submit your report on the volunteer training session from last week",
        status: "in_progress",
        priority: "medium",
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
  } catch (error) {
    console.error("Error fetching volunteer tasks:", error);
    return [];
  }
};

export const updateTaskStatus = async (
  taskId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): Promise<boolean> => {
  // Just return success for mock implementation
  toast({
    title: "Task updated",
    description: `Task status has been updated to ${status}.`
  });
  
  return true;
};

// Hours summary
export const getVolunteerHoursSummary = async (volunteerId: string): Promise<VolunteerHours> => {
  try {
    // Mock data for hours summary
    return {
      total: 45.5,
      monthly: 12.5,
      yearly: 45.5,
      details: [
        { month: "Apr 2025", hours: 12.5 },
        { month: "Mar 2025", hours: 15.0 },
        { month: "Feb 2025", hours: 10.0 },
        { month: "Jan 2025", hours: 8.0 },
        { month: "Dec 2024", hours: 0.0 },
        { month: "Nov 2024", hours: 0.0 },
        { month: "Oct 2024", hours: 0.0 },
        { month: "Sep 2024", hours: 0.0 },
        { month: "Aug 2024", hours: 0.0 },
        { month: "Jul 2024", hours: 0.0 },
        { month: "Jun 2024", hours: 0.0 },
        { month: "May 2024", hours: 0.0 }
      ]
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

import { supabase } from "@/integrations/supabase/client";
import { 
  VolunteerOpportunity, 
  VolunteerRegistration,
  VolunteerHours
} from "@/types/volunteer";
import { useToast } from "@/hooks/use-toast";

// Mock data for development
const MOCK_VOLUNTEER_REGISTRATIONS: VolunteerRegistration[] = [
  {
    id: "1",
    volunteer_id: "user-1",
    opportunity_id: "opp-1",
    status: "registered",
    registered_at: "2025-04-01T10:00:00Z",
    opportunity: {
      id: "opp-1",
      title: "Food Distribution",
      description: "Help distribute food to families in need",
      category: "Food Support",
      date: "2025-04-20",
      start_time: "2025-04-20T10:00:00Z",
      end_time: "2025-04-20T14:00:00Z",
      location: "Community Center",
      spots_available: 10,
      spots_filled: 5,
      status: "active",
      created_at: "2025-03-15T00:00:00Z",
      updated_at: "2025-03-15T00:00:00Z"
    }
  },
  {
    id: "2",
    volunteer_id: "user-1",
    opportunity_id: "opp-2",
    status: "completed",
    registered_at: "2025-03-15T10:00:00Z",
    completed_at: "2025-03-15T15:00:00Z",
    hours_logged: 5,
    opportunity: {
      id: "opp-2",
      title: "Elderly Care Visitation",
      description: "Visit elderly residents at care homes",
      category: "Elder Care",
      date: "2025-03-15",
      start_time: "2025-03-15T10:00:00Z",
      end_time: "2025-03-15T15:00:00Z",
      location: "Sunset Care Home",
      spots_available: 8,
      spots_filled: 8,
      status: "completed",
      created_at: "2025-03-01T00:00:00Z",
      updated_at: "2025-03-01T00:00:00Z"
    }
  }
];

const MOCK_HOURS: VolunteerHours = {
  total: 43,
  monthly: 12,
  yearly: 43,
  details: [
    { month: "Jan", hours: 8 },
    { month: "Feb", hours: 15 },
    { month: "Mar", hours: 20 },
    { month: "Apr", hours: 0 }
  ]
};

/**
 * Fetch volunteer opportunities from the database
 */
export const getVolunteerOpportunities = async (): Promise<VolunteerOpportunity[]> => {
  try {
    console.log("Fetching opportunities...");
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*');
    
    if (error) {
      console.error("Error fetching opportunities:", error);
      throw error;
    }
    
    // Ensure the data matches the VolunteerOpportunity type
    const typedData: VolunteerOpportunity[] = data.map(item => ({
      ...item,
      // Cast the status to the specific type expected by VolunteerOpportunity
      status: item.status as "active" | "cancelled" | "completed" | "full"
    }));
    
    console.log("Opportunities fetched:", typedData);
    return typedData;
  } catch (error) {
    console.error("Failed to fetch volunteer opportunities:", error);
    return [];
  }
};

/**
 * Create a new volunteer opportunity
 */
export const createVolunteerOpportunity = async (
  opportunity: Omit<VolunteerOpportunity, "id" | "created_at" | "updated_at" | "spots_filled">
): Promise<VolunteerOpportunity | null> => {
  try {
    console.log("Creating opportunity:", opportunity);
    
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .insert({
        title: opportunity.title,
        description: opportunity.description,
        category: opportunity.category,
        date: opportunity.date,
        start_time: opportunity.start_time,
        end_time: opportunity.end_time,
        location: opportunity.location,
        spots_available: opportunity.spots_available,
        spots_filled: 0,
        status: opportunity.status,
        created_by: opportunity.created_by
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating opportunity:", error);
      throw error;
    }
    
    console.log("Opportunity created:", data);
    
    // Ensure the data matches the VolunteerOpportunity type
    const typedData: VolunteerOpportunity = {
      ...data,
      // Cast the status to the specific type expected by VolunteerOpportunity
      status: data.status as "active" | "cancelled" | "completed" | "full"
    };
    
    return typedData;
  } catch (error) {
    console.error("Failed to create volunteer opportunity:", error);
    return null;
  }
};

/**
 * Fetch volunteer registrations for a specific volunteer
 */
export const getVolunteerRegistrations = async (volunteerId: string): Promise<VolunteerRegistration[]> => {
  try {
    console.log("Fetching volunteer registrations for:", volunteerId);
    
    // Fetch registrations from the database
    const { data: registrations, error: regError } = await supabase
      .from('volunteer_registrations')
      .select('*')
      .eq('volunteer_id', volunteerId);
    
    if (regError) {
      console.error("Error fetching registrations:", regError);
      throw regError;
    }
    
    // Get all opportunity IDs from the registrations
    const opportunityIds = registrations.map(reg => reg.opportunity_id);
    
    // If there are no registrations, return empty array
    if (opportunityIds.length === 0) {
      console.log("No registrations found for this volunteer");
      return [];
    }
    
    // Fetch the corresponding opportunities
    const { data: opportunities, error: oppError } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .in('id', opportunityIds);
    
    if (oppError) {
      console.error("Error fetching opportunities for registrations:", oppError);
      throw oppError;
    }
    
    // Map opportunities to their corresponding registrations
    const registrationsWithOpportunities: VolunteerRegistration[] = registrations.map(reg => {
      const opportunity = opportunities.find(opp => opp.id === reg.opportunity_id);
      
      return {
        ...reg,
        opportunity: opportunity ? {
          ...opportunity,
          status: opportunity.status as "active" | "cancelled" | "completed" | "full"
        } : undefined
      };
    });
    
    console.log("Fetched volunteer registrations:", registrationsWithOpportunities);
    return registrationsWithOpportunities;
  } catch (error) {
    console.error("Failed to fetch volunteer registrations:", error);
    // Return mock data for now to prevent crashing in case of error
    return MOCK_VOLUNTEER_REGISTRATIONS.filter(reg => reg.volunteer_id === volunteerId);
  }
};

/**
 * Cancel a volunteer registration
 */
export const cancelRegistration = async (registrationId: string, opportunityId: string): Promise<boolean> => {
  try {
    console.log(`Cancelling registration ${registrationId} for opportunity ${opportunityId}`);
    
    // Update the registration status to cancelled
    const { error: regError } = await supabase
      .from('volunteer_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);
    
    if (regError) {
      console.error("Error cancelling registration:", regError);
      throw regError;
    }
    
    // Decrement the spots_filled count in the opportunity
    const { error: oppError } = await supabase
      .from('volunteer_opportunities')
      .update({ 
        spots_filled: supabase.rpc('decrement_counter', { row_id: opportunityId, table_name: 'volunteer_opportunities', column_name: 'spots_filled' })
      })
      .eq('id', opportunityId);
    
    if (oppError) {
      console.error("Error updating opportunity spots after cancellation:", oppError);
      // Don't throw here, since the registration was already cancelled
    }
    
    console.log(`Successfully cancelled registration ${registrationId}`);
    return true;
  } catch (error) {
    console.error("Failed to cancel registration:", error);
    return false;
  }
};

/**
 * Log volunteer hours for a completed opportunity
 */
export const logVolunteerHours = async (
  registrationId: string,
  hours: number,
  notes?: string
): Promise<boolean> => {
  try {
    console.log(`Logging ${hours} hours for registration ${registrationId}`);
    
    const { error } = await supabase
      .from('volunteer_registrations')
      .update({ 
        status: 'completed',
        hours_logged: hours,
        completed_at: new Date().toISOString(),
        feedback: notes || null
      })
      .eq('id', registrationId);
    
    if (error) {
      console.error("Error logging volunteer hours:", error);
      throw error;
    }
    
    console.log(`Successfully logged ${hours} hours for registration ${registrationId}`);
    return true;
  } catch (error) {
    console.error("Failed to log volunteer hours:", error);
    return false;
  }
};

/**
 * Get summary of volunteer hours
 */
export const getVolunteerHoursSummary = async (volunteerId: string): Promise<VolunteerHours> => {
  try {
    console.log("Fetching hours summary for volunteer:", volunteerId);
    
    // Fetch all completed registrations with hours logged
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select('hours_logged, completed_at')
      .eq('volunteer_id', volunteerId)
      .eq('status', 'completed')
      .not('hours_logged', 'is', null);
    
    if (error) {
      console.error("Error fetching volunteer hours:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No hours logged for this volunteer");
      return { total: 0, monthly: 0, yearly: 0, details: [] };
    }
    
    // Calculate totals
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let total = 0;
    let monthly = 0;
    let yearly = 0;
    
    // Initialize monthly breakdown
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyBreakdown: {[key: string]: number} = {};
    monthNames.forEach(month => monthlyBreakdown[month] = 0);
    
    // Aggregate hours
    data.forEach(record => {
      const hours = Number(record.hours_logged);
      const completedDate = record.completed_at ? new Date(record.completed_at) : null;
      
      if (isNaN(hours)) return;
      
      total += hours;
      
      if (completedDate) {
        // Add to yearly sum if from current year
        if (completedDate.getFullYear() === currentYear) {
          yearly += hours;
          
          // Add to monthly sum if from current month
          if (completedDate.getMonth() === currentMonth) {
            monthly += hours;
          }
          
          // Add to monthly breakdown
          const monthName = monthNames[completedDate.getMonth()];
          monthlyBreakdown[monthName] += hours;
        }
      }
    });
    
    // Convert monthly breakdown to details array
    const details = Object.keys(monthlyBreakdown).map(month => ({
      month,
      hours: monthlyBreakdown[month]
    }));
    
    const hoursSummary: VolunteerHours = {
      total,
      monthly,
      yearly,
      details
    };
    
    console.log("Volunteer hours summary:", hoursSummary);
    return hoursSummary;
  } catch (error) {
    console.error("Failed to get volunteer hours summary:", error);
    // Return mock data for now to prevent crashing
    return MOCK_HOURS;
  }
};

/**
 * Register for a volunteer opportunity
 */
export const registerForOpportunity = async (
  volunteerId: string,
  opportunityId: string
): Promise<boolean> => {
  try {
    console.log(`Registering volunteer ${volunteerId} for opportunity ${opportunityId}`);
    
    // First, check if there's available spots
    const { data: opportunity, error: fetchError } = await supabase
      .from('volunteer_opportunities')
      .select('spots_available, spots_filled, status')
      .eq('id', opportunityId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching opportunity:", fetchError);
      throw fetchError;
    }
    
    if (!opportunity) {
      console.error("Opportunity not found");
      return false;
    }
    
    if (opportunity.status !== 'active') {
      console.error("Cannot register for a non-active opportunity");
      return false;
    }
    
    if (opportunity.spots_filled >= opportunity.spots_available) {
      console.error("No spots available for this opportunity");
      return false;
    }
    
    // Create the registration
    const { data: registration, error: regError } = await supabase
      .from('volunteer_registrations')
      .insert({
        volunteer_id: volunteerId,
        opportunity_id: opportunityId,
        status: 'registered',
        registered_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (regError) {
      console.error("Error creating registration:", regError);
      throw regError;
    }
    
    // Increment the spots_filled count
    const { error: updateError } = await supabase
      .from('volunteer_opportunities')
      .update({ 
        spots_filled: opportunity.spots_filled + 1,
        // Set status to full if this registration fills the last spot
        status: opportunity.spots_filled + 1 >= opportunity.spots_available ? 'full' : 'active'
      })
      .eq('id', opportunityId);
    
    if (updateError) {
      console.error("Error updating opportunity spots:", updateError);
      // Don't throw, since the registration was already created
    }
    
    console.log(`Successfully registered volunteer ${volunteerId} for opportunity ${opportunityId}`);
    return true;
  } catch (error) {
    console.error("Failed to register for opportunity:", error);
    return false;
  }
};

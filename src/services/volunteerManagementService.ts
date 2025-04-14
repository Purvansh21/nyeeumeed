
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { VolunteerShift } from "@/types/staff";
import { User } from "@/types/auth";
import { validateShiftStatus } from "./utils/validationUtils";

// Volunteer Management
export async function fetchVolunteers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('volunteer_users')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    
    // Transform the data to match the User type
    return (data || []).map(v => ({
      id: v.id,
      fullName: v.full_name,
      email: v.email,
      role: 'volunteer',
      isActive: v.is_active,
      createdAt: v.created_at,
      lastLoginAt: v.last_login_at,
      contactInfo: v.contact_info,
      additionalInfo: {
        skills: v.skills,
        availability: v.availability
      }
    }));
  } catch (error: any) {
    console.error("Error fetching volunteers:", error.message);
    return [];
  }
}

export async function fetchVolunteerShifts(): Promise<VolunteerShift[]> {
  try {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .select(`
        *,
        volunteer:volunteer_users(id, full_name, contact_info, skills)
      `)
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    
    // Ensure the status is always one of the allowed types
    return (data || []).map(shift => ({
      ...shift,
      status: validateShiftStatus(shift.status)
    })) as VolunteerShift[];
  } catch (error: any) {
    console.error("Error fetching volunteer shifts:", error.message);
    return [];
  }
}

export async function createVolunteerShift(shift: Omit<VolunteerShift, 'id' | 'created_at' | 'updated_at'>): Promise<VolunteerShift | null> {
  try {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .insert(shift)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Volunteer shift created successfully"
    });
    
    return {
      ...data,
      status: validateShiftStatus(data.status)
    } as VolunteerShift;
  } catch (error: any) {
    console.error("Error creating volunteer shift:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create volunteer shift"
    });
    return null;
  }
}

export async function updateVolunteerShift(id: string, shift: Partial<VolunteerShift>): Promise<VolunteerShift | null> {
  try {
    const { data, error } = await supabase
      .from('volunteer_shifts')
      .update(shift)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Volunteer shift updated successfully"
    });
    
    return {
      ...data,
      status: validateShiftStatus(data.status)
    } as VolunteerShift;
  } catch (error: any) {
    console.error("Error updating volunteer shift:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update volunteer shift"
    });
    return null;
  }
}

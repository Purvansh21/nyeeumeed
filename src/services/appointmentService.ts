
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/staff";
import { validateAppointmentStatus } from "./utils/validationUtils";

// Appointments Management
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        beneficiary:beneficiary_users!beneficiary_id(id, full_name, contact_info),
        staff:staff_users!staff_id(id, full_name)
      `)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data to match our expected types
    return (data || []).map(appointment => {
      // Create a base appointment without relations
      const transformedAppointment: Appointment = {
        id: appointment.id,
        beneficiary_id: appointment.beneficiary_id,
        staff_id: appointment.staff_id,
        title: appointment.title,
        appointment_type: appointment.appointment_type,
        date: appointment.date,
        time_slot: appointment.time_slot,
        location: appointment.location,
        is_virtual: appointment.is_virtual,
        notes: appointment.notes,
        status: validateAppointmentStatus(appointment.status),
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
      };
      
      // Add the beneficiary relation if it exists and is a valid object
      if (appointment.beneficiary && 
          typeof appointment.beneficiary === 'object' && 
          appointment.beneficiary !== null) {
        
        // Use a type assertion for beneficiary to help TypeScript understand the structure
        const beneficiary = appointment.beneficiary as {
          id: string;
          full_name: string;
          contact_info: string | null;
        };
        
        transformedAppointment.beneficiary = {
          id: beneficiary.id,
          full_name: beneficiary.full_name,
          contact_info: beneficiary.contact_info
        };
      }
      
      // Add the staff relation if it exists and is a valid object
      if (appointment.staff && 
          typeof appointment.staff === 'object' && 
          appointment.staff !== null) {
        
        // Use a type assertion for staff to help TypeScript understand the structure
        const staff = appointment.staff as {
          id: string;
          full_name: string;
        };
        
        transformedAppointment.staff = {
          id: staff.id,
          full_name: staff.full_name
        };
      }
      
      return transformedAppointment;
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error.message);
    return [];
  }
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Appointment updated successfully"
    });
    
    // Create a properly typed appointment object
    const transformedAppointment: Appointment = {
      id: data.id,
      beneficiary_id: data.beneficiary_id,
      staff_id: data.staff_id,
      title: data.title,
      appointment_type: data.appointment_type,
      date: data.date,
      time_slot: data.time_slot,
      location: data.location,
      is_virtual: data.is_virtual,
      notes: data.notes,
      status: validateAppointmentStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return transformedAppointment;
  } catch (error: any) {
    console.error("Error updating appointment:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update appointment"
    });
    return null;
  }
}


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/staff";
import { validateAppointmentStatus } from "./utils/validationUtils";

// Appointments Management
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    // Use basic select without trying to use relationship syntax
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Fetch related beneficiary and staff data separately if needed
    const appointments = await Promise.all((data || []).map(async (appointment) => {
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
      
      // If beneficiary_id exists, fetch beneficiary data
      if (appointment.beneficiary_id) {
        const { data: beneficiaryData } = await supabase
          .from('beneficiary_users')
          .select('id, full_name, contact_info')
          .eq('id', appointment.beneficiary_id)
          .maybeSingle();
          
        if (beneficiaryData) {
          transformedAppointment.beneficiary = {
            id: beneficiaryData.id,
            full_name: beneficiaryData.full_name,
            contact_info: beneficiaryData.contact_info
          };
        }
      }
      
      // If staff_id exists, fetch staff data
      if (appointment.staff_id) {
        const { data: staffData } = await supabase
          .from('staff_users')
          .select('id, full_name')
          .eq('id', appointment.staff_id)
          .maybeSingle();
          
        if (staffData) {
          transformedAppointment.staff = {
            id: staffData.id,
            full_name: staffData.full_name
          };
        }
      }
      
      return transformedAppointment;
    }));
    
    return appointments;
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

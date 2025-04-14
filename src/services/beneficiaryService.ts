import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Service Request Types
export interface ServiceRequest {
  id: string;
  beneficiary_id: string;
  service_type: string;
  description: string | null;
  urgency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  next_step: string | null;
  assigned_staff: string | null;
  preferred_contact_method: string | null;
  verification_status?: 'unverified' | 'verified' | 'rejected' | null;
  verification_notes?: string | null;
  verification_date?: string | null;
  verified_by?: string | null;
  staff?: {
    full_name: string;
  } | null;
}

export interface NewServiceRequest {
  service_type: string;
  description?: string;
  urgency: string;
  preferred_contact_method?: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  beneficiary_id: string;
  title: string;
  appointment_type: string;
  date: string;
  time_slot: string;
  location: string | null;
  staff_id: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  is_virtual: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    full_name: string;
  } | null;
}

export interface NewAppointment {
  title: string;
  appointment_type: string;
  date: string;
  time_slot: string;
  location?: string;
  is_virtual: boolean;
  notes?: string;
}

// Service History Types
export interface ServiceHistory {
  id: string;
  beneficiary_id: string;
  service_type: string;
  description: string | null;
  delivery_date: string;
  status: string;
  staff_id: string | null;
  notes: string | null;
  created_at: string;
  staff?: {
    full_name: string;
  } | null;
}

// Resource Types
export interface BeneficiaryResource {
  id: string;
  beneficiary_id: string;
  resource_id: string | null;
  title: string;
  category: string;
  description: string | null;
  url: string | null;
  accessed_at: string;
  created_at: string;
}

// Service Requests
export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const requests = await Promise.all((data || []).map(async (request) => {
      const transformedRequest: ServiceRequest = {
        id: request.id,
        beneficiary_id: request.beneficiary_id,
        service_type: request.service_type,
        description: request.description,
        urgency: request.urgency,
        status: request.status,
        preferred_contact_method: request.preferred_contact_method,
        assigned_staff: request.assigned_staff,
        next_step: request.next_step,
        created_at: request.created_at,
        updated_at: request.updated_at,
      };
      
      if (request.beneficiary_id) {
        const { data: beneficiaryData } = await supabase
          .from('beneficiary_users')
          .select('id, full_name, contact_info')
          .eq('id', request.beneficiary_id)
          .maybeSingle();
          
        if (beneficiaryData) {
          transformedRequest.beneficiary = {
            id: beneficiaryData.id,
            full_name: beneficiaryData.full_name,
            contact_info: beneficiaryData.contact_info
          };
        }
      }
      
      if (request.assigned_staff) {
        const { data: staffData } = await supabase
          .from('staff_users')
          .select('id, full_name')
          .eq('id', request.assigned_staff)
          .maybeSingle();
          
        if (staffData) {
          transformedRequest.staff = {
            id: staffData.id,
            full_name: staffData.full_name
          };
        }
      }
      
      return transformedRequest;
    }));
    
    return requests;
  } catch (error: any) {
    console.error("Error fetching service requests:", error.message);
    return [];
  }
}

export async function createServiceRequest(request: NewServiceRequest): Promise<ServiceRequest | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        beneficiary_id: userData.user.id,
        service_type: request.service_type,
        description: request.description || null,
        urgency: request.urgency,
        preferred_contact_method: request.preferred_contact_method || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Your service request has been submitted"
    });
    
    return data as unknown as ServiceRequest;
  } catch (error: any) {
    console.error("Error creating service request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to submit service request"
    });
    return null;
  }
}

export async function updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Service request updated successfully"
    });
    
    return data as unknown as ServiceRequest;
  } catch (error: any) {
    console.error("Error updating service request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update service request"
    });
    return null;
  }
}

// New function to fetch urgent service requests
export async function fetchUrgentServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        staff:assigned_staff(full_name)
      `)
      .eq('urgency', 'high')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []) as unknown as ServiceRequest[];
  } catch (error: any) {
    console.error("Error fetching urgent service requests:", error.message);
    return [];
  }
}

// New function to verify an urgent service request
export async function verifyServiceRequest(
  id: string, 
  verification: { 
    verification_status: 'verified' | 'rejected',
    verification_notes?: string,
    verified_by: string
  }
): Promise<ServiceRequest | null> {
  try {
    const updates = {
      ...verification,
      verification_date: new Date().toISOString(),
      status: verification.verification_status === 'verified' ? 'approved' : 'pending'
    };

    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: `Service request ${verification.verification_status === 'verified' ? 'verified' : 'rejected'} successfully`
    });
    
    return data as unknown as ServiceRequest;
  } catch (error: any) {
    console.error("Error verifying service request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to verify service request"
    });
    return null;
  }
}

// Appointments
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    const appointments = await Promise.all((data || []).map(async (appointment) => {
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
        status: appointment.status,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
      };
      
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

export async function createAppointment(appointment: NewAppointment): Promise<Appointment | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        beneficiary_id: userData.user.id,
        title: appointment.title,
        appointment_type: appointment.appointment_type,
        date: appointment.date,
        time_slot: appointment.time_slot,
        location: appointment.location || null,
        is_virtual: appointment.is_virtual,
        notes: appointment.notes || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Your appointment has been scheduled"
    });
    
    return data as unknown as Appointment;
  } catch (error: any) {
    console.error("Error creating appointment:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to schedule appointment"
    });
    return null;
  }
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Appointment updated successfully"
    });
    
    return data as unknown as Appointment;
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

// Service History
export async function fetchServiceHistory(): Promise<ServiceHistory[]> {
  try {
    const { data, error } = await supabase
      .from('service_history')
      .select(`
        *,
        staff:staff_id(full_name)
      `)
      .order('delivery_date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []) as unknown as ServiceHistory[];
  } catch (error: any) {
    console.error("Error fetching service history:", error.message);
    return [];
  }
}

// Resources
export async function fetchBeneficiaryResources(): Promise<BeneficiaryResource[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_resources')
      .select('*')
      .order('accessed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching beneficiary resources:", error.message);
    return [];
  }
}

export async function recordResourceAccess(resource: {
  title: string;
  category: string;
  description?: string;
  url?: string;
  resource_id?: string;
}): Promise<BeneficiaryResource | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('beneficiary_resources')
      .insert({
        beneficiary_id: userData.user.id,
        resource_id: resource.resource_id || null,
        title: resource.title,
        category: resource.category,
        description: resource.description || null,
        url: resource.url || null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error recording resource access:", error.message);
    return null;
  }
}

// Dashboard Stats
export async function fetchBeneficiaryDashboardStats() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    
    const { count: activeServices, error: activeServicesError } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('beneficiary_id', userId)
      .in('status', ['pending', 'approved']);
    
    if (activeServicesError) throw activeServicesError;
    
    const { count: upcomingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('beneficiary_id', userId)
      .eq('status', 'scheduled')
      .gte('date', new Date().toISOString().split('T')[0]);
    
    if (appointmentsError) throw appointmentsError;
    
    const { count: completedServices, error: completedServicesError } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('beneficiary_id', userId)
      .eq('status', 'completed');
    
    if (completedServicesError) throw completedServicesError;
    
    const { count: pendingRequests, error: pendingRequestsError } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('beneficiary_id', userId)
      .eq('status', 'pending');
    
    if (pendingRequestsError) throw pendingRequestsError;
    
    return {
      activeServices,
      upcomingAppointments,
      completedServices,
      pendingRequests
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error.message);
    return {
      activeServices: 0,
      upcomingAppointments: 0,
      completedServices: 0,
      pendingRequests: 0
    };
  }
}


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ServiceRequest } from "@/types/staff";
import { validateServiceRequestStatus, validateServiceRequestUrgency } from "./utils/validationUtils";

// Service Requests Management
export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  try {
    // Query the database with corrected relationships
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        beneficiary:beneficiary_id(id, full_name, contact_info),
        staff:assigned_staff(id, full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our expected types
    return (data || []).map(request => {
      // Create a base request without relations
      const transformedRequest: ServiceRequest = {
        id: request.id,
        beneficiary_id: request.beneficiary_id,
        service_type: request.service_type,
        description: request.description,
        urgency: validateServiceRequestUrgency(request.urgency),
        status: validateServiceRequestStatus(request.status),
        preferred_contact_method: request.preferred_contact_method,
        assigned_staff: request.assigned_staff,
        next_step: request.next_step,
        created_at: request.created_at,
        updated_at: request.updated_at,
      };
      
      // Add the beneficiary relation if it exists and is a valid object
      if (request.beneficiary && 
          typeof request.beneficiary === 'object' && 
          request.beneficiary !== null) {
        
        // Use a type assertion for beneficiary to help TypeScript understand the structure
        const beneficiary = request.beneficiary as {
          id: string;
          full_name: string;
          contact_info: string | null;
        };
        
        transformedRequest.beneficiary = {
          id: beneficiary.id,
          full_name: beneficiary.full_name,
          contact_info: beneficiary.contact_info
        };
      }
      
      // Add the staff relation if it exists and is a valid object
      if (request.staff && 
          typeof request.staff === 'object' && 
          request.staff !== null) {
        
        // Use a type assertion for staff to help TypeScript understand the structure
        const staff = request.staff as {
          id: string;
          full_name: string;
        };
        
        transformedRequest.staff = {
          id: staff.id,
          full_name: staff.full_name
        };
      }
      
      return transformedRequest;
    });
  } catch (error: any) {
    console.error("Error fetching service requests:", error.message);
    return [];
  }
}

export async function updateServiceRequest(id: string, request: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update(request)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Service request updated successfully"
    });
    
    // Create a properly typed service request object
    const transformedRequest: ServiceRequest = {
      id: data.id,
      beneficiary_id: data.beneficiary_id,
      service_type: data.service_type,
      description: data.description,
      urgency: validateServiceRequestUrgency(data.urgency),
      status: validateServiceRequestStatus(data.status),
      preferred_contact_method: data.preferred_contact_method,
      assigned_staff: data.assigned_staff,
      next_step: data.next_step,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return transformedRequest;
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

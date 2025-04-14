
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ServiceRequest } from "@/types/staff";
import { validateServiceRequestStatus, validateServiceRequestUrgency } from "./utils/validationUtils";

// Service Requests Management
export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  try {
    // Use basic select without trying to use relationship syntax
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Fetch related beneficiary and staff data separately if needed
    const requests = await Promise.all((data || []).map(async (request) => {
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
      
      // If beneficiary_id exists, fetch beneficiary data
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
      
      // If assigned_staff exists, fetch staff data
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

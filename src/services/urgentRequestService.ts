
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ServiceRequest } from "./beneficiaryService";

export interface UrgentRequest {
  id: string;
  service_request_id: string;
  created_at: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'high' | 'critical';
  response_needed_by: string | null;
  response_notes: string | null;
  responded_by: string | null;
  responded_at: string | null;
  verification_status: 'unverified' | 'verified' | 'rejected' | null;
  verification_notes: string | null;
  verification_date: string | null;
  verified_by: string | null;
  service_request?: ServiceRequest;
}

// Fetch urgent requests from the dedicated table
export async function fetchUrgentRequests(): Promise<UrgentRequest[]> {
  try {
    const { data, error } = await supabase
      .from('urgent_requests')
      .select(`
        *,
        service_request:service_requests(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to the expected format
    const urgentRequests = data?.map(item => ({
      ...item,
      service_request: item.service_request as unknown as ServiceRequest
    })) || [];

    return urgentRequests as UrgentRequest[];
  } catch (error: any) {
    console.error("Error fetching urgent requests:", error.message);
    return [];
  }
}

// Create a new urgent request entry
export async function createUrgentRequest(
  serviceRequestId: string,
  priority: 'high' | 'critical' = 'high',
  responseNeededBy?: Date
): Promise<UrgentRequest | null> {
  try {
    const { data, error } = await supabase
      .from('urgent_requests')
      .insert({
        service_request_id: serviceRequestId,
        priority,
        response_needed_by: responseNeededBy?.toISOString() || null
      })
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Success",
      description: "Urgent request created successfully"
    });

    return data as unknown as UrgentRequest;
  } catch (error: any) {
    console.error("Error creating urgent request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create urgent request"
    });
    return null;
  }
}

// Mark an urgent request as verified or rejected
export async function verifyUrgentRequest(
  id: string,
  verification: {
    verification_status: 'verified' | 'rejected',
    verification_notes?: string,
    verified_by: string
  }
): Promise<UrgentRequest | null> {
  try {
    const { data, error } = await supabase
      .from('urgent_requests')
      .update({
        ...verification,
        verification_date: new Date().toISOString(),
        status: verification.verification_status === 'verified' ? 'in-progress' : 'pending'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Success",
      description: `Urgent request ${verification.verification_status === 'verified' ? 'verified' : 'rejected'} successfully`
    });

    return data as unknown as UrgentRequest;
  } catch (error: any) {
    console.error("Error verifying urgent request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to verify urgent request"
    });
    return null;
  }
}

// Respond to an urgent request
export async function respondToUrgentRequest(
  id: string,
  response: {
    response_notes: string,
    responded_by: string,
    status: 'resolved'
  }
): Promise<UrgentRequest | null> {
  try {
    const { data, error } = await supabase
      .from('urgent_requests')
      .update({
        ...response,
        responded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Success",
      description: "Response to urgent request recorded successfully"
    });

    return data as unknown as UrgentRequest;
  } catch (error: any) {
    console.error("Error responding to urgent request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to respond to urgent request"
    });
    return null;
  }
}

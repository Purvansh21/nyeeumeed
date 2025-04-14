
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Resource, ResourceAllocation } from "@/types/staff";

// Resource Management
export async function fetchResources(): Promise<Resource[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching resources:", error.message);
    return [];
  }
}

export async function createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource | null> {
  try {
    // Make sure allocated is included and defaulted to 0 if not provided
    const resourceWithAllocated = {
      ...resource,
      allocated: resource.allocated ?? 0
    };
    
    const { data, error } = await supabase
      .from('resources')
      .insert(resourceWithAllocated)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Resource created successfully"
    });
    
    return data;
  } catch (error: any) {
    console.error("Error creating resource:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create resource"
    });
    return null;
  }
}

export async function updateResource(id: string, resource: Partial<Resource>): Promise<Resource | null> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .update(resource)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Resource updated successfully"
    });
    
    return data;
  } catch (error: any) {
    console.error("Error updating resource:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update resource"
    });
    return null;
  }
}

export async function fetchResourceAllocations(): Promise<ResourceAllocation[]> {
  try {
    const { data, error } = await supabase
      .from('resource_allocations')
      .select(`
        *,
        resource:resources(name, unit),
        beneficiary:beneficiary_users(full_name)
      `)
      .order('allocated_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching resource allocations:", error.message);
    return [];
  }
}

export async function createResourceAllocation(allocation: Omit<ResourceAllocation, 'id'>): Promise<ResourceAllocation | null> {
  try {
    // First check if there's enough unallocated resources
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('quantity, allocated, unit')
      .eq('id', allocation.resource_id)
      .single();
    
    if (resourceError) throw resourceError;
    
    if (resource.quantity - resource.allocated < allocation.quantity) {
      throw new Error(`Not enough available resources. Only ${resource.quantity - resource.allocated} ${resource.unit} available.`);
    }
    
    // Ensure the current user has a staff record
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser || !authUser.user) {
      throw new Error("You must be logged in to allocate resources");
    }
    
    // Check if user exists in staff_users
    const { data: staffUser, error: staffError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.user.id)
      .single();
      
    if (staffError) {
      console.error("Error checking staff status:", staffError);
      throw new Error("Error verifying your staff status");
    }
    
    if (staffUser.role !== 'admin' && staffUser.role !== 'staff') {
      throw new Error("Only staff members can allocate resources");
    }
    
    // Set the allocated_by field to the current user ID
    const allocationWithUser = {
      ...allocation,
      allocated_by: authUser.user.id
    };
    
    // Start a transaction to update both tables
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert(allocationWithUser)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the allocated amount in the resources table
    const { error: updateError } = await supabase
      .from('resources')
      .update({ allocated: resource.allocated + allocation.quantity })
      .eq('id', allocation.resource_id);
    
    if (updateError) throw updateError;
    
    toast({
      title: "Success",
      description: "Resource allocation created successfully"
    });
    
    return data;
  } catch (error: any) {
    console.error("Error creating resource allocation:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create resource allocation"
    });
    return null;
  }
}

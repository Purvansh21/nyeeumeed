import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  VolunteerShift, 
  BeneficiaryNeed,
  Resource,
  ResourceAllocation,
  StaffTask,
  Report
} from "@/types/staff";
import { User } from "@/types/auth";

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

function validateShiftStatus(status: string): VolunteerShift['status'] {
  const validStatuses: VolunteerShift['status'][] = ['scheduled', 'completed', 'cancelled', 'in-progress'];
  return validStatuses.includes(status as any) ? status as VolunteerShift['status'] : 'scheduled';
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

// Beneficiary Management
export async function fetchBeneficiaries(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_users')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    
    // Transform the data to match the User type
    return (data || []).map(b => ({
      id: b.id,
      fullName: b.full_name,
      email: b.email,
      role: 'beneficiary',
      isActive: b.is_active,
      createdAt: b.created_at,
      lastLoginAt: b.last_login_at,
      contactInfo: b.contact_info,
      additionalInfo: {
        needs: b.needs,
        assistanceHistory: b.assistance_history
      }
    }));
  } catch (error: any) {
    console.error("Error fetching beneficiaries:", error.message);
    return [];
  }
}

function validateNeedPriority(priority: string): BeneficiaryNeed['priority'] {
  const validPriorities: BeneficiaryNeed['priority'][] = ['high', 'medium', 'low'];
  return validPriorities.includes(priority as any) ? priority as BeneficiaryNeed['priority'] : 'medium';
}

function validateNeedStatus(status: string): BeneficiaryNeed['status'] {
  const validStatuses: BeneficiaryNeed['status'][] = ['pending', 'in-progress', 'fulfilled', 'cancelled'];
  return validStatuses.includes(status as any) ? status as BeneficiaryNeed['status'] : 'pending';
}

export async function fetchBeneficiaryNeeds(): Promise<BeneficiaryNeed[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_needs')
      .select(`
        *,
        beneficiary:beneficiary_users(id, full_name, contact_info),
        staff:staff_users(id, full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ensure the priority and status are always one of the allowed types
    return (data || []).map(need => ({
      ...need,
      priority: validateNeedPriority(need.priority),
      status: validateNeedStatus(need.status)
    })) as BeneficiaryNeed[];
  } catch (error: any) {
    console.error("Error fetching beneficiary needs:", error.message);
    return [];
  }
}

export async function createBeneficiaryNeed(need: Omit<BeneficiaryNeed, 'id' | 'created_at' | 'updated_at'>): Promise<BeneficiaryNeed | null> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_needs')
      .insert(need)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Beneficiary need created successfully"
    });
    
    return {
      ...data,
      priority: validateNeedPriority(data.priority),
      status: validateNeedStatus(data.status)
    } as BeneficiaryNeed;
  } catch (error: any) {
    console.error("Error creating beneficiary need:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create beneficiary need"
    });
    return null;
  }
}

export async function updateBeneficiaryNeed(id: string, need: Partial<BeneficiaryNeed>): Promise<BeneficiaryNeed | null> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_needs')
      .update(need)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Beneficiary need updated successfully"
    });
    
    return {
      ...data,
      priority: validateNeedPriority(data.priority),
      status: validateNeedStatus(data.status)
    } as BeneficiaryNeed;
  } catch (error: any) {
    console.error("Error updating beneficiary need:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update beneficiary need"
    });
    return null;
  }
}

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

// Task Management
function validateTaskPriority(priority: string): StaffTask['priority'] {
  const validPriorities: StaffTask['priority'][] = ['high', 'medium', 'low'];
  return validPriorities.includes(priority as any) ? priority as StaffTask['priority'] : 'medium';
}

function validateTaskStatus(status: string): StaffTask['status'] {
  const validStatuses: StaffTask['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status as any) ? status as StaffTask['status'] : 'pending';
}

export async function fetchStaffTasks(): Promise<StaffTask[]> {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .select(`
        *,
        staff:staff_users(full_name)
      `)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    // Ensure the priority and status are always one of the allowed types
    return (data || []).map(task => ({
      ...task,
      priority: validateTaskPriority(task.priority),
      status: validateTaskStatus(task.status)
    })) as StaffTask[];
  } catch (error: any) {
    console.error("Error fetching staff tasks:", error.message);
    return [];
  }
}

export async function createStaffTask(task: Omit<StaffTask, 'id' | 'created_at' | 'updated_at'>): Promise<StaffTask | null> {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Task created successfully"
    });
    
    return {
      ...data,
      priority: validateTaskPriority(data.priority),
      status: validateTaskStatus(data.status)
    } as StaffTask;
  } catch (error: any) {
    console.error("Error creating staff task:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create task"
    });
    return null;
  }
}

export async function updateStaffTask(id: string, task: Partial<StaffTask>): Promise<StaffTask | null> {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Task updated successfully"
    });
    
    return {
      ...data,
      priority: validateTaskPriority(data.priority),
      status: validateTaskStatus(data.status)
    } as StaffTask;
  } catch (error: any) {
    console.error("Error updating staff task:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update task"
    });
    return null;
  }
}

// Reports
export async function fetchReports(): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform JSON data to Record<string, any>
    return (data || []).map(report => ({
      ...report,
      data: report.data as Record<string, any> | null,
      parameters: report.parameters as Record<string, any> | null
    }));
  } catch (error: any) {
    console.error("Error fetching reports:", error.message);
    return [];
  }
}

export async function createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Report created successfully"
    });
    
    return {
      ...data,
      data: data.data as Record<string, any> | null,
      parameters: data.parameters as Record<string, any> | null
    };
  } catch (error: any) {
    console.error("Error creating report:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create report"
    });
    return null;
  }
}

export async function fetchReportById(id: string): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data ? {
      ...data,
      data: data.data as Record<string, any> | null,
      parameters: data.parameters as Record<string, any> | null
    } : null;
  } catch (error: any) {
    console.error("Error fetching report:", error.message);
    return null;
  }
}

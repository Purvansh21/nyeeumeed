import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  VolunteerShift, 
  BeneficiaryNeed,
  Resource,
  ResourceAllocation,
  StaffTask,
  Report,
  Appointment,
  ServiceRequest
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

// Add validation function for appointment status
function validateAppointmentStatus(status: string): Appointment['status'] {
  const validStatuses: Appointment['status'][] = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status as any) ? status as Appointment['status'] : 'scheduled';
}

// Appointments Management
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        beneficiary:beneficiary_id(id, full_name, contact_info),
        staff:staff_id(id, full_name)
      `)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data to match our expected types
    return (data || []).map(appointment => {
      // Handle the case where beneficiary/staff might have error
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
      
      // Add the relations if they exist and are valid
      if (appointment.beneficiary && typeof appointment.beneficiary === 'object' && !('error' in appointment.beneficiary)) {
        transformedAppointment.beneficiary = {
          id: appointment.beneficiary.id,
          full_name: appointment.beneficiary.full_name,
          contact_info: appointment.beneficiary.contact_info
        };
      }
      
      if (appointment.staff && typeof appointment.staff === 'object' && !('error' in appointment.staff)) {
        transformedAppointment.staff = {
          id: appointment.staff.id,
          full_name: appointment.staff.full_name
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
    // Validate status if provided
    if (appointment.status) {
      appointment.status = validateAppointmentStatus(appointment.status);
    }
    
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
    
    return {
      ...data,
      status: validateAppointmentStatus(data.status)
    } as Appointment;
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

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
  try {
    // Validate status
    const appointmentWithValidStatus = {
      ...appointment,
      status: validateAppointmentStatus(appointment.status)
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentWithValidStatus)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Appointment created successfully"
    });
    
    return {
      ...data,
      status: validateAppointmentStatus(data.status)
    } as Appointment;
  } catch (error: any) {
    console.error("Error creating appointment:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create appointment"
    });
    return null;
  }
}

// Add validation functions for service request status and urgency
function validateServiceRequestStatus(status: string): ServiceRequest['status'] {
  const validStatuses: ServiceRequest['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status as any) ? status as ServiceRequest['status'] : 'pending';
}

function validateServiceRequestUrgency(urgency: string): ServiceRequest['urgency'] {
  const validUrgencies: ServiceRequest['urgency'][] = ['high', 'medium', 'low'];
  return validUrgencies.includes(urgency as any) ? urgency as ServiceRequest['urgency'] : 'medium';
}

// Service Requests Management
export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  try {
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
      // Handle the case where beneficiary/staff might have error
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
      
      // Add the relations if they exist and are valid
      if (request.beneficiary && typeof request.beneficiary === 'object' && !('error' in request.beneficiary)) {
        transformedRequest.beneficiary = {
          id: request.beneficiary.id,
          full_name: request.beneficiary.full_name,
          contact_info: request.beneficiary.contact_info
        };
      }
      
      if (request.staff && typeof request.staff === 'object' && !('error' in request.staff)) {
        transformedRequest.staff = {
          id: request.staff.id,
          full_name: request.staff.full_name
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
    // Validate status and urgency if provided
    if (request.status) {
      request.status = validateServiceRequestStatus(request.status);
    }
    
    if (request.urgency) {
      request.urgency = validateServiceRequestUrgency(request.urgency);
    }
    
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
    
    return {
      ...data,
      status: validateServiceRequestStatus(data.status),
      urgency: validateServiceRequestUrgency(data.urgency)
    } as ServiceRequest;
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

export async function createServiceRequest(request: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceRequest | null> {
  try {
    // Validate status and urgency
    const requestWithValidProperties = {
      ...request,
      status: validateServiceRequestStatus(request.status),
      urgency: validateServiceRequestUrgency(request.urgency)
    };
    
    const { data, error } = await supabase
      .from('service_requests')
      .insert(requestWithValidProperties)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Service request created successfully"
    });
    
    return {
      ...data,
      status: validateServiceRequestStatus(data.status),
      urgency: validateServiceRequestUrgency(data.urgency)
    } as ServiceRequest;
  } catch (error: any) {
    console.error("Error creating service request:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create service request"
    });
    return null;
  }
}

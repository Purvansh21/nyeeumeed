export interface VolunteerShift {
  id: string;
  volunteer_id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  description: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  created_at: string;
  created_by: string;
  updated_at: string;
  volunteer?: {
    id: string;
    full_name: string;
    contact_info: string | null;
    skills: string[] | null;
  };
}

export interface BeneficiaryNeed {
  id: string;
  beneficiary_id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'fulfilled' | 'cancelled';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  beneficiary?: {
    id: string;
    full_name: string;
    contact_info: string | null;
  };
  staff?: {
    id: string;
    full_name: string;
  };
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  quantity: number;
  allocated: number;
  unit: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  beneficiary_id: string;
  quantity: number;
  allocated_by: string;
  allocated_date: string;
  notes: string | null;
  resource?: {
    name: string;
    unit: string;
  };
  beneficiary?: {
    full_name: string;
  };
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  staff?: {
    full_name: string;
  };
}

export interface Report {
  id: string;
  title: string;
  type: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  data: Record<string, any> | null;
  parameters: Record<string, any> | null;
}

export interface Appointment {
  id: string;
  beneficiary_id: string;
  staff_id: string | null;
  title: string;
  appointment_type: string;
  date: string;
  time_slot: string;
  location: string | null;
  is_virtual: boolean;
  notes: string | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  beneficiary?: {
    id: string;
    full_name: string;
    contact_info: string | null;
  };
  staff?: {
    id: string;
    full_name: string;
  };
}

export interface ServiceRequest {
  id: string;
  beneficiary_id: string;
  service_type: string;
  description: string | null;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  preferred_contact_method: string | null;
  assigned_staff: string | null;
  next_step: string | null;
  created_at: string;
  updated_at: string;
  beneficiary?: {
    id: string;
    full_name: string;
    contact_info: string | null;
  };
  staff?: {
    id: string;
    full_name: string;
  };
}

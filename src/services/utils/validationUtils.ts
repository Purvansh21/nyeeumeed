
/**
 * Utility functions for validating enum-like status values
 */

// Volunteer Management
export function validateShiftStatus(status: string): 'scheduled' | 'completed' | 'cancelled' | 'in-progress' {
  const validStatuses: ('scheduled' | 'completed' | 'cancelled' | 'in-progress')[] = 
    ['scheduled', 'completed', 'cancelled', 'in-progress'];
  return validStatuses.includes(status as any) ? status as any : 'scheduled';
}

// Beneficiary Management
export function validateNeedPriority(priority: string): 'high' | 'medium' | 'low' {
  const validPriorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  return validPriorities.includes(priority as any) ? priority as any : 'medium';
}

export function validateNeedStatus(status: string): 'pending' | 'in-progress' | 'fulfilled' | 'cancelled' {
  const validStatuses: ('pending' | 'in-progress' | 'fulfilled' | 'cancelled')[] = 
    ['pending', 'in-progress', 'fulfilled', 'cancelled'];
  return validStatuses.includes(status as any) ? status as any : 'pending';
}

// Task Management
export function validateTaskPriority(priority: string): 'high' | 'medium' | 'low' {
  const validPriorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  return validPriorities.includes(priority as any) ? priority as any : 'medium';
}

export function validateTaskStatus(status: string): 'pending' | 'in-progress' | 'completed' | 'cancelled' {
  const validStatuses: ('pending' | 'in-progress' | 'completed' | 'cancelled')[] = 
    ['pending', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status as any) ? status as any : 'pending';
}

// Appointment Management
export function validateAppointmentStatus(status: string): 'scheduled' | 'in-progress' | 'completed' | 'cancelled' {
  const validStatuses: ('scheduled' | 'in-progress' | 'completed' | 'cancelled')[] = 
    ['scheduled', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status as any) ? status as any : 'scheduled';
}

// Service Request Management
export function validateServiceRequestStatus(status: string): 'pending' | 'in-progress' | 'completed' | 'cancelled' {
  const validStatuses: ('pending' | 'in-progress' | 'completed' | 'cancelled')[] = 
    ['pending', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status as any) ? status as any : 'pending';
}

export function validateServiceRequestUrgency(urgency: string): 'high' | 'medium' | 'low' {
  const validUrgencies: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  return validUrgencies.includes(urgency as any) ? urgency as any : 'medium';
}

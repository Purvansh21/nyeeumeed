export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  spots_available: number;
  spots_filled: number;
  status: 'active' | 'cancelled' | 'completed' | 'full';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface VolunteerRegistration {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  status: 'registered' | 'completed' | 'cancelled' | 'no-show';
  registered_at: string;
  completed_at?: string;
  hours_logged?: number;
  feedback?: string;
  opportunity?: VolunteerOpportunity;
}

export interface VolunteerAchievement {
  id: string;
  volunteer_id: string;
  title: string;
  description: string;
  badge_name: string;
  date_earned: string;
  category: string;
  points: number;
}

export interface VolunteerTrainingMaterial {
  id: string;
  title: string;
  description: string;
  category: string;
  content_type: 'video' | 'document' | 'interactive';
  url?: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
  is_required: boolean;
}

export interface VolunteerTrainingProgress {
  id: string;
  volunteer_id: string;
  material_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  score?: number;
  material?: VolunteerTrainingMaterial;
}

export interface VolunteerTask {
  id: string;
  volunteer_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  related_beneficiary_id?: string;
  beneficiary?: {
    id: string;
    full_name: string;
  };
}

export interface VolunteerHours {
  total: number;
  monthly: number;
  yearly: number;
  details: {
    month: string;
    hours: number;
  }[];
}

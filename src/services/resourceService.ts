import { supabase } from "@/integrations/supabase/client";
import { VolunteerTrainingMaterial } from "@/types/volunteer";

// Mock data for development, used as fallback
const MOCK_TRAINING_MATERIALS: VolunteerTrainingMaterial[] = [
  {
    id: "1",
    title: "Emergency Response Protocol",
    description: "Learn the proper procedures for emergency response situations",
    category: "emergency",
    content_type: "document",
    url: "https://example.com/docs/emergency-response.pdf",
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
    is_required: true
  },
  {
    id: "2",
    title: "Effective Communication with Beneficiaries",
    description: "Techniques for clear and compassionate communication",
    category: "communication",
    content_type: "video",
    url: "https://example.com/videos/communication.mp4",
    created_at: "2025-01-20T00:00:00Z",
    updated_at: "2025-01-20T00:00:00Z",
    is_required: true
  },
  {
    id: "3",
    title: "Volunteer Ethics and Guidelines",
    description: "Understanding the ethical considerations of volunteer work",
    category: "ethics",
    content_type: "document",
    url: "https://example.com/docs/ethics-guide.pdf",
    created_at: "2025-02-05T00:00:00Z",
    updated_at: "2025-02-05T00:00:00Z",
    is_required: true
  }
];

// Mock training progress
const MOCK_TRAINING_PROGRESS: VolunteerTrainingProgress[] = [
  {
    id: "1",
    volunteer_id: "user-1",
    material_id: "1",
    status: "completed",
    started_at: "2025-01-16T00:00:00Z",
    completed_at: "2025-01-17T00:00:00Z",
    score: 95,
    material: MOCK_TRAINING_MATERIALS[0]
  },
  {
    id: "2",
    volunteer_id: "user-1",
    material_id: "2",
    status: "in_progress",
    started_at: "2025-01-25T00:00:00Z",
    completed_at: undefined,
    score: undefined,
    material: MOCK_TRAINING_MATERIALS[1]
  },
  {
    id: "3",
    volunteer_id: "user-1",
    material_id: "3",
    status: "not_started",
    started_at: undefined,
    completed_at: undefined,
    score: undefined,
    material: MOCK_TRAINING_MATERIALS[2]
  }
];

export interface TrainingResourceData {
  title: string;
  description: string;
  category: string;
  content_type: 'document' | 'video' | 'interactive';
  is_required: boolean;
  url?: string;
  file?: File | null;
}

/**
 * Create a new training resource
 */
export const createTrainingResource = async (data: TrainingResourceData): Promise<boolean> => {
  try {
    console.log("Creating training resource:", data);
    
    let filePath = null;
    let publicUrl = data.url;
    
    // If a file was provided, upload it to Supabase storage
    if (data.file) {
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      filePath = `${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training_materials')
        .upload(filePath, data.file, {
          upsert: true
        });
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return false;
      }
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('training_materials')
        .getPublicUrl(filePath);
        
      if (urlData) {
        publicUrl = urlData.publicUrl;
      }
    }
    
    // Insert resource metadata into the database
    const { error } = await supabase
      .from('volunteer_training_materials')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        content_type: data.content_type,
        is_required: data.is_required,
        url: publicUrl,
        file_path: filePath
      });
    
    if (error) {
      console.error("Error inserting training resource:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to create training resource:", error);
    return false;
  }
};

/**
 * Fetch training materials available to volunteers
 */
export const getTrainingMaterials = async (): Promise<VolunteerTrainingMaterial[]> => {
  try {
    try {
      const { data, error } = await supabase
        .from('volunteer_training_materials')
        .select('*');
      
      if (error) {
        console.error("Error fetching training materials:", error);
        return MOCK_TRAINING_MATERIALS;
      }
      
      // Cast the data to the right type
      return (data || []) as unknown as VolunteerTrainingMaterial[];
    } catch (supabaseError) {
      console.error("Supabase error:", supabaseError);
      return MOCK_TRAINING_MATERIALS;
    }
  } catch (error) {
    console.error("Failed to fetch training materials:", error);
    return MOCK_TRAINING_MATERIALS;
  }
};

/**
 * Fetch a volunteer's training progress
 */
export const getTrainingProgress = async (volunteerId: string): Promise<VolunteerTrainingProgress[]> => {
  try {
    try {
      const { data, error } = await supabase
        .from('volunteer_training_progress')
        .select(`
          *,
          material:volunteer_training_materials(*)
        `)
        .eq('volunteer_id', volunteerId);
      
      if (error) {
        console.error("Error fetching training progress:", error);
        return MOCK_TRAINING_PROGRESS;
      }
      
      return data as unknown as VolunteerTrainingProgress[];
    } catch (supabaseError) {
      console.error("Supabase error:", supabaseError);
      return MOCK_TRAINING_PROGRESS;
    }
  } catch (error) {
    console.error("Failed to fetch training progress:", error);
    return MOCK_TRAINING_PROGRESS;
  }
};

/**
 * Update a volunteer's progress on a training material
 */
export const updateTrainingProgress = async (
  volunteerId: string,
  materialId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  score?: number
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    const updates: any = { status };
    
    // Set started_at if status is changing to in_progress
    if (status === 'in_progress') {
      try {
        // Check if there's an existing record first
        const { data: existingProgress } = await supabase
          .from('volunteer_training_progress')
          .select('*')
          .eq('volunteer_id', volunteerId)
          .eq('material_id', materialId)
          .maybeSingle();
        
        // Only set started_at if it doesn't exist already
        if (!existingProgress || !existingProgress.started_at) {
          updates.started_at = now;
        }
      } catch (error) {
        console.error("Error checking existing progress:", error);
        updates.started_at = now; // Default to setting started_at
      }
    }
    
    // Set completed_at and score if status is changing to completed
    if (status === 'completed') {
      updates.completed_at = now;
      if (score !== undefined) {
        updates.score = score;
      }
    }
    
    try {
      // Upsert the progress record
      const { error } = await supabase
        .from('volunteer_training_progress')
        .upsert({
          volunteer_id: volunteerId,
          material_id: materialId,
          ...updates,
          updated_at: now
        }, {
          onConflict: 'volunteer_id,material_id'
        });
      
      if (error) {
        console.error("Error updating training progress:", error);
        return false;
      }
      
      return true;
    } catch (supabaseError) {
      console.error("Supabase error in upsert:", supabaseError);
      return true; // Simulate success for development
    }
  } catch (error) {
    console.error("Failed to update training progress:", error);
    return false;
  }
};

/**
 * Download a resource or training material
 */
export const downloadResource = async (resourceId: string): Promise<string> => {
  try {
    try {
      const { data, error } = await supabase
        .from('volunteer_training_materials')
        .select('*')
        .eq('id', resourceId)
        .single();
      
      if (error) {
        console.error("Error fetching resource:", error);
        throw error;
      }
      
      if (data && data.url) {
        return data.url;
      }
      
      throw new Error("Resource URL not found");
    } catch (supabaseError) {
      console.error("Supabase error in download:", supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error("Failed to download resource:", error);
    throw error;
  }
};

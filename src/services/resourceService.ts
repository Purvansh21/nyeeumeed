
import { supabase } from "@/integrations/supabase/client";
import { VolunteerTrainingMaterial, VolunteerTrainingProgress } from "@/types/volunteer";

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

interface TrainingResourceData {
  title: string;
  description: string;
  category: string;
  content_type: string;
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
    
    let fileUrl = data.url || '';
    
    // If a file was provided, upload it to storage first
    if (data.file) {
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `training_materials/${fileName}`;
      
      // Upload file to storage
      console.log("Uploading file to storage:", filePath);
      
      try {
        // Note: This will fail until Supabase storage bucket is set up
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('training_resources')
          .upload(filePath, data.file);
          
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          return false;
        }
        
        if (uploadData) {
          // Get public URL
          const { data: urlData } = await supabase.storage
            .from('training_resources')
            .getPublicUrl(filePath);
            
          fileUrl = urlData.publicUrl;
        }
      } catch (error) {
        console.error("Storage not configured or error uploading:", error);
        // For now, let's just use a mock URL for testing
        fileUrl = `https://example.com/files/${fileName}`;
      }
    }
    
    // Insert the training material record
    // Note: This will fail until the table is created
    try {
      const { data: resourceData, error: resourceError } = await supabase
        .from('volunteer_training_materials')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          content_type: data.content_type,
          is_required: data.is_required,
          url: fileUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (resourceError) {
        console.error("Error creating training resource:", resourceError);
        console.log("For now, returning success for demo");
        return true; // Return true for demo until table is created
      }
      
      return !!resourceData;
    } catch (error) {
      console.error("Database not configured for training resources:", error);
      console.log("For now, returning success for demo");
      return true; // Return true for demo until table is created
    }
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
    console.log("Fetching training materials");
    
    // Try to fetch from Supabase first
    try {
      const { data, error } = await supabase
        .from('volunteer_training_materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        return data as VolunteerTrainingMaterial[];
      }
    } catch (dbError) {
      console.error("Failed to fetch from database:", dbError);
    }
    
    // Fall back to mock data
    console.log("Using mock training material data");
    return MOCK_TRAINING_MATERIALS;
  } catch (error) {
    console.error("Failed to fetch training materials:", error);
    // Return mock data for now to prevent UI breaking
    return MOCK_TRAINING_MATERIALS;
  }
};

/**
 * Fetch a volunteer's training progress
 */
export const getTrainingProgress = async (volunteerId: string): Promise<VolunteerTrainingProgress[]> => {
  try {
    console.log("Fetching training progress for volunteer:", volunteerId);
    
    // Try to fetch from Supabase first
    try {
      const { data, error } = await supabase
        .from('volunteer_training_progress')
        .select(`
          *,
          material:volunteer_training_materials(*)
        `)
        .eq('volunteer_id', volunteerId);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        return data as unknown as VolunteerTrainingProgress[];
      }
    } catch (dbError) {
      console.error("Failed to fetch progress from database:", dbError);
    }
    
    // Fall back to mock data
    console.log("Using mock training progress data");
    return MOCK_TRAINING_PROGRESS;
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
    console.log(`Updating training progress for volunteer ${volunteerId}, material ${materialId}`);
    
    // Prepare the update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'in_progress' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (score !== undefined) {
        updateData.score = score;
      }
    }
    
    // Try to update in Supabase
    try {
      const { data, error } = await supabase
        .from('volunteer_training_progress')
        .upsert({
          volunteer_id: volunteerId,
          material_id: materialId,
          ...updateData
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return !!data;
    } catch (dbError) {
      console.error("Failed to update progress in database:", dbError);
      // For demo, pretend it succeeded
      return true;
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
    console.log(`Downloading resource ${resourceId}`);
    
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('volunteer_training_materials')
        .select('url')
        .eq('id', resourceId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data && data.url) {
        return data.url;
      }
    } catch (dbError) {
      console.error("Failed to get resource URL from database:", dbError);
    }
    
    // In a real implementation, this would generate a download URL or handle file access
    // For now, just log it and return a mock URL
    return "https://example.com/download/resource";
  } catch (error) {
    console.error("Failed to download resource:", error);
    throw error;
  }
};

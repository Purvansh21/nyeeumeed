
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

/**
 * Fetch training materials available to volunteers
 */
export const getTrainingMaterials = async (): Promise<VolunteerTrainingMaterial[]> => {
  try {
    console.log("Fetching training materials");
    
    const { data, error } = await supabase
      .from('volunteer_training_materials')
      .select('*');
    
    if (error) {
      console.error("Error fetching training materials:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No training materials found, using mock data");
      return MOCK_TRAINING_MATERIALS;
    }
    
    console.log("Fetched training materials:", data);
    return data;
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
    
    const { data, error } = await supabase
      .from('volunteer_training_progress')
      .select('*, material:volunteer_training_materials(*)')
      .eq('volunteer_id', volunteerId);
    
    if (error) {
      console.error("Error fetching training progress:", error);
      throw error;
    }
    
    console.log("Fetched training progress:", data);
    return data || [];
  } catch (error) {
    console.error("Failed to fetch training progress:", error);
    return [];
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
    
    // Check if a progress record already exists
    const { data: existing } = await supabase
      .from('volunteer_training_progress')
      .select('id')
      .eq('volunteer_id', volunteerId)
      .eq('material_id', materialId)
      .maybeSingle();
    
    const now = new Date().toISOString();
    let completed_at = null;
    if (status === 'completed') {
      completed_at = now;
    }
    
    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('volunteer_training_progress')
        .update({
          status,
          score: score || null,
          completed_at
        })
        .eq('id', existing.id);
      
      if (error) {
        console.error("Error updating training progress:", error);
        throw error;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('volunteer_training_progress')
        .insert({
          volunteer_id: volunteerId,
          material_id: materialId,
          status,
          score: score || null,
          started_at: now,
          completed_at
        });
      
      if (error) {
        console.error("Error creating training progress:", error);
        throw error;
      }
    }
    
    console.log(`Successfully updated training progress to ${status}`);
    return true;
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
    
    // In a real implementation, this would generate a download URL or handle file access
    // For now, just log it and return a mock URL
    return "https://example.com/download/resource";
  } catch (error) {
    console.error("Failed to download resource:", error);
    throw error;
  }
};

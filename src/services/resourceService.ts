
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

/**
 * Fetch training materials available to volunteers
 */
export const getTrainingMaterials = async (): Promise<VolunteerTrainingMaterial[]> => {
  try {
    console.log("Fetching training materials");
    
    // For now, we'll just use the mock data since the volunteer_training_materials table doesn't exist yet
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
    
    // For now, we'll just use the mock data since the volunteer_training_progress table doesn't exist yet
    console.log("Using mock training progress data");
    return MOCK_TRAINING_PROGRESS;
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
    
    // In a real implementation, this would update the database
    // For now, just log it and return success
    console.log(`Status updated to: ${status}, score: ${score || 'N/A'}`);
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

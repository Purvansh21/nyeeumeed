
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
    
    // If a file was provided, pretend to upload it and generate a mock URL
    if (data.file) {
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      // Just simulate a successful upload and return a fake URL for now
      fileUrl = `https://example.com/files/${fileName}`;
      console.log("Mocked file upload URL:", fileUrl);
    }
    
    // Create a mock training material in our mock data
    const newMaterial: VolunteerTrainingMaterial = {
      id: Math.random().toString(36).substring(2),
      title: data.title,
      description: data.description,
      category: data.category,
      content_type: data.content_type,
      is_required: data.is_required,
      url: fileUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    MOCK_TRAINING_MATERIALS.push(newMaterial);
    console.log("Mock training material created:", newMaterial);
    
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
  console.log("Getting training materials (using mock data)");
  return MOCK_TRAINING_MATERIALS;
};

/**
 * Fetch a volunteer's training progress
 */
export const getTrainingProgress = async (volunteerId: string): Promise<VolunteerTrainingProgress[]> => {
  console.log("Getting training progress for volunteer:", volunteerId, "(using mock data)");
  return MOCK_TRAINING_PROGRESS;
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
    
    // Find the progress item in our mock data
    const progressIndex = MOCK_TRAINING_PROGRESS.findIndex(
      p => p.volunteer_id === volunteerId && p.material_id === materialId
    );
    
    // Update or create the progress item
    if (progressIndex >= 0) {
      MOCK_TRAINING_PROGRESS[progressIndex] = {
        ...MOCK_TRAINING_PROGRESS[progressIndex],
        status,
        ...(status === 'in_progress' && !MOCK_TRAINING_PROGRESS[progressIndex].started_at 
          ? { started_at: new Date().toISOString() } 
          : {}),
        ...(status === 'completed' 
          ? { 
              completed_at: new Date().toISOString(),
              ...(score !== undefined ? { score } : {}) 
            } 
          : {})
      };
    } else {
      // Create a new progress entry
      const newProgress: VolunteerTrainingProgress = {
        id: Math.random().toString(36).substring(2),
        volunteer_id: volunteerId,
        material_id: materialId,
        status,
        ...(status === 'in_progress' ? { started_at: new Date().toISOString() } : {}),
        ...(status === 'completed' 
          ? { 
              completed_at: new Date().toISOString(),
              ...(score !== undefined ? { score } : {}) 
            } 
          : {}),
        material: MOCK_TRAINING_MATERIALS.find(m => m.id === materialId)
      };
      
      MOCK_TRAINING_PROGRESS.push(newProgress);
    }
    
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
    
    // Find the resource in our mock data
    const resource = MOCK_TRAINING_MATERIALS.find(r => r.id === resourceId);
    
    if (resource && resource.url) {
      return resource.url;
    }
    
    return "https://example.com/download/resource";
  } catch (error) {
    console.error("Failed to download resource:", error);
    throw error;
  }
};


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  status: "active" | "scheduled" | "expired";
  created_at: string;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    console.log("Fetching announcements...");
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }
    
    console.log("Announcements fetched successfully:", data);
    
    // Validate and cast the status to ensure it matches the expected type
    const typedAnnouncements = data?.map(item => {
      // Ensure status is one of the allowed values
      let validStatus: "active" | "scheduled" | "expired" = "active";
      if (item.status === "scheduled" || item.status === "expired") {
        validStatus = item.status as "scheduled" | "expired";
      }
      
      return {
        ...item,
        status: validStatus
      } as Announcement;
    }) || [];
    
    return typedAnnouncements;
  } catch (error: any) {
    console.error("Error fetching announcements:", error.message);
    return [];
  }
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement | null> {
  try {
    console.log("Creating announcement:", announcement);
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log("Announcement created successfully:", data);
    toast({
      title: "Success",
      description: "Announcement created successfully"
    });
    
    // Cast the returned data to Announcement type
    const typedAnnouncement = {
      ...data,
      status: data.status as "active" | "scheduled" | "expired"
    } as Announcement;
    
    return typedAnnouncement;
  } catch (error: any) {
    console.error("Error creating announcement:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create announcement"
    });
    return null;
  }
}

export async function updateAnnouncement(id: number, announcement: Partial<Omit<Announcement, 'id' | 'created_at'>>): Promise<Announcement | null> {
  try {
    console.log(`Updating announcement ${id}:`, announcement);
    const { data, error } = await supabase
      .from('announcements')
      .update(announcement)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log("Announcement updated successfully:", data);
    toast({
      title: "Success",
      description: "Announcement updated successfully"
    });
    
    // Cast the returned data to Announcement type
    const typedAnnouncement = {
      ...data,
      status: data.status as "active" | "scheduled" | "expired"
    } as Announcement;
    
    return typedAnnouncement;
  } catch (error: any) {
    console.error("Error updating announcement:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update announcement"
    });
    return null;
  }
}

export async function deleteAnnouncement(id: number): Promise<boolean> {
  try {
    console.log(`Deleting announcement ${id}`);
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log("Announcement deleted successfully");
    toast({
      title: "Success",
      description: "Announcement deleted successfully"
    });
    
    return true;
  } catch (error: any) {
    console.error("Error deleting announcement:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to delete announcement"
    });
    return false;
  }
}

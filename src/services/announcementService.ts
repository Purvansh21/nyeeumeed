
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  status: string;
  created_at: string;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error("Error fetching announcements:", error.message);
    return [];
  }
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement | null> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Announcement created successfully"
    });
    
    return data;
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
    const { data, error } = await supabase
      .from('announcements')
      .update(announcement)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Announcement updated successfully"
    });
    
    return data;
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
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
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

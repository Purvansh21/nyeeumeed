
import { supabase } from "./client";

export interface Announcement {
  id: number;
  title: string;
  message: string;
  status: "active" | "scheduled" | "expired";
  date: string;
  created_at?: string;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }

    return data as Announcement[] || [];
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return [];
  }
};

export const createAnnouncement = async (announcement: Omit<Announcement, "id" | "created_at">): Promise<Announcement | null> => {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .insert(announcement)
      .select()
      .single();

    if (error) {
      console.error("Error creating announcement:", error);
      return null;
    }

    return data as Announcement;
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return null;
  }
};

export const updateAnnouncement = async (id: number, updates: Partial<Announcement>): Promise<Announcement | null> => {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating announcement:", error);
      return null;
    }

    return data as Announcement;
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return null;
  }
};

export const deleteAnnouncement = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return false;
  }
};

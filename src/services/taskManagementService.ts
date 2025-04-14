
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { StaffTask } from "@/types/staff";
import { validateTaskPriority, validateTaskStatus } from "./utils/validationUtils";

// Task Management
export async function fetchStaffTasks(): Promise<StaffTask[]> {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .select(`
        *,
        staff:staff_users(full_name)
      `)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    // Ensure the priority and status are always one of the allowed types
    return (data || []).map(task => ({
      ...task,
      priority: validateTaskPriority(task.priority),
      status: validateTaskStatus(task.status)
    })) as StaffTask[];
  } catch (error: any) {
    console.error("Error fetching staff tasks:", error.message);
    return [];
  }
}

export async function createStaffTask(task: Omit<StaffTask, 'id' | 'created_at' | 'updated_at'>): Promise<StaffTask | null> {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Task created successfully"
    });
    
    return {
      ...data,
      priority: validateTaskPriority(data.priority),
      status: validateTaskStatus(data.status)
    } as StaffTask;
  } catch (error: any) {
    console.error("Error creating staff task:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create task"
    });
    return null;
  }
}

export async function updateStaffTask(id: string, task: Partial<StaffTask>): Promise<StaffTask | null> {
  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Task updated successfully"
    });
    
    return {
      ...data,
      priority: validateTaskPriority(data.priority),
      status: validateTaskStatus(data.status)
    } as StaffTask;
  } catch (error: any) {
    console.error("Error updating staff task:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update task"
    });
    return null;
  }
}


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";

// Helper function to create demo users
export const createDemoUsers = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke("create-demo-users");
    
    if (error) throw error;
    
    if (data?.success) {
      toast({
        title: "Success",
        description: "Demo data has been successfully created"
      });
      return { success: true, message: "Demo data created successfully" };
    } else {
      throw new Error(data?.error || "Unknown error occurred");
    }
  } catch (error: any) {
    console.error("Error creating demo data:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create demo data"
    });
    return { success: false, error: error.message };
  }
};

// Re-export all functions from individual service files
export * from "./volunteerManagementService";
export * from "./beneficiaryManagementService";
export * from "./resourceManagementService";
export * from "./taskManagementService";
export * from "./reportService";
export * from "./appointmentService";
export * from "./serviceRequestService";

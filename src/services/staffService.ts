
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";

// Re-export all functions from individual service files
export * from "./volunteerManagementService";
export * from "./beneficiaryManagementService";
export * from "./resourceManagementService";
export * from "./taskManagementService";
export * from "./reportService";
export * from "./appointmentService";
export * from "./serviceRequestService";

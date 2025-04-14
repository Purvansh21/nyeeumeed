
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { BeneficiaryNeed } from "@/types/staff";
import { User } from "@/types/auth";
import { validateNeedPriority, validateNeedStatus } from "./utils/validationUtils";

// Beneficiary Management
export async function fetchBeneficiaries(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_users')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    
    // Transform the data to match the User type
    return (data || []).map(b => ({
      id: b.id,
      fullName: b.full_name,
      email: b.email,
      role: 'beneficiary',
      isActive: b.is_active,
      createdAt: b.created_at,
      lastLoginAt: b.last_login_at,
      contactInfo: b.contact_info,
      additionalInfo: {
        needs: b.needs,
        assistanceHistory: b.assistance_history
      }
    }));
  } catch (error: any) {
    console.error("Error fetching beneficiaries:", error.message);
    return [];
  }
}

export async function fetchBeneficiaryNeeds(): Promise<BeneficiaryNeed[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_needs')
      .select(`
        *,
        beneficiary:beneficiary_users(id, full_name, contact_info),
        staff:staff_users(id, full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ensure the priority and status are always one of the allowed types
    return (data || []).map(need => ({
      ...need,
      priority: validateNeedPriority(need.priority),
      status: validateNeedStatus(need.status)
    })) as BeneficiaryNeed[];
  } catch (error: any) {
    console.error("Error fetching beneficiary needs:", error.message);
    return [];
  }
}

export async function createBeneficiaryNeed(need: Omit<BeneficiaryNeed, 'id' | 'created_at' | 'updated_at'>): Promise<BeneficiaryNeed | null> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_needs')
      .insert(need)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Beneficiary need created successfully"
    });
    
    return {
      ...data,
      priority: validateNeedPriority(data.priority),
      status: validateNeedStatus(data.status)
    } as BeneficiaryNeed;
  } catch (error: any) {
    console.error("Error creating beneficiary need:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create beneficiary need"
    });
    return null;
  }
}

export async function updateBeneficiaryNeed(id: string, need: Partial<BeneficiaryNeed>): Promise<BeneficiaryNeed | null> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_needs')
      .update(need)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Beneficiary need updated successfully"
    });
    
    return {
      ...data,
      priority: validateNeedPriority(data.priority),
      status: validateNeedStatus(data.status)
    } as BeneficiaryNeed;
  } catch (error: any) {
    console.error("Error updating beneficiary need:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to update beneficiary need"
    });
    return null;
  }
}

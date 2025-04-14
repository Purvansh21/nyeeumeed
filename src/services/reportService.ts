
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Report } from "@/types/staff";

// Reports
export async function fetchReports(): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform JSON data to Record<string, any>
    return (data || []).map(report => ({
      ...report,
      data: report.data as Record<string, any> | null,
      parameters: report.parameters as Record<string, any> | null
    }));
  } catch (error: any) {
    console.error("Error fetching reports:", error.message);
    return [];
  }
}

export async function createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Report created successfully"
    });
    
    return {
      ...data,
      data: data.data as Record<string, any> | null,
      parameters: data.parameters as Record<string, any> | null
    };
  } catch (error: any) {
    console.error("Error creating report:", error.message);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to create report"
    });
    return null;
  }
}

export async function fetchReportById(id: string): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data ? {
      ...data,
      data: data.data as Record<string, any> | null,
      parameters: data.parameters as Record<string, any> | null
    } : null;
  } catch (error: any) {
    console.error("Error fetching report:", error.message);
    return null;
  }
}

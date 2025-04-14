
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  FileText, 
  Search, 
  FileUp, 
  Download, 
  Eye, 
  Filter, 
  BarChart4,
  PieChart,
  Users,
  PackageCheck,
  PlusCircle,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO, subMonths } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Report } from "@/types/staff";
import { 
  fetchReports, 
  createReport,
  fetchVolunteers,
  fetchBeneficiaries,
  fetchResources,
  fetchResourceAllocations,
  fetchBeneficiaryNeeds
} from "@/services/staffService";

// Form schema for report
const reportFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select a report type",
  }),
  description: z.string().optional(),
  parameters: z.object({
    timeFrame: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional()
  }).optional()
});

// Mock data for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ReportsManagement = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [viewingReport, setViewingReport] = useState(false);
  
  // Data for generating reports
  const [volunteers, setVolunteers] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [needs, setNeeds] = useState([]);
  
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      parameters: {
        timeFrame: "last3months",
        category: "all",
        status: "all"
      }
    },
  });

  // Fetch reports and other data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingReports(true);
      
      try {
        // Load reports
        const reportsData = await fetchReports();
        setReports(reportsData);
        
        // Load data for report generation
        const [volunteersData, beneficiariesData, resourcesData, allocationsData, needsData] = await Promise.all([
          fetchVolunteers(),
          fetchBeneficiaries(),
          fetchResources(),
          fetchResourceAllocations(),
          fetchBeneficiaryNeeds()
        ]);
        
        setVolunteers(volunteersData);
        setBeneficiaries(beneficiariesData);
        setResources(resourcesData);
        setAllocations(allocationsData);
        setNeeds(needsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load reports data"
        });
      } finally {
        setIsLoadingReports(false);
      }
    };
    
    loadData();
  }, []);

  // Reset form when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      form.reset({
        title: "",
        type: "",
        description: "",
        parameters: {
          timeFrame: "last3months",
          category: "all",
          status: "all"
        }
      });
    }
  }, [isDialogOpen, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof reportFormSchema>) => {
    setIsSubmitting(true);
    setIsGeneratingReport(true);
    
    try {
      // Generate report data based on type
      const generatedData = await generateReportData(data.type, data.parameters);
      
      // Create the report
      const reportData = {
        title: data.title,
        type: data.type,
        description: data.description || "",
        created_by: user?.id as string,
        data: generatedData,
        parameters: data.parameters || {}
      };
      
      const created = await createReport(reportData);
      if (created) {
        setReports([created, ...reports]);
        setActiveReport(created);
        setReportData(generatedData);
        setViewingReport(true);
      }
      
      setIsDialogOpen(false);
      
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully"
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report"
      });
    } finally {
      setIsSubmitting(false);
      setIsGeneratingReport(false);
    }
  };

  // Generate report data based on type and parameters
  const generateReportData = async (
    type: string, 
    parameters?: { timeFrame?: string; category?: string; status?: string }
  ) => {
    // Default to last 3 months if not specified
    const timeFrame = parameters?.timeFrame || "last3months";
    let startDate;
    
    switch (timeFrame) {
      case "last1month":
        startDate = subMonths(new Date(), 1);
        break;
      case "last6months":
        startDate = subMonths(new Date(), 6);
        break;
      case "last12months":
        startDate = subMonths(new Date(), 12);
        break;
      case "last3months":
      default:
        startDate = subMonths(new Date(), 3);
        break;
    }
    
    // Filter data based on date
    const filterByDate = (item: any) => {
      const itemDate = parseISO(item.created_at);
      return itemDate >= startDate;
    };
    
    // Generate report data based on type
    switch (type) {
      case "volunteer-activity": {
        // Count shifts by status
        const filteredShifts = []
          .filter(filterByDate);
        
        const statusCounts: Record<string, number> = {
          scheduled: 0,
          "in-progress": 0,
          completed: 0,
          cancelled: 0
        };
        
        filteredShifts.forEach((shift: any) => {
          if (statusCounts[shift.status] !== undefined) {
            statusCounts[shift.status]++;
          }
        });
        
        // Format for charts
        const pieData = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
          value
        }));
        
        // Mock volunteer hours data
        const barData = [
          { month: "Jan", hours: 120 },
          { month: "Feb", hours: 145 },
          { month: "Mar", hours: 168 },
          { month: "Apr", hours: 132 },
        ];
        
        return {
          totalVolunteers: volunteers.length,
          activeVolunteers: volunteers.filter((v: any) => v.isActive).length,
          totalShifts: filteredShifts.length,
          completedShifts: statusCounts.completed,
          statusDistribution: pieData,
          volunteerHours: barData
        };
      }
      
      case "beneficiary-needs": {
        // Filter needs by specified parameters
        const filteredNeeds = needs
          .filter(filterByDate)
          .filter((need: any) => {
            if (parameters?.category && parameters.category !== "all") {
              return need.category === parameters.category;
            }
            return true;
          })
          .filter((need: any) => {
            if (parameters?.status && parameters.status !== "all") {
              return need.status === parameters.status;
            }
            return true;
          });
        
        // Count needs by category
        const categoryCounts: Record<string, number> = {};
        filteredNeeds.forEach((need: any) => {
          if (!categoryCounts[need.category]) {
            categoryCounts[need.category] = 0;
          }
          categoryCounts[need.category]++;
        });
        
        // Count needs by status
        const statusCounts: Record<string, number> = {
          pending: 0,
          "in-progress": 0,
          fulfilled: 0,
          cancelled: 0
        };
        
        filteredNeeds.forEach((need: any) => {
          if (statusCounts[need.status] !== undefined) {
            statusCounts[need.status]++;
          }
        });
        
        // Count needs by priority
        const priorityCounts: Record<string, number> = {
          high: 0,
          medium: 0,
          low: 0
        };
        
        filteredNeeds.forEach((need: any) => {
          if (priorityCounts[need.priority] !== undefined) {
            priorityCounts[need.priority]++;
          }
        });
        
        // Format for charts
        const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
          name,
          value
        }));
        
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
          value
        }));
        
        const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));
        
        return {
          totalBeneficiaries: beneficiaries.length,
          activeBeneficiaries: beneficiaries.filter((b: any) => b.isActive).length,
          totalNeeds: filteredNeeds.length,
          fulfilledNeeds: statusCounts.fulfilled,
          pendingNeeds: statusCounts.pending,
          highPriorityNeeds: priorityCounts.high,
          categoryDistribution: categoryData,
          statusDistribution: statusData,
          priorityDistribution: priorityData
        };
      }
      
      case "resource-allocation": {
        // Filter allocations by date
        const filteredAllocations = allocations
          .filter(filterByDate);
        
        // Group allocations by resource
        const resourceAllocations: Record<string, number> = {};
        filteredAllocations.forEach((allocation: any) => {
          const resourceName = allocation.resource?.name || "Unknown";
          if (!resourceAllocations[resourceName]) {
            resourceAllocations[resourceName] = 0;
          }
          resourceAllocations[resourceName] += allocation.quantity;
        });
        
        // Filter resources by category
        const filteredResources = resources.filter((resource: any) => {
          if (parameters?.category && parameters.category !== "all") {
            return resource.category === parameters.category;
          }
          return true;
        });
        
        // Calculate total and allocated quantities by category
        const categoryInventory: Record<string, { total: number, allocated: number }> = {};
        filteredResources.forEach((resource: any) => {
          if (!categoryInventory[resource.category]) {
            categoryInventory[resource.category] = { total: 0, allocated: 0 };
          }
          categoryInventory[resource.category].total += resource.quantity;
          categoryInventory[resource.category].allocated += resource.allocated;
        });
        
        // Format for charts
        const pieData = Object.entries(resourceAllocations)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));
        
        const barData = Object.entries(categoryInventory).map(([category, data]) => ({
          category,
          total: data.total,
          allocated: data.allocated,
          available: data.total - data.allocated
        }));
        
        return {
          totalResources: filteredResources.length,
          totalQuantity: filteredResources.reduce((sum: number, r: any) => sum + r.quantity, 0),
          allocatedQuantity: filteredResources.reduce((sum: number, r: any) => sum + r.allocated, 0),
          totalAllocations: filteredAllocations.length,
          topAllocatedResources: pieData,
          inventoryByCategory: barData
        };
      }
      
      default:
        return null;
    }
  };

  // Filter reports based on type and search query
  const filteredReports = reports.filter(report => {
    // Filter by type
    if (filterType !== "all" && report.type !== filterType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.title.toLowerCase().includes(query) ||
        (report.description && report.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  // Handle generating new report
  const handleGenerateReport = () => {
    setIsDialogOpen(true);
  };

  // Handle viewing report
  const handleViewReport = async (report: Report) => {
    setActiveReport(report);
    setReportData(report.data);
    setViewingReport(true);
  };

  // Helper to render report type badge
  const getReportTypeBadge = (type: string) => {
    switch(type) {
      case "volunteer-activity":
        return <Badge className="bg-blue-500/20 text-blue-700">Volunteer Activity</Badge>;
      case "beneficiary-needs":
        return <Badge className="bg-green-500/20 text-green-700">Beneficiary Needs</Badge>;
      case "resource-allocation":
        return <Badge className="bg-purple-500/20 text-purple-700">Resource Allocation</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Helper to render the report content based on its type
  const renderReportContent = () => {
    if (!activeReport || !reportData) return null;
    
    switch(activeReport.type) {
      case "volunteer-activity":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{reportData.totalVolunteers}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.activeVolunteers} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{reportData.totalShifts}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.completedShifts} completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Time Frame</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeReport.parameters?.timeFrame === "last1month" && "1 Month"}
                    {activeReport.parameters?.timeFrame === "last3months" && "3 Months"}
                    {activeReport.parameters?.timeFrame === "last6months" && "6 Months"}
                    {activeReport.parameters?.timeFrame === "last12months" && "12 Months"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Report period
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shift Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of volunteer shifts by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Hours</CardTitle>
                  <CardDescription>
                    Monthly volunteer hours contributed
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.volunteerHours}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" name="Volunteer Hours" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case "beneficiary-needs":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalBeneficiaries}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.activeBeneficiaries} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalNeeds}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all categories
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fulfilled Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.fulfilledNeeds}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.pendingNeeds} pending
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.highPriorityNeeds}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Urgent needs
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>
                    Needs by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.categoryDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>
                    Needs by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>
                    Needs by priority level
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData.priorityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.priorityDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case "resource-allocation":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <PackageCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{reportData.totalResources}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Types of resources
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalQuantity}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.allocatedQuantity} allocated
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalAllocations}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resource allocation events
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Allocated Resources</CardTitle>
                  <CardDescription>
                    Most frequently allocated resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportData.topAllocatedResources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.topAllocatedResources.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                  <CardDescription>
                    Resource allocation by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.inventoryByCategory}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="allocated" name="Allocated" fill="#8884d8" />
                      <Bar dataKey="available" name="Available" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Report data cannot be displayed</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view reports on NGO operations
          </p>
        </div>

        {viewingReport && activeReport ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{activeReport.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getReportTypeBadge(activeReport.type)}
                  <span className="text-sm text-muted-foreground">
                    Generated on {formatDate(activeReport.created_at)}
                  </span>
                </div>
                {activeReport.description && (
                  <p className="text-muted-foreground mt-2">{activeReport.description}</p>
                )}
              </div>
              <Button variant="outline" onClick={() => setViewingReport(false)}>
                Back to Reports
              </Button>
            </div>
            
            {renderReportContent()}
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Report Library</CardTitle>
                    <CardDescription>
                      View and generate reports on NGO operations
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search reports..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="volunteer-activity">Volunteer Activity</SelectItem>
                        <SelectItem value="beneficiary-needs">Beneficiary Needs</SelectItem>
                        <SelectItem value="resource-allocation">Resource Allocation</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button onClick={handleGenerateReport}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="text-center py-4">Loading reports...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Generated</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                            <TableCell>{formatDate(report.created_at)}</TableCell>
                            <TableCell>
                              <div className="max-w-[300px] truncate" title={report.description}>
                                {report.description || "—"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5 text-blue-500" />
                    <CardTitle>Volunteer Activity</CardTitle>
                  </div>
                  <CardDescription>
                    Track volunteer shifts, hours, and participation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate reports on volunteer attendance, completed shifts, and total hours contributed.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => {
                    form.setValue("type", "volunteer-activity");
                    handleGenerateReport();
                  }}>
                    <BarChart4 className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-500" />
                    <CardTitle>Beneficiary Needs</CardTitle>
                  </div>
                  <CardDescription>
                    Analyze beneficiary needs and fulfillment rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate reports on beneficiary demographics, needs by category, and current fulfillment status.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => {
                    form.setValue("type", "beneficiary-needs");
                    handleGenerateReport();
                  }}>
                    <PieChart className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-purple-500" />
                    <CardTitle>Resource Allocation</CardTitle>
                  </div>
                  <CardDescription>
                    Review resource inventory and distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate reports on resource inventory, allocation trends, and distribution metrics.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => {
                    form.setValue("type", "resource-allocation");
                    handleGenerateReport();
                  }}>
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
        
        {/* Generate Report Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Create a new report based on NGO operational data
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter report title"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="volunteer-activity">Volunteer Activity</SelectItem>
                          <SelectItem value="beneficiary-needs">Beneficiary Needs</SelectItem>
                          <SelectItem value="resource-allocation">Resource Allocation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of data this report will analyze
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parameters.timeFrame"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Frame</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="last1month">Last Month</SelectItem>
                          <SelectItem value="last3months">Last 3 Months</SelectItem>
                          <SelectItem value="last6months">Last 6 Months</SelectItem>
                          <SelectItem value="last12months">Last 12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The time period this report will cover
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(form.watch("type") === "beneficiary-needs") && (
                  <FormField
                    control={form.control}
                    name="parameters.category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Filter (Optional)</FormLabel>
                        <Select 
                          value={field.value || "all"} 
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Housing">Housing</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Employment">Employment</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                            <SelectItem value="Childcare">Childcare</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Filter report data by specific need category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {(form.watch("type") === "resource-allocation") && (
                  <FormField
                    control={form.control}
                    name="parameters.category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Category Filter (Optional)</FormLabel>
                        <Select 
                          value={field.value || "all"} 
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Hygiene">Hygiene</SelectItem>
                            <SelectItem value="Medical">Medical</SelectItem>
                            <SelectItem value="Educational">Educational</SelectItem>
                            <SelectItem value="Household">Household</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Filter report data by specific resource category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter report description"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional context or notes about this report
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Generating..." : "Generate Report"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ReportsManagement;

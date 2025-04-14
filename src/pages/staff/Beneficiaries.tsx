import React, { useState, useEffect } from "react";
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
  DialogTitle, 
  DialogTrigger 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit, Search, X, ListPlus, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/types/auth";
import { BeneficiaryNeed } from "@/types/staff";
import { 
  fetchBeneficiaries,
  fetchBeneficiaryNeeds,
  createBeneficiaryNeed,
  updateBeneficiaryNeed
} from "@/services/staffService";

const needFormSchema = z.object({
  beneficiary_id: z.string({
    required_error: "Please select a beneficiary",
  }),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Please select a priority.",
  }),
  status: z.enum(["pending", "in-progress", "fulfilled", "cancelled"], {
    required_error: "Please select a status.",
  }),
  assigned_to: z.string().nullable().optional()
});

const BeneficiariesManagement = () => {
  const { user, getAllUsers } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<User[]>([]);
  const [needs, setNeeds] = useState<BeneficiaryNeed[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(true);
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("beneficiaries");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentNeed, setCurrentNeed] = useState<BeneficiaryNeed | null>(null);
  
  const form = useForm<z.infer<typeof needFormSchema>>({
    resolver: zodResolver(needFormSchema),
    defaultValues: {
      category: "",
      description: "",
      priority: "medium",
      status: "pending",
      assigned_to: null
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingBeneficiaries(true);
      setIsLoadingNeeds(true);
      
      const beneficiariesData = await fetchBeneficiaries();
      setBeneficiaries(beneficiariesData);
      setIsLoadingBeneficiaries(false);
      
      const needsData = await fetchBeneficiaryNeeds();
      setNeeds(needsData);
      setIsLoadingNeeds(false);
      
      const allUsers = await getAllUsers();
      setStaffUsers(allUsers.filter(u => u.role === 'staff'));
    };
    
    loadData();
  }, [getAllUsers]);

  useEffect(() => {
    if (isDialogOpen) {
      if (currentNeed) {
        form.reset({
          beneficiary_id: currentNeed.beneficiary_id,
          category: currentNeed.category,
          description: currentNeed.description,
          priority: currentNeed.priority,
          status: currentNeed.status,
          assigned_to: currentNeed.assigned_to
        });
      } else {
        form.reset({
          beneficiary_id: selectedBeneficiary || "",
          category: "",
          description: "",
          priority: "medium",
          status: "pending",
          assigned_to: null
        });
      }
    }
  }, [isDialogOpen, currentNeed, selectedBeneficiary, form]);

  const onSubmit = async (data: z.infer<typeof needFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (currentNeed) {
        const updated = await updateBeneficiaryNeed(currentNeed.id, data);
        if (updated) {
          const updatedNeeds = needs.map(n => 
            n.id === updated.id ? { 
              ...updated,
              beneficiary: currentNeed.beneficiary,
              staff: data.assigned_to 
                ? staffUsers.find(s => s.id === data.assigned_to)
                  ? { 
                      id: data.assigned_to, 
                      full_name: staffUsers.find(s => s.id === data.assigned_to)?.fullName || "" 
                    } 
                  : undefined
                : undefined
            } : n
          );
          setNeeds(updatedNeeds);
        }
      } else {
        const needData: Omit<BeneficiaryNeed, 'id' | 'created_at' | 'updated_at'> = {
          beneficiary_id: data.beneficiary_id,
          category: data.category,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assigned_to: data.assigned_to
        };
        
        const created = await createBeneficiaryNeed(needData);
        if (created) {
          const beneficiary = beneficiaries.find(b => b.id === created.beneficiary_id);
          const staffMember = data.assigned_to ? staffUsers.find(s => s.id === data.assigned_to) : undefined;
          
          const newNeed = {
            ...created,
            beneficiary: beneficiary ? {
              id: beneficiary.id,
              full_name: beneficiary.fullName,
              contact_info: beneficiary.contactInfo || null
            } : undefined,
            staff: staffMember && data.assigned_to ? {
              id: data.assigned_to,
              full_name: staffMember.fullName
            } : undefined
          };
          
          setNeeds([newNeed, ...needs]);
        }
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving need:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save beneficiary need"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNeeds = needs.filter(need => {
    if (filterStatus !== "all" && need.status !== filterStatus) {
      return false;
    }
    
    if (filterPriority !== "all" && need.priority !== filterPriority) {
      return false;
    }
    
    if (selectedBeneficiary && need.beneficiary_id !== selectedBeneficiary) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        need.category.toLowerCase().includes(query) ||
        need.description.toLowerCase().includes(query) ||
        (need.beneficiary?.full_name.toLowerCase().includes(query) || false)
      );
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700";
      case "in-progress":
        return "bg-blue-500/20 text-blue-700";
      case "fulfilled":
        return "bg-green-500/20 text-green-700";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high":
        return "bg-destructive/20 text-destructive";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700";
      case "low":
        return "bg-blue-500/20 text-blue-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  const handleAddNeed = (beneficiaryId?: string) => {
    if (beneficiaryId) {
      setSelectedBeneficiary(beneficiaryId);
    }
    setCurrentNeed(null);
    setIsDialogOpen(true);
  };

  const handleEditNeed = (need: BeneficiaryNeed) => {
    setCurrentNeed(need);
    setIsDialogOpen(true);
  };

  const clearFilters = () => {
    setSelectedBeneficiary(null);
    setFilterStatus("all");
    setFilterPriority("all");
    setSearchQuery("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Management</h1>
          <p className="text-muted-foreground">
            Manage beneficiaries and their needs assessment
          </p>
        </div>

        <Tabs defaultValue="beneficiaries" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="needs">Needs Assessment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beneficiaries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Beneficiary Directory</CardTitle>
                    <CardDescription>
                      View and manage beneficiary information
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search beneficiaries..."
                        className="pl-8 w-[200px] md:w-[260px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Beneficiary
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBeneficiaries ? (
                  <div className="text-center py-4">Loading beneficiaries...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beneficiaries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No beneficiaries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        beneficiaries
                          .filter(ben => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              ben.fullName.toLowerCase().includes(query) ||
                              (ben.contactInfo && ben.contactInfo.toLowerCase().includes(query))
                            );
                          })
                          .map((beneficiary) => (
                            <TableRow key={beneficiary.id}>
                              <TableCell className="font-medium">{beneficiary.fullName}</TableCell>
                              <TableCell>{beneficiary.contactInfo || "—"}</TableCell>
                              <TableCell>{formatDate(beneficiary.createdAt)}</TableCell>
                              <TableCell>
                                <Badge className={beneficiary.isActive ? 
                                  "bg-green-500/20 text-green-700" : 
                                  "bg-destructive/20 text-destructive"
                                }>
                                  {beneficiary.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mr-2"
                                  onClick={() => {
                                    handleAddNeed(beneficiary.id);
                                  }}
                                >
                                  <ListPlus className="mr-2 h-4 w-4" />
                                  Add Need
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mr-2"
                                  onClick={() => {
                                    setSelectedBeneficiary(beneficiary.id);
                                    setActiveTab("needs");
                                  }}
                                >
                                  View Needs
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Beneficiary",
                                      description: `Editing ${beneficiary.fullName}`,
                                    });
                                  }}
                                >
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Edit
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
          </TabsContent>
          
          <TabsContent value="needs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Beneficiary Needs Assessment</CardTitle>
                    <CardDescription>
                      Manage and track beneficiary needs
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search needs..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="fulfilled">Fulfilled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedBeneficiary || "all"} 
                      onValueChange={(value) => setSelectedBeneficiary(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by beneficiary" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Beneficiaries</SelectItem>
                        {beneficiaries.map((ben) => (
                          <SelectItem key={ben.id} value={ben.id}>
                            {ben.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(searchQuery || selectedBeneficiary || filterStatus !== "all" || filterPriority !== "all") && (
                      <Button variant="outline" size="icon" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button onClick={() => handleAddNeed()}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Need
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingNeeds ? (
                  <div className="text-center py-4">Loading needs assessment data...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNeeds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No needs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNeeds.map((need) => (
                          <TableRow key={need.id}>
                            <TableCell className="font-medium">
                              {need.beneficiary?.full_name || "Unknown"}
                            </TableCell>
                            <TableCell>{need.category}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={need.description}>
                                {need.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityBadge(need.priority)}>
                                {need.priority.charAt(0).toUpperCase() + need.priority.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(need.status)}>
                                {need.status.charAt(0).toUpperCase() + need.status.slice(1).replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{need.staff?.full_name || "Unassigned"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditNeed(need)}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
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
          </TabsContent>
        </Tabs>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentNeed ? "Edit Need" : "Add New Need"}</DialogTitle>
              <DialogDescription>
                {currentNeed 
                  ? "Update the details for this beneficiary need."
                  : "Create a new need assessment for a beneficiary."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="beneficiary_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmitting || !!currentNeed}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a beneficiary" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {beneficiaries.map((ben) => (
                            <SelectItem key={ben.id} value={ben.id}>
                              {ben.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Housing">Housing</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Employment">Employment</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="Transportation">Transportation</SelectItem>
                          <SelectItem value="Childcare">Childcare</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed description of the need"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide specific details about what the beneficiary needs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="fulfilled">Fulfilled</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To (Optional)</FormLabel>
                      <Select 
                        value={field.value || "unassigned"} 
                        onValueChange={(value) => field.onChange(value === "unassigned" ? null : value)}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {staffUsers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Staff member responsible for addressing this need
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
                    {isSubmitting ? "Saving..." : (currentNeed ? "Update Need" : "Create Need")}
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

export default BeneficiariesManagement;

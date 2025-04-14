
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
import { Plus, Filter, Save, Edit, ArrowUpDown, Package, Search, X, Package2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Resource, ResourceAllocation } from "@/types/staff";
import { 
  fetchResources, 
  fetchResourceAllocations, 
  createResource, 
  updateResource, 
  createResourceAllocation,
  fetchBeneficiaries
} from "@/services/staffService";
import { User } from "@/types/auth";

// Resource form schema
const resourceFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),
});

// Allocation form schema
const allocationFormSchema = z.object({
  resource_id: z.string({
    required_error: "Please select a resource",
  }),
  beneficiary_id: z.string({
    required_error: "Please select a beneficiary",
  }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

const ResourcesManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<User[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(true);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const resourceForm = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      description: "",
    },
  });
  
  const allocationForm = useForm<z.infer<typeof allocationFormSchema>>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });
  
  // Fetch resources, allocations, and beneficiaries
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingResources(true);
      setIsLoadingAllocations(true);
      
      const resourcesData = await fetchResources();
      setResources(resourcesData);
      setIsLoadingResources(false);
      
      const allocationsData = await fetchResourceAllocations();
      setAllocations(allocationsData);
      setIsLoadingAllocations(false);
      
      const beneficiariesData = await fetchBeneficiaries();
      setBeneficiaries(beneficiariesData);
    };
    
    loadData();
  }, []);
  
  // Reset resource form when dialog opens or closes
  useEffect(() => {
    if (isResourceDialogOpen) {
      if (currentResource) {
        resourceForm.reset({
          name: currentResource.name,
          category: currentResource.category,
          quantity: currentResource.quantity,
          unit: currentResource.unit,
          description: currentResource.description || "",
        });
      } else {
        resourceForm.reset({
          name: "",
          category: "",
          quantity: 0,
          unit: "",
          description: "",
        });
      }
    }
  }, [isResourceDialogOpen, currentResource, resourceForm]);
  
  // Handle resource form submission
  const onResourceSubmit = async (data: z.infer<typeof resourceFormSchema>) => {
    if (!user) return;
    
    setIsSubmittingResource(true);
    
    try {
      const resourceData = {
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        description: data.description || null,
        allocated: currentResource?.allocated || 0
      };
      
      if (currentResource) {
        // Update resource
        const updated = await updateResource(currentResource.id, resourceData);
        
        if (updated) {
          const updatedResources = resources.map(r => 
            r.id === updated.id ? updated : r
          );
          setResources(updatedResources);
        }
      } else {
        // Create new resource
        const created = await createResource(resourceData);
        
        if (created) {
          setResources([created, ...resources]);
        }
      }
      
      setIsResourceDialogOpen(false);
    } catch (error) {
      console.error("Error saving resource:", error);
    } finally {
      setIsSubmittingResource(false);
    }
  };
  
  // Handle allocation form submission
  const onAllocationSubmit = async (data: z.infer<typeof allocationFormSchema>) => {
    if (!user) return;
    
    setIsSubmittingAllocation(true);
    
    try {
      const allocationData = {
        resource_id: data.resource_id,
        beneficiary_id: data.beneficiary_id,
        quantity: data.quantity,
        notes: data.notes || null,
        allocated_by: user.id,
        allocated_date: new Date().toISOString()
      };
      
      const created = await createResourceAllocation(allocationData);
      
      if (created) {
        // Find resource and beneficiary to attach to the allocation for display
        const resource = resources.find(r => r.id === created.resource_id);
        const beneficiary = beneficiaries.find(b => b.id === created.beneficiary_id);
        
        const newAllocation = {
          ...created,
          resource: resource ? {
            name: resource.name,
            unit: resource.unit
          } : undefined,
          beneficiary: beneficiary ? {
            full_name: beneficiary.fullName
          } : undefined
        };
        
        // Update the allocations list and update the resource's allocated amount
        setAllocations([newAllocation, ...allocations]);
        
        // Update the resource's allocated amount
        if (resource) {
          const updatedResource = {
            ...resource,
            allocated: resource.allocated + data.quantity
          };
          
          const updatedResources = resources.map(r => 
            r.id === resource.id ? updatedResource : r
          );
          
          setResources(updatedResources);
        }
      }
      
      setIsAllocationDialogOpen(false);
    } catch (error) {
      console.error("Error creating allocation:", error);
    } finally {
      setIsSubmittingAllocation(false);
    }
  };
  
  // Filter resources based on category and search query
  const filteredResources = resources.filter(resource => {
    // Filter by category
    if (filterCategory !== "all" && resource.category !== filterCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        resource.name.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query) ||
        (resource.description && resource.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Get unique categories for the filter
  const categories = Array.from(new Set(resources.map(r => r.category)));
  
  // Handle adding new resource
  const handleAddResource = () => {
    setCurrentResource(null);
    setIsResourceDialogOpen(true);
  };
  
  // Handle editing resource
  const handleEditResource = (resource: Resource) => {
    setCurrentResource(resource);
    setIsResourceDialogOpen(true);
  };
  
  // Handle allocation
  const handleAllocate = () => {
    allocationForm.reset({
      resource_id: "",
      beneficiary_id: "",
      quantity: 1,
      notes: "",
    });
    setIsAllocationDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground">
            Manage inventory and allocate resources to beneficiaries
          </p>
        </div>

        <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
          </TabsList>
          
          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                      View and manage available resources
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-8 w-[200px] md:w-[260px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button onClick={handleAddResource}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingResources ? (
                  <div className="text-center py-4">Loading resources...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No resources found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredResources.map((resource) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium">{resource.name}</TableCell>
                            <TableCell>{resource.category}</TableCell>
                            <TableCell>{resource.quantity}</TableCell>
                            <TableCell>{resource.unit}</TableCell>
                            <TableCell>{resource.description || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => handleEditResource(resource)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Package2 className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleAllocate}>
                  <Package className="mr-2 h-4 w-4" />
                  Allocate Resources
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Allocations Tab */}
          <TabsContent value="allocations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Resource Allocations</CardTitle>
                    <CardDescription>
                      View and manage resource allocations to beneficiaries
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search allocations..."
                        className="pl-8 w-[200px] md:w-[260px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAllocations ? (
                  <div className="text-center py-4">Loading allocations...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Allocated Date</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No allocations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        allocations.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell className="font-medium">{allocation.resource?.name}</TableCell>
                            <TableCell>{allocation.beneficiary?.full_name}</TableCell>
                            <TableCell>{allocation.quantity}</TableCell>
                            <TableCell>{formatDate(allocation.allocated_date)}</TableCell>
                            <TableCell>{allocation.notes || "—"}</TableCell>
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
        
        {/* Resource Dialog */}
        <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{currentResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
              <DialogDescription>
                {currentResource 
                  ? "Update the details for this resource."
                  : "Add a new resource to the inventory."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...resourceForm}>
              <form onSubmit={resourceForm.handleSubmit(onResourceSubmit)} className="space-y-4">
                <FormField
                  control={resourceForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter resource name"
                          {...field}
                          disabled={isSubmittingResource}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={resourceForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter category"
                          {...field}
                          disabled={isSubmittingResource}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={resourceForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            disabled={isSubmittingResource}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resourceForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter unit"
                            {...field}
                            disabled={isSubmittingResource}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={resourceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter description"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmittingResource}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsResourceDialogOpen(false)} disabled={isSubmittingResource}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingResource}>
                    {isSubmittingResource ? "Saving..." : (currentResource ? "Update Resource" : "Create Resource")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Allocation Dialog */}
        <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Allocate Resource</DialogTitle>
              <DialogDescription>
                Allocate resources to a beneficiary.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...allocationForm}>
              <form onSubmit={allocationForm.handleSubmit(onAllocationSubmit)} className="space-y-4">
                <FormField
                  control={allocationForm.control}
                  name="resource_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmittingAllocation}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a resource" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resources.map((resource) => (
                            <SelectItem key={resource.id} value={resource.id}>
                              {resource.name} ({resource.quantity} {resource.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="beneficiary_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmittingAllocation}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a beneficiary" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {beneficiaries.map((beneficiary) => (
                            <SelectItem key={beneficiary.id} value={beneficiary.id}>
                              {beneficiary.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          disabled={isSubmittingAllocation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={allocationForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter notes"
                          className="min-h-[80px]"
                          {...field}
                          disabled={isSubmittingAllocation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAllocationDialogOpen(false)} disabled={isSubmittingAllocation}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingAllocation}>
                    {isSubmittingAllocation ? "Processing..." : "Allocate Resource"}
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

export default ResourcesManagement;

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit, Search, X, PackagePlus, Package, PackageCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/types/auth";
import { Resource, ResourceAllocation } from "@/types/staff";
import { 
  fetchResources, 
  createResource,
  updateResource,
  fetchResourceAllocations,
  createResourceAllocation,
  fetchBeneficiaries
} from "@/services/staffService";

const resourceFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  quantity: z.coerce.number().min(0, {
    message: "Quantity must be a positive number",
  }),
  unit: z.string().min(1, {
    message: "Unit is required",
  }),
  description: z.string().optional(),
});

const allocationFormSchema = z.object({
  resource_id: z.string({
    required_error: "Please select a resource",
  }),
  beneficiary_id: z.string({
    required_error: "Please select a beneficiary",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1",
  }),
  notes: z.string().optional()
});

const ResourcesManagement = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<User[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const resourceForm = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      description: ""
    },
  });
  
  const allocationForm = useForm<z.infer<typeof allocationFormSchema>>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      quantity: 1,
      notes: ""
    },
  });

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

  useEffect(() => {
    if (isResourceDialogOpen) {
      if (currentResource) {
        resourceForm.reset({
          name: currentResource.name,
          category: currentResource.category,
          quantity: currentResource.quantity,
          unit: currentResource.unit,
          description: currentResource.description || ""
        });
      } else {
        resourceForm.reset({
          name: "",
          category: "",
          quantity: 0,
          unit: "",
          description: ""
        });
      }
    }
  }, [isResourceDialogOpen, currentResource, resourceForm]);

  useEffect(() => {
    if (isAllocationDialogOpen && selectedResource) {
      allocationForm.reset({
        resource_id: selectedResource.id,
        beneficiary_id: "",
        quantity: 1,
        notes: ""
      });
    }
  }, [isAllocationDialogOpen, selectedResource, allocationForm]);

  const onSubmit = async (data: z.infer<typeof resourceFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (currentResource) {
        const updated = await updateResource(currentResource.id, data);
        if (updated) {
          setResources(resources.map(r => r.id === updated.id ? updated : r));
        }
      } else {
        const resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'> = {
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          unit: data.unit,
          description: data.description || null,
          allocated: 0
        };
        
        const created = await createResource(resourceData);
        if (created) {
          setResources([created, ...resources]);
        }
      }
      
      setIsResourceDialogOpen(false);
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resource"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitAllocation = async (data: z.infer<typeof allocationFormSchema>) => {
    setIsSubmittingAllocation(true);
    
    try {
      const allocationData: Omit<ResourceAllocation, 'id'> = {
        resource_id: data.resource_id,
        beneficiary_id: data.beneficiary_id,
        quantity: data.quantity,
        notes: data.notes || null,
        allocated_by: user?.id as string,
        allocated_date: new Date().toISOString()
      };
      
      const created = await createResourceAllocation(allocationData);
      if (created) {
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
        
        setAllocations([newAllocation, ...allocations]);
        
        if (resource) {
          const updatedResource = {
            ...resource,
            allocated: resource.allocated + data.quantity
          };
          setResources(resources.map(r => r.id === resource.id ? updatedResource : r));
        }
      }
      
      setIsAllocationDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating allocation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create allocation"
      });
    } finally {
      setIsSubmittingAllocation(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    if (selectedCategory && resource.category !== selectedCategory) {
      return false;
    }
    
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

  const categories = [...new Set(resources.map(r => r.category))];
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  };

  const handleAddResource = () => {
    setCurrentResource(null);
    setIsResourceDialogOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setCurrentResource(resource);
    setIsResourceDialogOpen(true);
  };

  const handleAllocateResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsAllocationDialogOpen(true);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const getAvailableQuantity = (resource: Resource) => {
    return resource.quantity - resource.allocated;
  };

  const getAllocationPercentage = (resource: Resource) => {
    if (resource.quantity === 0) return 0;
    return Math.min(100, Math.round((resource.allocated / resource.quantity) * 100));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground">
            Manage inventory and resource allocations
          </p>
        </div>

        <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Resource Inventory</CardTitle>
                    <CardDescription>
                      Manage inventory resources and stock levels
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select 
                      value={selectedCategory || ""}
                      onValueChange={(value) => setSelectedCategory(value || null)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(searchQuery || selectedCategory) && (
                      <Button variant="outline" size="icon" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button onClick={handleAddResource}>
                      <PackagePlus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingResources ? (
                  <div className="text-center py-4">Loading resources...</div>
                ) : (
                  <div className="space-y-6">
                    {filteredResources.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        No resources found
                      </div>
                    ) : (
                      filteredResources.map((resource) => {
                        const availableQuantity = getAvailableQuantity(resource);
                        const allocationPercentage = getAllocationPercentage(resource);
                        
                        return (
                          <div key={resource.id} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Package className="h-5 w-5 text-primary" />
                                  <h3 className="font-semibold text-lg">{resource.name}</h3>
                                  <Badge variant="outline" className="ml-2">
                                    {resource.category}
                                  </Badge>
                                </div>
                                {resource.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {resource.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-6 mt-3">
                                  <div>
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <div className="font-semibold">
                                      {resource.quantity} {resource.unit}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-sm text-muted-foreground">Allocated</span>
                                    <div className="font-semibold">
                                      {resource.allocated} {resource.unit}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-sm text-muted-foreground">Available</span>
                                    <div className={`font-semibold ${availableQuantity <= 0 ? 'text-destructive' : ''}`}>
                                      {availableQuantity} {resource.unit}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditResource(resource)}
                                >
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={availableQuantity <= 0}
                                  onClick={() => handleAllocateResource(resource)}
                                >
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Allocate
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Allocation</span>
                                <span>{allocationPercentage}%</span>
                              </div>
                              <Progress value={allocationPercentage} className="h-2" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="allocations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Resource Allocations</CardTitle>
                    <CardDescription>
                      View resource allocations to beneficiaries
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
                    <Button onClick={() => {
                      setSelectedResource(null);
                      setIsAllocationDialogOpen(true);
                    }}>
                      <PackageCheck className="mr-2 h-4 w-4" />
                      New Allocation
                    </Button>
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
                        <TableHead>Allocated By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No allocations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        allocations
                          .filter(allocation => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              (allocation.resource?.name.toLowerCase().includes(query) || false) ||
                              (allocation.beneficiary?.full_name.toLowerCase().includes(query) || false) ||
                              (allocation.notes && allocation.notes.toLowerCase().includes(query))
                            );
                          })
                          .map((allocation) => (
                            <TableRow key={allocation.id}>
                              <TableCell className="font-medium">
                                {allocation.resource?.name || "Unknown Resource"}
                              </TableCell>
                              <TableCell>
                                {allocation.beneficiary?.full_name || "Unknown Beneficiary"}
                              </TableCell>
                              <TableCell>
                                {allocation.quantity} {allocation.resource?.unit || "units"}
                              </TableCell>
                              <TableCell>
                                {user?.fullName || "Staff Member"}
                              </TableCell>
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
              <form onSubmit={resourceForm.handleSubmit(onSubmit)} className="space-y-4">
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
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={resourceForm.control}
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
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Hygiene">Hygiene</SelectItem>
                            <SelectItem value="Medical">Medical</SelectItem>
                            <SelectItem value="Educational">Educational</SelectItem>
                            <SelectItem value="Household">Household</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="items">Items</SelectItem>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="packs">Packs</SelectItem>
                            <SelectItem value="boxes">Boxes</SelectItem>
                            <SelectItem value="sets">Sets</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="pairs">Pairs</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={resourceForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          placeholder="Enter quantity"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Total amount of this resource available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={resourceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter resource description"
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsResourceDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (currentResource ? "Update Resource" : "Create Resource")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Allocate Resource</DialogTitle>
              <DialogDescription>
                Allocate resources to a beneficiary.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...allocationForm}>
              <form onSubmit={allocationForm.handleSubmit(onSubmitAllocation)} className="space-y-4">
                <FormField
                  control={allocationForm.control}
                  name="resource_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          const resource = resources.find(r => r.id === value);
                          if (resource) {
                            setSelectedResource(resource);
                          }
                        }}
                        disabled={isSubmitting || !!selectedResource}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resource" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resources
                            .filter(r => getAvailableQuantity(r) > 0)
                            .map((resource) => (
                              <SelectItem key={resource.id} value={resource.id}>
                                {resource.name} ({getAvailableQuantity(resource)} {resource.unit} available)
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
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select beneficiary" />
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
                  control={allocationForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max={selectedResource ? getAvailableQuantity(selectedResource) : undefined}
                          placeholder="Enter quantity"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {selectedResource && (
                        <FormDescription>
                          Maximum available: {getAvailableQuantity(selectedResource)} {selectedResource.unit}
                        </FormDescription>
                      )}
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
                          placeholder="Enter any notes for this allocation"
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAllocationDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Allocating..." : "Allocate Resource"}
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

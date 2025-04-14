
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
import { Calendar, CalendarPlus, Filter, FileEdit, Search, UserPlus, X, UserCheck, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { User } from "@/types/auth";
import { VolunteerShift } from "@/types/staff";
import { fetchVolunteers, fetchVolunteerShifts, createVolunteerShift, updateVolunteerShift } from "@/services/staffService";

// Form schema for volunteer shift
const shiftFormSchema = z.object({
  volunteer_id: z.string({
    required_error: "Please select a volunteer",
  }),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  start_time: z.date({
    required_error: "Start time is required.",
  }),
  end_time: z.date({
    required_error: "End time is required.",
  }).refine(date => date, {
    message: "End time is required."
  }),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled", "in-progress"], {
    required_error: "Please select a status.",
  })
});

const VolunteersManagement = () => {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(true);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("volunteers");
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentShift, setCurrentShift] = useState<VolunteerShift | null>(null);
  
  const form = useForm<z.infer<typeof shiftFormSchema>>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      title: "",
      status: "scheduled",
    },
  });

  // Fetch volunteers and shifts
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingVolunteers(true);
      setIsLoadingShifts(true);
      
      const volunteersData = await fetchVolunteers();
      setVolunteers(volunteersData);
      setIsLoadingVolunteers(false);
      
      const shiftsData = await fetchVolunteerShifts();
      setShifts(shiftsData);
      setIsLoadingShifts(false);
    };
    
    loadData();
  }, []);

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (isDialogOpen) {
      if (currentShift) {
        // Edit mode: Pre-fill form with shift data
        form.reset({
          volunteer_id: currentShift.volunteer_id,
          title: currentShift.title,
          start_time: parseISO(currentShift.start_time),
          end_time: parseISO(currentShift.end_time),
          location: currentShift.location || undefined,
          description: currentShift.description || undefined,
          status: currentShift.status,
        });
      } else {
        // Create mode: Reset form to defaults
        form.reset({
          title: "",
          status: "scheduled",
        });
      }
    }
  }, [isDialogOpen, currentShift, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof shiftFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Convert dates to ISO strings
      const shiftData: Omit<VolunteerShift, 'id' | 'created_at' | 'updated_at'> = {
        volunteer_id: data.volunteer_id,
        title: data.title,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        location: data.location || null,
        description: data.description || null,
        status: data.status,
        created_by: user?.id as string, // Staff member creating the shift
      };
      
      if (currentShift) {
        // Update existing shift
        const updated = await updateVolunteerShift(currentShift.id, shiftData);
        if (updated) {
          // Refresh shifts list
          const updatedShifts = shifts.map(s => 
            s.id === updated.id ? { ...updated, volunteer: currentShift.volunteer } : s
          );
          setShifts(updatedShifts);
        }
      } else {
        // Create new shift
        const created = await createVolunteerShift(shiftData);
        if (created) {
          // Find volunteer to attach to the shift for display
          const volunteer = volunteers.find(v => v.id === created.volunteer_id);
          const newShift = {
            ...created,
            volunteer: volunteer ? {
              id: volunteer.id,
              full_name: volunteer.fullName,
              contact_info: volunteer.contactInfo || null,
              skills: volunteer.additionalInfo?.skills as string[] || null
            } : undefined
          };
          
          setShifts([newShift, ...shifts]);
        }
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save volunteer shift"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter shifts based on selected status and search query
  const filteredShifts = shifts.filter(shift => {
    // Filter by status
    if (filterStatus !== "all" && shift.status !== filterStatus) {
      return false;
    }
    
    // Filter by volunteer
    if (selectedVolunteer && shift.volunteer_id !== selectedVolunteer) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        shift.title.toLowerCase().includes(query) ||
        shift.volunteer?.full_name.toLowerCase().includes(query) ||
        (shift.location && shift.location.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Helper for showing status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-700";
      case "completed":
        return "bg-green-500/20 text-green-700";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      case "in-progress":
        return "bg-amber-500/20 text-amber-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  // Helper to format date
  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  };

  // Handle adding new shift
  const handleAddShift = () => {
    setCurrentShift(null);
    setIsDialogOpen(true);
  };

  // Handle editing shift
  const handleEditShift = (shift: VolunteerShift) => {
    setCurrentShift(shift);
    setIsDialogOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedVolunteer(null);
    setFilterStatus("all");
    setSearchQuery("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Management</h1>
          <p className="text-muted-foreground">
            Manage volunteers and their shift schedules
          </p>
        </div>

        <Tabs defaultValue="volunteers" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
          </TabsList>
          
          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Volunteer Directory</CardTitle>
                    <CardDescription>
                      View and manage volunteer information
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search volunteers..."
                        className="pl-8 w-[200px] md:w-[260px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Volunteer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingVolunteers ? (
                  <div className="text-center py-4">Loading volunteers...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volunteers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No volunteers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        volunteers
                          .filter(vol => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              vol.fullName.toLowerCase().includes(query) ||
                              (vol.contactInfo && vol.contactInfo.toLowerCase().includes(query))
                            );
                          })
                          .map((volunteer) => (
                            <TableRow key={volunteer.id}>
                              <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                              <TableCell>{volunteer.contactInfo || "—"}</TableCell>
                              <TableCell>
                                {volunteer.additionalInfo?.skills ? (
                                  <div className="flex flex-wrap gap-1">
                                    {(volunteer.additionalInfo.skills as string[]).map(skill => (
                                      <Badge key={skill} variant="outline">{skill}</Badge>
                                    ))}
                                  </div>
                                ) : "—"}
                              </TableCell>
                              <TableCell>{volunteer.additionalInfo?.availability || "—"}</TableCell>
                              <TableCell>
                                <Badge className={volunteer.isActive ? 
                                  "bg-green-500/20 text-green-700" : 
                                  "bg-destructive/20 text-destructive"
                                }>
                                  {volunteer.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mr-2"
                                  onClick={() => {
                                    setSelectedVolunteer(volunteer.id);
                                    setActiveTab("shifts");
                                  }}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Shifts
                                </Button>
                                <Button variant="outline" size="sm">
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
          
          {/* Shifts Tab */}
          <TabsContent value="shifts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Volunteer Shifts</CardTitle>
                    <CardDescription>
                      Schedule and manage volunteer shifts
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search shifts..."
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
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedVolunteer || ""}
                      onValueChange={(value) => setSelectedVolunteer(value || null)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by volunteer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Volunteers</SelectItem>
                        {volunteers.map((volunteer) => (
                          <SelectItem key={volunteer.id} value={volunteer.id}>
                            {volunteer.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(searchQuery || selectedVolunteer || filterStatus !== "all") && (
                      <Button variant="outline" size="icon" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button onClick={handleAddShift}>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Add Shift
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingShifts ? (
                  <div className="text-center py-4">Loading shifts...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Volunteer</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShifts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No shifts found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredShifts.map((shift) => (
                          <TableRow key={shift.id}>
                            <TableCell className="font-medium">
                              {shift.volunteer?.full_name || "Unknown"}
                            </TableCell>
                            <TableCell>{shift.title}</TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">{formatDateTime(shift.start_time)}</div>
                                <div className="text-xs text-muted-foreground">to</div>
                                <div className="text-sm">{formatDateTime(shift.end_time)}</div>
                              </div>
                            </TableCell>
                            <TableCell>{shift.location || "—"}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(shift.status)}>
                                {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditShift(shift)}
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
        
        {/* Add/Edit Shift Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentShift ? "Edit Shift" : "Add New Shift"}</DialogTitle>
              <DialogDescription>
                {currentShift 
                  ? "Update the details for this volunteer shift."
                  : "Create a new shift for a volunteer."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="volunteer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volunteer</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a volunteer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {volunteers.map((volunteer) => (
                            <SelectItem key={volunteer.id} value={volunteer.id}>
                              {volunteer.fullName}
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter shift title"
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
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  const current = field.value || new Date();
                                  date.setHours(current.getHours());
                                  date.setMinutes(current.getMinutes());
                                  field.onChange(date);
                                }
                              }}
                              disabled={isSubmitting}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <Input
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const newDate = field.value ? new Date(field.value) : new Date();
                                  newDate.setHours(hours);
                                  newDate.setMinutes(minutes);
                                  field.onChange(newDate);
                                }}
                                disabled={isSubmitting}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  const current = field.value || new Date();
                                  date.setHours(current.getHours());
                                  date.setMinutes(current.getMinutes());
                                  field.onChange(date);
                                }
                              }}
                              disabled={isSubmitting}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <Input
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const newDate = field.value ? new Date(field.value) : new Date();
                                  newDate.setHours(hours);
                                  newDate.setMinutes(minutes);
                                  field.onChange(newDate);
                                }}
                                disabled={isSubmitting}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter shift location"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Where the volunteer should report for this shift
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter shift description and instructions"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional details and instructions for the volunteer
                      </FormDescription>
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
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (currentShift ? "Update Shift" : "Create Shift")}
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

export default VolunteersManagement;


import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileEdit, 
  Search, 
  X, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  AlertCircle,
  PlusCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { User } from "@/types/auth";
import { StaffTask } from "@/types/staff";
import { 
  fetchStaffTasks, 
  createStaffTask,
  updateStaffTask
} from "@/services/staffService";

// Form schema for task
const taskFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Please select a priority.",
  }),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"], {
    required_error: "Please select a status.",
  }),
  due_date: z.date().nullable().optional(),
  assigned_to: z.string().nullable().optional()
});

const TasksManagement = () => {
  const { user, getAllUsers } = useAuth();
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTask, setCurrentTask] = useState<StaffTask | null>(null);
  
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      due_date: null,
      assigned_to: null
    },
  });

  // Fetch tasks and staff users
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingTasks(true);
      
      const tasksData = await fetchStaffTasks();
      setTasks(tasksData);
      setIsLoadingTasks(false);
      
      const allUsers = await getAllUsers();
      setStaffUsers(allUsers.filter(u => u.role === 'staff'));
    };
    
    loadData();
  }, [getAllUsers]);

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (isDialogOpen) {
      if (currentTask) {
        // Edit mode: Pre-fill form with task data
        form.reset({
          title: currentTask.title,
          description: currentTask.description,
          priority: currentTask.priority,
          status: currentTask.status,
          due_date: currentTask.due_date ? parseISO(currentTask.due_date) : null,
          assigned_to: currentTask.assigned_to
        });
      } else {
        // Create mode: Reset form to defaults
        form.reset({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
          due_date: null,
          assigned_to: null
        });
      }
    }
  }, [isDialogOpen, currentTask, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof taskFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Format the due date if it exists
      const formattedDueDate = data.due_date ? data.due_date.toISOString() : null;
      
      if (currentTask) {
        // Update existing task
        const updated = await updateStaffTask(currentTask.id, {
          ...data,
          due_date: formattedDueDate
        });
        
        if (updated) {
          // Refresh tasks list
          const updatedTasks = tasks.map(t => 
            t.id === updated.id ? { 
              ...updated,
              staff: data.assigned_to 
                ? staffUsers.find(s => s.id === data.assigned_to)
                  ? { 
                      full_name: staffUsers.find(s => s.id === data.assigned_to)?.fullName || "" 
                    } 
                  : undefined
                : undefined
            } : t
          );
          setTasks(updatedTasks);
        }
      } else {
        // Create new task with all required fields
        const taskData: Omit<StaffTask, 'id' | 'created_at' | 'updated_at'> = {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: formattedDueDate,
          assigned_to: data.assigned_to,
          created_by: user?.id as string // Staff member creating the task
        };
        
        const created = await createStaffTask(taskData);
        if (created) {
          // Find staff member if assigned
          const staffMember = data.assigned_to ? staffUsers.find(s => s.id === data.assigned_to) : undefined;
          
          const newTask = {
            ...created,
            staff: staffMember && data.assigned_to ? {
              full_name: staffMember.fullName
            } : undefined
          };
          
          setTasks([newTask, ...tasks]);
        }
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save task"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks based on filters and search query
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filterStatus !== "all" && task.status !== filterStatus) {
      return false;
    }
    
    // Filter by priority
    if (filterPriority !== "all" && task.priority !== filterPriority) {
      return false;
    }
    
    // Filter by assignee
    if (filterAssignee !== "all") {
      if (filterAssignee === "unassigned" && task.assigned_to !== null) {
        return false;
      } else if (filterAssignee !== "unassigned" && task.assigned_to !== filterAssignee) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.staff?.full_name && task.staff.full_name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Helper for showing status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700";
      case "in-progress":
        return "bg-blue-500/20 text-blue-700";
      case "completed":
        return "bg-green-500/20 text-green-700";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Helper for showing priority badge
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
  
  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  // Handle adding new task
  const handleAddTask = () => {
    setCurrentTask(null);
    setIsDialogOpen(true);
  };

  // Handle editing task
  const handleEditTask = (task: StaffTask) => {
    setCurrentTask(task);
    setIsDialogOpen(true);
  };

  // Handle marking task as completed
  const handleCompleteTask = async (task: StaffTask) => {
    try {
      const updated = await updateStaffTask(task.id, { status: "completed" });
      if (updated) {
        // Refresh tasks list
        const updatedTasks = tasks.map(t => 
          t.id === updated.id ? { ...updated, staff: task.staff } : t
        );
        setTasks(updatedTasks);
        
        toast({
          title: "Task completed",
          description: "Task has been marked as completed"
        });
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete task"
      });
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterAssignee("all");
    setSearchQuery("");
  };

  // Check if task is overdue
  const isOverdue = (task: StaffTask) => {
    if (!task.due_date || task.status === "completed" || task.status === "cancelled") return false;
    const dueDate = parseISO(task.due_date);
    return dueDate < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Create, assign, and manage staff tasks
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Staff Tasks</CardTitle>
                <CardDescription>
                  View and manage tasks for staff members
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tasks..."
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
                    <SelectItem value="completed">Completed</SelectItem>
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
                  value={filterAssignee} 
                  onValueChange={setFilterAssignee}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staffUsers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterAssignee !== "all") && (
                  <Button variant="outline" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <Button onClick={handleAddTask}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
              <div className="text-center py-4">Loading tasks...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id} className={isOverdue(task) ? "bg-destructive/10" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {task.priority === "high" && isOverdue(task) && (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                            {task.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={task.description}>
                            {task.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(task.status)}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={isOverdue(task) ? "text-destructive font-medium" : ""}>
                            {task.due_date ? formatDate(task.due_date) : "No due date"}
                          </div>
                        </TableCell>
                        <TableCell>{task.staff?.full_name || "Unassigned"}</TableCell>
                        <TableCell className="text-right">
                          {task.status !== "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleCompleteTask(task)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTask(task)}
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
        
        {/* Add/Edit Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentTask ? "Edit Task" : "Create Task"}</DialogTitle>
              <DialogDescription>
                {currentTask 
                  ? "Update the details for this task."
                  : "Create a new task for staff members."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter task title"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed task description"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide specific details about what needs to be done
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
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date (Optional)</FormLabel>
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
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={isSubmitting}
                              initialFocus
                            />
                            {field.value && (
                              <div className="p-3 border-t border-border">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => field.onChange(null)}
                                  disabled={isSubmitting}
                                >
                                  Clear date
                                </Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When this task should be completed by
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To (Optional)</FormLabel>
                        <Select 
                          value={field.value || ""} 
                          onValueChange={(value) => field.onChange(value || null)}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to staff member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {staffUsers.map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Staff member responsible for this task
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (currentTask ? "Update Task" : "Create Task")}
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

export default TasksManagement;

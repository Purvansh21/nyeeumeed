
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, User, Calendar, FileText, BarChart2, ClipboardList, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserType } from "@/types/auth";

const StaffDashboard = () => {
  const { user, getAllUsers } = useAuth();
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  // Count volunteers and beneficiaries
  const volunteerCount = allUsers.filter(u => u.role === "volunteer").length;
  const beneficiaryCount = allUsers.filter(u => u.role === "beneficiary").length;
  const activeVolunteers = allUsers.filter(u => u.role === "volunteer" && u.isActive).length;

  // Mock data for pending tasks
  const pendingTasks = [
    { id: 1, title: "Review volunteer applications", dueDate: "Apr 18, 2025", priority: "High" },
    { id: 2, title: "Update resource inventory", dueDate: "Apr 20, 2025", priority: "Medium" },
    { id: 3, title: "Process beneficiary requests", dueDate: "Apr 22, 2025", priority: "High" },
    { id: 4, title: "Prepare monthly report", dueDate: "Apr 30, 2025", priority: "Medium" },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    { id: 1, title: "Community Outreach Program", date: "Apr 25, 2025", volunteers: 8, location: "City Park" },
    { id: 2, title: "Training Workshop", date: "May 2, 2025", volunteers: 5, location: "Main Office" },
    { id: 3, title: "Resource Distribution", date: "May 10, 2025", volunteers: 12, location: "Community Center" },
    { id: 4, title: "Fundraising Event", date: "May 15, 2025", volunteers: 10, location: "Convention Hall" },
  ];

  // Mock data for recent beneficiary requests
  const recentRequests = [
    { id: 1, name: "John Doe", type: "Food Assistance", date: "Apr 14, 2025", status: "pending" },
    { id: 2, name: "Mary Smith", type: "Housing Support", date: "Apr 13, 2025", status: "approved" },
    { id: 3, name: "Robert Jones", type: "Medical Aid", date: "Apr 12, 2025", status: "approved" },
    { id: 4, name: "Sarah Williams", type: "Education Support", date: "Apr 11, 2025", status: "rejected" },
    { id: 5, name: "David Brown", type: "Legal Assistance", date: "Apr 10, 2025", status: "pending" },
  ];

  // Mock data for resources
  const resources = [
    { id: 1, name: "Food Packages", available: 75, allocated: 25, total: 100 },
    { id: 2, name: "Hygiene Kits", available: 45, allocated: 55, total: 100 },
    { id: 3, name: "School Supplies", available: 60, allocated: 20, total: 80 },
    { id: 4, name: "Medical Supplies", available: 30, allocated: 70, total: 100 },
  ];

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return "bg-green-500/20 text-green-700";
      case "pending":
        return "bg-yellow-500/20 text-yellow-700";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
          
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}. Manage your NGO operations here.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{volunteerCount}</div>
                  <div className="flex items-center pt-1">
                    <span className="text-xs text-muted-foreground">
                      {activeVolunteers} active
                    </span>
                    <span className="mx-2 text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {volunteerCount - activeVolunteers} inactive
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beneficiaryCount}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Individuals receiving assistance
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Events scheduled this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTasks.length}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Tasks requiring attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                  <CardDescription>
                    Tasks that need your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-start gap-4">
                        <div className={`rounded-full p-2 ${
                          task.priority === "High" 
                            ? "bg-destructive/10" 
                            : task.priority === "Medium"
                            ? "bg-yellow-500/10"
                            : "bg-muted"
                        }`}>
                          <ClipboardList className={`h-4 w-4 ${
                            task.priority === "High" 
                              ? "text-destructive" 
                              : task.priority === "Medium"
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                              {task.title}
                            </p>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === "High" 
                                ? "bg-destructive/10 text-destructive" 
                                : task.priority === "Medium"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {task.priority}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Due: {task.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("tasks")}>
                      View All Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Events scheduled in the near future
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="rounded-md border p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold">{event.title}</h4>
                            <div className="flex flex-col mt-1">
                              <p className="text-xs text-muted-foreground">
                                {event.date} • {event.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-primary" />
                            <span className="text-xs">{event.volunteers}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Details
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Assign Volunteers
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("events")}>
                      View All Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Frequently used staff operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 space-y-2">
                    <Users className="h-6 w-6 mb-1" />
                    <span>Manage Volunteers</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 space-y-2">
                    <User className="h-6 w-6 mb-1" />
                    <span>Manage Beneficiaries</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 space-y-2">
                    <FileText className="h-6 w-6 mb-1" />
                    <span>Resource Allocation</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 space-y-2">
                    <BarChart2 className="h-6 w-6 mb-1" />
                    <span>Generate Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>All Tasks</CardTitle>
                    <CardDescription>
                      Manage and track your tasks
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search tasks..."
                        className="pl-8 w-[200px] md:w-[260px]"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Add Task</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-4 p-4 border rounded-md">
                      <div className={`rounded-full p-2 ${
                        task.priority === "High" 
                          ? "bg-destructive/10" 
                          : task.priority === "Medium"
                          ? "bg-yellow-500/10"
                          : "bg-muted"
                      }`}>
                        <ClipboardList className={`h-4 w-4 ${
                          task.priority === "High" 
                            ? "text-destructive" 
                            : task.priority === "Medium"
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {task.title}
                          </p>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === "High" 
                              ? "bg-destructive/10 text-destructive" 
                              : task.priority === "Medium"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {task.priority}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due: {task.dueDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Complete</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>
                      Manage upcoming events and volunteer assignments
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search events..."
                        className="pl-8 w-[200px] md:w-[260px]"
                      />
                    </div>
                    <Select defaultValue="upcoming">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="all">All Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Create Event</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="rounded-md border p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-semibold">{event.title}</h4>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.volunteers} volunteers assigned</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Location: {event.location}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm">Manage Volunteers</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Resource Inventory</CardTitle>
                    <CardDescription>
                      Manage and track resource allocation
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Update Inventory</Button>
                    <Button>Add Resources</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {resources.map((resource) => (
                    <div key={resource.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium">{resource.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{resource.available} available</span>
                            <span>•</span>
                            <span>{resource.allocated} allocated</span>
                            <span>•</span>
                            <span>{resource.total} total</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Allocate</Button>
                      </div>
                      <Progress value={(resource.allocated / resource.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Beneficiary Requests</CardTitle>
                    <CardDescription>
                      Manage service requests from beneficiaries
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search requests..."
                        className="pl-8 w-[200px] md:w-[260px]"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-md">
                      <div>
                        <h4 className="text-sm font-medium">{request.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.type} • Requested on {request.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusBadge(request.status)} variant="outline">
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          {request.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" className="bg-green-500/10 border-green-600/20 text-green-600 hover:text-green-600 hover:bg-green-500/20">
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/20">
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;

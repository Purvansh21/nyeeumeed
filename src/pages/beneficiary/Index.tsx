
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, FileText, Clock, PlusCircle, CheckCircle, XCircle, Activity, Search, Filter, MapPin, AlertTriangle, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const BeneficiaryDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for beneficiary stats
  const beneficiaryStats = {
    activeServices: 3,
    upcomingAppointments: 2,
    completedServices: 8,
    pendingRequests: 1,
  };

  // Mock data for service requests
  const serviceRequests = [
    { 
      id: 1, 
      type: "Education Support", 
      requestDate: "Apr 10, 2025", 
      status: "approved", 
      nextStep: "Scheduled for Apr 22, 2025",
      assignedStaff: "Sarah Johnson"
    },
    { 
      id: 2, 
      type: "Health Checkup", 
      requestDate: "Apr 13, 2025", 
      status: "pending", 
      nextStep: "Awaiting staff review",
      assignedStaff: null
    },
    { 
      id: 3, 
      type: "Food Assistance", 
      requestDate: "Mar 28, 2025", 
      status: "completed", 
      nextStep: "Delivered on Apr 5, 2025",
      assignedStaff: "Michael Rodriguez"
    },
    { 
      id: 4, 
      type: "Housing Support", 
      requestDate: "Apr 15, 2025", 
      status: "pending", 
      nextStep: "Awaiting document review",
      assignedStaff: null
    },
    { 
      id: 5, 
      type: "Job Training", 
      requestDate: "Apr 5, 2025", 
      status: "approved", 
      nextStep: "Starts May 10, 2025",
      assignedStaff: "Emily Wilson"
    },
  ];

  // Mock data for upcoming appointments
  const upcomingAppointments = [
    { 
      id: 1, 
      title: "Education Assessment", 
      date: "Apr 22, 2025", 
      time: "10:00 AM",
      location: "NGO Education Center", 
      staff: "Sarah Johnson",
      virtual: false
    },
    { 
      id: 2, 
      title: "Monthly Check-in", 
      date: "Apr 30, 2025", 
      time: "2:30 PM",
      location: "Virtual Meeting", 
      staff: "Michael Rodriguez",
      virtual: true
    },
    { 
      id: 3, 
      title: "Job Training Orientation", 
      date: "May 10, 2025", 
      time: "9:00 AM",
      location: "Skills Development Center", 
      staff: "Emily Wilson",
      virtual: false
    },
  ];

  // Mock data for available resources
  const availableResources = [
    { id: 1, title: "Education Opportunities Guide", description: "Information on available educational programs", category: "Education" },
    { id: 2, title: "Healthcare Services Directory", description: "List of available healthcare services", category: "Health" },
    { id: 3, title: "Financial Assistance Programs", description: "Guide to available financial support", category: "Finance" },
    { id: 4, title: "Housing Assistance Information", description: "Resources for housing support", category: "Housing" },
    { id: 5, title: "Job Training Programs", description: "Available vocational training options", category: "Employment" },
    { id: 6, title: "Legal Services Guide", description: "Information on free legal assistance", category: "Legal" },
  ];

  // Mock data for service progress
  const progressData = [
    { id: 1, service: "Education Program", progress: 80, completed: 4, total: 5 },
    { id: 2, service: "Skills Development", progress: 60, completed: 3, total: 5 },
    { id: 3, service: "Health & Wellness", progress: 40, completed: 2, total: 5 },
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
      case "completed":
        return "bg-blue-500/20 text-blue-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Get status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch(status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
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
          
          <Skeleton className="h-80" />
          
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.fullName}. Access your services and support here.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beneficiaryStats.activeServices}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Services currently in progress
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beneficiaryStats.upcomingAppointments}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Upcoming scheduled appointments
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beneficiaryStats.completedServices}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Services successfully delivered
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beneficiaryStats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Requests awaiting approval
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Service Requests</CardTitle>
                  <CardDescription>
                    Track the status of your service applications
                  </CardDescription>
                </div>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="p-4 rounded-md border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-2 ${
                            request.status === "approved" 
                              ? "bg-green-500/10" 
                              : request.status === "pending"
                              ? "bg-yellow-500/10"
                              : request.status === "rejected"
                              ? "bg-destructive/10"
                              : "bg-blue-500/10"
                          }`}>
                            <StatusIcon status={request.status} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{request.type}</h4>
                            <p className="text-xs text-muted-foreground">
                              Requested on {request.requestDate}
                            </p>
                            <p className="text-xs mt-1">
                              {request.nextStep}
                            </p>
                            {request.assignedStaff && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Staff: {request.assignedStaff}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded capitalize ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                        {request.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-xs text-destructive hover:text-destructive">
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("services")}>
                    View All Service Requests
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Your scheduled meetings and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.slice(0, 2).map((appointment) => (
                        <div key={appointment.id} className="p-4 rounded-md border">
                          <h4 className="font-medium">{appointment.title}</h4>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="col-span-2 flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              With: {appointment.staff}
                            </span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                Reschedule
                              </Button>
                              <Button size="sm" className="text-xs">
                                {appointment.virtual ? "Join" : "Confirm"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No upcoming appointments</p>
                      <Button className="mt-4" size="sm">
                        Schedule Appointment
                      </Button>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("appointments")}>
                      View All Appointments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Available Resources</CardTitle>
                  <CardDescription>
                    Educational materials and support resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {availableResources.slice(0, 3).map((resource) => (
                      <li key={resource.id} className="flex items-center gap-3 p-3 rounded-md border">
                        <div className="rounded-full bg-primary/10 p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("resources")}>
                      Browse Resource Library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>My Services</CardTitle>
                    <CardDescription>
                      Track all your service requests and their status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search services..."
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
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Request Service
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-md border">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-2 ${
                            request.status === "approved" 
                              ? "bg-green-500/10" 
                              : request.status === "pending"
                              ? "bg-yellow-500/10"
                              : request.status === "rejected"
                              ? "bg-destructive/10"
                              : "bg-blue-500/10"
                          }`}>
                            <StatusIcon status={request.status} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{request.type}</h3>
                              <div className={`text-xs px-2 py-1 rounded capitalize ${getStatusBadge(request.status)}`}>
                                {request.status}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Requested on {request.requestDate}
                            </p>
                            <p className="text-sm mt-1">
                              {request.nextStep}
                            </p>
                            {request.assignedStaff && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                <span>Assigned to:</span>
                                <Badge variant="outline">{request.assignedStaff}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">
                            View Details
                          </Button>
                          {request.status === "approved" && (
                            <Button variant="outline" className="bg-green-500/10 border-green-600/20 text-green-600 hover:text-green-600 hover:bg-green-500/20">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact Staff
                            </Button>
                          )}
                          {request.status === "pending" && (
                            <Button variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/20">
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request New Service</CardTitle>
                <CardDescription>
                  Apply for additional services or support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education">Education Support</SelectItem>
                        <SelectItem value="health">Healthcare Services</SelectItem>
                        <SelectItem value="food">Food Assistance</SelectItem>
                        <SelectItem value="housing">Housing Support</SelectItem>
                        <SelectItem value="employment">Job Training & Employment</SelectItem>
                        <SelectItem value="legal">Legal Assistance</SelectItem>
                        <SelectItem value="other">Other (specify)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Urgency Level</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Within 30 days</SelectItem>
                        <SelectItem value="medium">Medium - Within 14 days</SelectItem>
                        <SelectItem value="high">High - Within 7 days</SelectItem>
                        <SelectItem value="urgent">Urgent - Immediate assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input placeholder="Briefly describe your needs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Contact Method</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS/Text Message</SelectItem>
                        <SelectItem value="inperson">In-Person Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-md bg-amber-50 text-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <p className="text-sm">
                      Urgent requests may require verification. A staff member will contact you shortly after submission.
                    </p>
                  </div>
                  <Button>Submit Service Request</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>My Appointments</CardTitle>
                    <CardDescription>
                      Manage your scheduled meetings and services
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar View
                    </Button>
                    <Button>
                      Request Appointment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 rounded-md border">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{appointment.title}</h3>
                            {appointment.virtual ? (
                              <Badge className="bg-blue-500/10 text-blue-700">Virtual</Badge>
                            ) : (
                              <Badge className="bg-violet-500/10 text-violet-700">In-person</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{appointment.location}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Staff: {appointment.staff}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {appointment.virtual && (
                            <Button>
                              Join Meeting
                            </Button>
                          )}
                          <Button variant="outline">
                            Reschedule
                          </Button>
                          <Button variant="outline" className="text-destructive hover:text-destructive">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request New Appointment</CardTitle>
                <CardDescription>
                  Schedule a meeting with our staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Appointment Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checkin">Regular Check-in</SelectItem>
                          <SelectItem value="assessment">Needs Assessment</SelectItem>
                          <SelectItem value="counseling">Counseling Session</SelectItem>
                          <SelectItem value="training">Training Session</SelectItem>
                          <SelectItem value="other">Other (Specify)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Format</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inperson">In-person Meeting</SelectItem>
                          <SelectItem value="virtual">Virtual Meeting</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Date</label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Time</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                          <SelectItem value="evening">Evening (5PM - 7PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes</label>
                    <Input placeholder="Any specific concerns or questions" />
                  </div>
                  <Button>Request Appointment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Resource Library</CardTitle>
                    <CardDescription>
                      Access educational materials and support resources
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-8 w-[200px] md:w-[260px]"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableResources.map((resource) => (
                    <div key={resource.id} className="border rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{resource.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                            </div>
                            <Badge variant="outline">{resource.category}</Badge>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">
                              View Online
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="mr-1 h-3.5 w-3.5" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Additional community resources that may be helpful
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Local Food Banks</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Information on local food banks and distribution centers in your area.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      View Directory
                    </Button>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Healthcare Clinics</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Low-cost and free healthcare options available in your community.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      View Directory
                    </Button>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Support Groups</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect with people facing similar challenges in supportive environments.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Find Groups
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Progress</CardTitle>
                <CardDescription>
                  Track your program goals and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {progressData.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.service}</span>
                        <span className="text-sm font-medium">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.completed} out of {item.total} milestones completed
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Milestones & Achievements</CardTitle>
                    <CardDescription>
                      Your completed goals and upcoming milestones
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Progress Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-medium mb-3">Education Program</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded border border-green-200 bg-green-50">
                        <div className="rounded-full bg-green-500/20 p-1.5">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Initial Assessment Completed</p>
                          <p className="text-xs text-green-600">Apr 5, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded border border-green-200 bg-green-50">
                        <div className="rounded-full bg-green-500/20 p-1.5">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Educational Goal Setting</p>
                          <p className="text-xs text-green-600">Apr 12, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded border">
                        <div className="rounded-full bg-primary/10 p-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Course Enrollment</p>
                          <p className="text-xs text-muted-foreground">Target date: May 15, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Skills Development</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded border border-green-200 bg-green-50">
                        <div className="rounded-full bg-green-500/20 p-1.5">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Computer Literacy Basics</p>
                          <p className="text-xs text-green-600">Mar 20, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded border">
                        <div className="rounded-full bg-primary/10 p-1.5">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Professional Communication (In Progress)</p>
                          <p className="text-xs text-muted-foreground">Started: Apr 10, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryDashboard;

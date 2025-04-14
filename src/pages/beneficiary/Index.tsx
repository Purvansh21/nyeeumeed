
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, FileText, Clock, PlusCircle, CheckCircle, XCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const BeneficiaryDashboard = () => {
  const { user } = useAuth();

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
    },
    { 
      id: 2, 
      type: "Health Checkup", 
      requestDate: "Apr 13, 2025", 
      status: "pending", 
      nextStep: "Awaiting staff review",
    },
    { 
      id: 3, 
      type: "Food Assistance", 
      requestDate: "Mar 28, 2025", 
      status: "completed", 
      nextStep: "Delivered on Apr 5, 2025",
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
      staff: "Sarah Johnson"
    },
    { 
      id: 2, 
      title: "Monthly Check-in", 
      date: "Apr 30, 2025", 
      time: "2:30 PM",
      location: "Virtual Meeting", 
      staff: "Michael Rodriguez"
    },
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.fullName}. Access your services and support here.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{beneficiaryStats.activeServices}</div>
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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
              {serviceRequests.map((request) => (
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
              <Button variant="outline" className="w-full">View Service History</Button>
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
                  {upcomingAppointments.map((appointment) => (
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
                          <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
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
                            Join
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
                <li className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Education Opportunities Guide</p>
                    <p className="text-xs text-muted-foreground">Information on available educational programs</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Healthcare Services Directory</p>
                    <p className="text-xs text-muted-foreground">List of available healthcare services</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Financial Assistance Programs</p>
                    <p className="text-xs text-muted-foreground">Guide to available financial support</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </li>
              </ul>
              <div className="mt-4">
                <Button variant="outline" className="w-full">Browse Resource Library</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Progress</CardTitle>
            <CardDescription>
              Track your program goals and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Education Program</span>
                  <span className="text-sm font-medium">80%</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  4 out of 5 milestones completed
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Skills Development</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  3 out of 5 milestones completed
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Health & Wellness</span>
                  <span className="text-sm font-medium">40%</span>
                </div>
                <Progress value={40} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  2 out of 5 milestones completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryDashboard;

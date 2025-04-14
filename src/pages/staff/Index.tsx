
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, User, Calendar, FileText, BarChart2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const StaffDashboard = () => {
  const { user, getAllUsers } = useAuth();
  const allUsers = getAllUsers();

  // Count volunteers and beneficiaries
  const volunteerCount = allUsers.filter(u => u.role === "volunteer").length;
  const beneficiaryCount = allUsers.filter(u => u.role === "beneficiary").length;

  // Mock data for pending tasks
  const pendingTasks = [
    { id: 1, title: "Review volunteer applications", dueDate: "Apr 18, 2025", priority: "High" },
    { id: 2, title: "Update resource inventory", dueDate: "Apr 20, 2025", priority: "Medium" },
    { id: 3, title: "Process beneficiary requests", dueDate: "Apr 22, 2025", priority: "High" },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    { id: 1, title: "Community Outreach Program", date: "Apr 25, 2025", volunteers: 8 },
    { id: 2, title: "Training Workshop", date: "May 2, 2025", volunteers: 5 },
    { id: 3, title: "Resource Distribution", date: "May 10, 2025", volunteers: 12 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}. Manage your NGO operations here.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerCount}</div>
              <p className="text-xs text-muted-foreground">
                Volunteers ready for assignment
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{beneficiaryCount}</div>
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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
                {pendingTasks.map((task) => (
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
                <Button variant="outline" className="w-full">View All Tasks</Button>
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
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="rounded-md border p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.date}
                        </p>
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
                <Button variant="outline" className="w-full">View Calendar</Button>
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
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;

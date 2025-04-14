
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, User, UserCheck, FileText, AlertTriangle, Bell } from "lucide-react";
import { getRoleDisplayName } from "@/utils/permissions";

const AdminDashboard = () => {
  const { user, getAllUsers } = useAuth();
  const allUsers = getAllUsers();

  // Count users by role
  const userCounts = {
    total: allUsers.length,
    admin: allUsers.filter(u => u.role === "admin").length,
    staff: allUsers.filter(u => u.role === "staff").length,
    volunteer: allUsers.filter(u => u.role === "volunteer").length,
    beneficiary: allUsers.filter(u => u.role === "beneficiary").length,
  };

  // Latest system activity (mocked data)
  const recentActivities = [
    { type: "login", user: "Staff Member", time: "10 minutes ago", description: "Logged in successfully" },
    { type: "create", user: "Admin User", time: "2 hours ago", description: "Created new volunteer account" },
    { type: "update", user: "Staff Member", time: "3 hours ago", description: "Updated beneficiary information" },
    { type: "login", user: "Volunteer Helper", time: "5 hours ago", description: "Logged in successfully" },
  ];

  // System health metrics (mocked data)
  const systemHealth = {
    uptime: "99.9%",
    responseTime: "120ms",
    lastBackup: "Today, 03:00 AM",
    securityAlerts: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}. Here's what's happening in your NGO Operations Hub.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCounts.total}</div>
              <p className="text-xs text-muted-foreground">
                Active accounts in the system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCounts.staff}</div>
              <p className="text-xs text-muted-foreground">
                Full-time NGO employees
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCounts.volunteer}</div>
              <p className="text-xs text-muted-foreground">
                Active volunteers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCounts.beneficiary}</div>
              <p className="text-xs text-muted-foreground">
                Individuals receiving services
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                The latest activity in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10">
                      {activity.type === "login" && <User className="h-4 w-4 text-primary" />}
                      {activity.type === "create" && <UserCheck className="h-4 w-4 text-primary" />}
                      {activity.type === "update" && <FileText className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.user}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Current system performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">System Uptime</span>
                  </div>
                  <span className="text-sm">{systemHealth.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <span className="text-sm">{systemHealth.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Last Backup</span>
                  </div>
                  <span className="text-sm">{systemHealth.lastBackup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Security Alerts</span>
                  </div>
                  <span className="text-sm">{systemHealth.securityAlerts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>
              Breakdown of user accounts by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(userCounts)
                .filter(([role]) => role !== "total")
                .map(([role, count]) => (
                  <div key={role} className="flex items-center gap-4">
                    <div className={`role-badge role-badge-${role}`}>
                      {getRoleDisplayName(role as any)}
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${role === "admin" ? "bg-destructive" : 
                          role === "staff" ? "bg-secondary" : 
                          role === "volunteer" ? "bg-accent" : "bg-muted-foreground"}`}
                        style={{ width: `${(count / userCounts.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm">{count}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Announcements & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
              <div className="flex items-start gap-4">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">System Maintenance Notice</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A system upgrade is scheduled for next Sunday at 2:00 AM. The system will be unavailable 
                    for approximately 2 hours. Please plan accordingly.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Posted by Admin • April 12, 2023
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

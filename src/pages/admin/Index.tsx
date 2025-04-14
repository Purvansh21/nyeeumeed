
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole, User } from "@/types/auth";
import { Users, UserPlus, BarChart2, Settings, Shield, Calendar, HelpCircle, Briefcase, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminDashboard = () => {
  const { getAllUsers } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    staffUsers: 0,
    volunteerUsers: 0,
    beneficiaryUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allUsers = await getAllUsers();
        
        // Calculate stats
        setStats({
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(user => user.isActive).length,
          adminUsers: allUsers.filter(user => user.role === "admin").length,
          staffUsers: allUsers.filter(user => user.role === "staff").length,
          volunteerUsers: allUsers.filter(user => user.role === "volunteer").length,
          beneficiaryUsers: allUsers.filter(user => user.role === "beneficiary").length
        });
        
        // Get recent users (most recently created)
        const sorted = [...allUsers].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentUsers(sorted.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getAllUsers]);

  // Admin feature cards
  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      link: "/admin/users",
      color: "bg-blue-500",
      textColor: "text-blue-500"
    },
    {
      title: "Analytics",
      description: "View system statistics and reports",
      icon: BarChart2,
      link: "/admin/analytics",
      color: "bg-purple-500",
      textColor: "text-purple-500"
    },
    {
      title: "System Settings",
      description: "Configure global system settings",
      icon: Settings,
      link: "/admin/settings",
      color: "bg-amber-500",
      textColor: "text-amber-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the NGO Operations Hub administration panel
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "..." : stats.activeUsers} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.adminUsers}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.staffUsers}</div>
              <p className="text-xs text-muted-foreground">NGO staff members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Others</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : (stats.volunteerUsers + stats.beneficiaryUsers)}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "..." : stats.volunteerUsers} volunteers, {isLoading ? "..." : stats.beneficiaryUsers} beneficiaries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Features */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminFeatures.map((feature) => (
              <Card key={feature.title} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className={`${feature.color} h-2 w-full`} />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${feature.color} bg-opacity-10`}>
                      <feature.icon className={`h-5 w-5 ${feature.textColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to={feature.link}>Access {feature.title}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
            <CardDescription>
              The most recently created user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading recent users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {recentUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No recent users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                View All Users
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/users">
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

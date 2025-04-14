
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AlertCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const Analytics = () => {
  const { getAllUsers } = useAuth();
  const [userRoleData, setUserRoleData] = useState<{ name: string; value: number }[]>([]);
  const [activeData, setActiveData] = useState<{ name: string; active: number; inactive: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users and handle potential errors
        const users = await getAllUsers();
        
        if (!users || users.length === 0) {
          console.log("No users returned from getAllUsers");
          setUserRoleData([]);
          setActiveData([]);
          setError("No user data available. Please add users to view analytics.");
          return;
        }
        
        console.log("Users data received:", users.length);
        
        // Prepare role distribution data
        const roleCount: Record<string, number> = {};
        users.forEach(user => {
          const role = user.role || "unknown";
          roleCount[role] = (roleCount[role] || 0) + 1;
        });
        
        const roleData = Object.entries(roleCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));
        
        console.log("Role data prepared:", roleData);
        
        // Prepare active/inactive data by role
        const activeByRole: Record<string, { active: number, inactive: number }> = {};
        users.forEach(user => {
          const role = user.role || "unknown";
          if (!activeByRole[role]) {
            activeByRole[role] = { active: 0, inactive: 0 };
          }
          
          if (user.isActive) {
            activeByRole[role].active += 1;
          } else {
            activeByRole[role].inactive += 1;
          }
        });
        
        const activeData = Object.entries(activeByRole).map(([role, data]) => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          active: data.active,
          inactive: data.inactive
        }));
        
        console.log("Active data prepared:", activeData);
        
        setUserRoleData(roleData);
        setActiveData(activeData);
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again later.");
        // Set empty arrays to prevent rendering issues
        setUserRoleData([]);
        setActiveData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getAllUsers]);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Fallback charts to display when no data is available but not in error state
  const emptyRoleData = [
    { name: "No Data", value: 1 }
  ];
  
  const emptyActiveData = [
    { name: "No Data", active: 0, inactive: 0 }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system users and activity
          </p>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>
                Breakdown of users by role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData.length > 0 ? userRoleData : emptyRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(userRoleData.length > 0 ? userRoleData : emptyRoleData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Active vs. Inactive Users</CardTitle>
              <CardDescription>
                User status by role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activeData.length > 0 ? activeData : emptyActiveData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="active" stackId="a" name="Active" fill="#4CAF50" />
                      <Bar dataKey="inactive" stackId="a" name="Inactive" fill="#F44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

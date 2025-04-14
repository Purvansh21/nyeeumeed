
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, Download, FileDown, Filter, PieChart, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for reports
const userActivityData = [
  { month: 'Jan', volunteers: 5, beneficiaries: 12, staff: 2 },
  { month: 'Feb', volunteers: 8, beneficiaries: 15, staff: 3 },
  { month: 'Mar', volunteers: 12, beneficiaries: 18, staff: 3 },
  { month: 'Apr', volunteers: 15, beneficiaries: 22, staff: 4 },
  { month: 'May', volunteers: 18, beneficiaries: 28, staff: 4 },
  { month: 'Jun', volunteers: 24, beneficiaries: 32, staff: 5 },
];

const serviceDeliveryData = [
  { week: 'Week 1', delivered: 12, scheduled: 15, canceled: 3 },
  { week: 'Week 2', delivered: 18, scheduled: 20, canceled: 2 },
  { week: 'Week 3', delivered: 15, scheduled: 18, canceled: 3 },
  { week: 'Week 4', delivered: 22, scheduled: 25, canceled: 3 },
  { week: 'Week 5', delivered: 28, scheduled: 30, canceled: 2 },
];

// Sample report list
const savedReports = [
  { id: 1, name: "Monthly User Growth", type: "User Activity", createdBy: "System Admin", createdAt: "2024-03-15", lastRun: "2024-04-01" },
  { id: 2, name: "Service Delivery Stats", type: "Service Metrics", createdBy: "System Admin", createdAt: "2024-02-28", lastRun: "2024-04-01" },
  { id: 3, name: "Volunteer Engagement", type: "User Activity", createdBy: "System Admin", createdAt: "2024-01-10", lastRun: "2024-03-25" },
  { id: 4, name: "Resource Allocation", type: "Financial", createdBy: "System Admin", createdAt: "2024-03-05", lastRun: "2024-03-30" },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  
  const handleExportReport = (reportId: number, reportName: string) => {
    // In a real app, this would trigger a report export
    toast({
      title: "Exporting report",
      description: `${reportName} is being prepared for download.`,
    });
  };
  
  const handleRunReport = (reportId: number, reportName: string) => {
    // In a real app, this would run the report with fresh data
    toast({
      title: "Running report",
      description: `${reportName} is being generated with the latest data.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view system reports
          </p>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="dashboard">
                <TrendingUp className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="saved">
                <PieChart className="mr-2 h-4 w-4" />
                Saved Reports
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Set Date Range
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="default" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registrations by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userActivityData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="volunteers" name="Volunteers" fill="#4CAF50" />
                        <Bar dataKey="beneficiaries" name="Beneficiaries" fill="#2196F3" />
                        <Bar dataKey="staff" name="Staff" fill="#9C27B0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Delivery</CardTitle>
                  <CardDescription>Weekly service delivery statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={serviceDeliveryData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#4CAF50" strokeWidth={2} />
                        <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="#2196F3" strokeWidth={2} />
                        <Line type="monotone" dataKey="canceled" name="Canceled" stroke="#F44336" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Summary</CardTitle>
                <CardDescription>Overall system metrics and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold">65</h3>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Calendar className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold">125</h3>
                        <p className="text-sm text-muted-foreground">Services Delivered</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <TrendingUp className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold">27%</h3>
                        <p className="text-sm text-muted-foreground">Growth Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <PieChart className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold">95%</h3>
                        <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>
                  Access your previously configured reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Created By</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell className="hidden md:table-cell">{report.createdBy}</TableCell>
                          <TableCell className="hidden md:table-cell">{report.createdAt}</TableCell>
                          <TableCell>{report.lastRun}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRunReport(report.id, report.name)}
                              >
                                Run
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleExportReport(report.id, report.name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Create New Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

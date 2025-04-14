
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, FileDown, Filter, PieChart, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeSummary: true,
    includeRawData: true
  });
  
  const handleExportReport = (reportId: number, reportName: string) => {
    // Simulate report export
    toast({
      title: "Exporting report",
      description: `${reportName} is being prepared for download.`,
    });
    
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `${reportName} has been downloaded.`,
      });
    }, 1500);
  };
  
  const handleRunReport = (reportId: number, reportName: string) => {
    // Simulate running the report
    toast({
      title: "Running report",
      description: `${reportName} is being generated with the latest data.`,
    });
    
    // In a real app, this would refresh the report data
    setTimeout(() => {
      toast({
        title: "Report updated",
        description: `${reportName} has been refreshed with the latest data.`,
      });
    }, 1500);
  };
  
  const handleDateRangeSet = () => {
    if (date && endDate) {
      toast({
        title: "Date range set",
        description: `Reports filtered from ${format(date, "PPP")} to ${format(endDate, "PPP")}`,
      });
      
      // In a real app, this would trigger a refresh of the reports with the new date range
    }
  };
  
  const handleFilterApply = () => {
    toast({
      title: "Filters applied",
      description: `Reports filtered by type: ${filterType}`,
    });
    
    setShowFilterDialog(false);
    // In a real app, this would filter the reports
  };
  
  const handleExport = () => {
    const options = [];
    if (exportOptions.includeCharts) options.push("charts");
    if (exportOptions.includeSummary) options.push("summary");
    if (exportOptions.includeRawData) options.push("raw data");
    
    toast({
      title: `Exporting as ${exportFormat.toUpperCase()}`,
      description: `Export includes ${options.join(", ")}`,
    });
    
    setShowExportDialog(false);
    
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your report has been downloaded.",
      });
    }, 1500);
  };

  const handleChartExport = (chartName: string) => {
    toast({
      title: "Exporting chart",
      description: `${chartName} is being prepared as CSV.`,
    });
    
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Chart exported",
        description: `${chartName} has been downloaded as CSV.`,
      });
    }, 1000);
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
          <div className="flex justify-between items-center flex-wrap gap-2">
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
            <div className="flex gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Set start date"}
                    {endDate && date ? ` - ${format(endDate, "PPP")}` : ""}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="space-y-2">
                      <h4 className="font-medium">Start Date</h4>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium">End Date</h4>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(day) => 
                          date ? day < date : false
                        }
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button size="sm" onClick={handleDateRangeSet}>Apply Range</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Reports</DialogTitle>
                    <DialogDescription>
                      Choose criteria to filter your reports
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select 
                        value={filterType} 
                        onValueChange={setFilterType}
                      >
                        <SelectTrigger id="report-type">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Reports</SelectItem>
                          <SelectItem value="user">User Activity</SelectItem>
                          <SelectItem value="service">Service Metrics</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Cancel</Button>
                    <Button onClick={handleFilterApply}>Apply Filters</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Export Report</DialogTitle>
                    <DialogDescription>
                      Choose export format and options
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="export-format">Export Format</Label>
                      <Select 
                        value={exportFormat} 
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger id="export-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Export Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="include-charts" 
                            checked={exportOptions.includeCharts}
                            onCheckedChange={(checked) => 
                              setExportOptions({...exportOptions, includeCharts: !!checked})
                            }
                          />
                          <label
                            htmlFor="include-charts"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Include charts
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="include-summary" 
                            checked={exportOptions.includeSummary}
                            onCheckedChange={(checked) => 
                              setExportOptions({...exportOptions, includeSummary: !!checked})
                            }
                          />
                          <label
                            htmlFor="include-summary"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Include summary
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="include-raw" 
                            checked={exportOptions.includeRawData}
                            onCheckedChange={(checked) => 
                              setExportOptions({...exportOptions, includeRawData: !!checked})
                            }
                          />
                          <label
                            htmlFor="include-raw"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Include raw data
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
                    <Button onClick={handleExport}>Export</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleChartExport("User Growth")}
                  >
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleChartExport("Service Delivery")}
                  >
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
                        <CalendarIcon className="h-8 w-8 text-primary mb-2" />
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

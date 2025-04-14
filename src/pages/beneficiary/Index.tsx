
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import BeneficiaryStats from "@/components/beneficiary/BeneficiaryStats";
import ServiceRequestList from "@/components/beneficiary/ServiceRequestList";
import ServiceRequestForm from "@/components/beneficiary/ServiceRequestForm";
import AppointmentList from "@/components/beneficiary/AppointmentList";
import AppointmentForm from "@/components/beneficiary/AppointmentForm";
import ResourceLibrary from "@/components/beneficiary/ResourceLibrary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, Clock, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BeneficiaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Sample progress data - this would come from API in a real implementation
  const progressData = [
    { id: 1, service: "Education Program", progress: 80, completed: 4, total: 5 },
    { id: 2, service: "Skills Development", progress: 60, completed: 3, total: 5 },
    { id: 3, service: "Health & Wellness", progress: 40, completed: 2, total: 5 },
  ];

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
            <BeneficiaryStats refreshKey={refreshKey} />

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Activities</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate("/beneficiary/tracking")}
                className="flex items-center gap-2"
              >
                <LineChart className="h-4 w-4" />
                <span>Service Tracking</span>
              </Button>
            </div>

            <ServiceRequestList 
              onNewRequest={() => setActiveTab("services")}
              refreshKey={refreshKey}
              limit={3}
              showViewAll={true}
              onViewAll={() => setActiveTab("services")}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <AppointmentList 
                onNewAppointment={() => setActiveTab("appointments")}
                refreshKey={refreshKey}
                limit={2}
                showViewAll={true}
                onViewAll={() => setActiveTab("appointments")}
              />

              <ResourceLibrary 
                limit={3}
                showViewAll={true}
                onViewAll={() => setActiveTab("resources")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Service Requests</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate("/beneficiary/tracking")}
                className="flex items-center gap-2"
              >
                <LineChart className="h-4 w-4" />
                <span>Service Tracking</span>
              </Button>
            </div>
            <ServiceRequestList 
              onNewRequest={() => setActiveTab("services")}
              refreshKey={refreshKey}
            />
            <ServiceRequestForm onSuccess={handleRefresh} />
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <AppointmentList 
              onNewAppointment={() => setActiveTab("appointments")}
              refreshKey={refreshKey}
            />
            <AppointmentForm onSuccess={handleRefresh} />
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <ResourceLibrary />

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
                <CardTitle>Milestones & Achievements</CardTitle>
                <CardDescription>
                  Your completed goals and upcoming milestones
                </CardDescription>
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
                          <p className="text-sm font-medium">Intermediate Training</p>
                          <p className="text-xs text-muted-foreground">In progress (60% complete)</p>
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

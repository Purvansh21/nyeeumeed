
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon } from "lucide-react";
import ServiceRequestList from "@/components/beneficiary/ServiceRequestList";
import AppointmentList from "@/components/beneficiary/AppointmentList";
import { fetchServiceHistory, ServiceHistory } from "@/services/beneficiaryService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BeneficiaryTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadServiceHistory = async () => {
      setIsLoading(true);
      try {
        const data = await fetchServiceHistory();
        setServiceHistory(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceHistory();
  }, [refreshKey]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700">Completed</Badge>;
      case "active":
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-700">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-700">Pending</Badge>;
      case "cancelled":
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading && serviceHistory.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Tracking</h1>
          <p className="text-muted-foreground">
            Track and manage all your service requests and appointments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Summary</CardTitle>
              <CardDescription>Overview of your services and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {serviceHistory.filter(service => service.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Services</div>
                </div>
                <div className="bg-yellow-500/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="text-2xl font-bold text-yellow-700 mb-1">
                    {serviceHistory.filter(service => service.status === "pending").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Services</div>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <Button 
                    variant="outline" 
                    className="h-auto py-1 px-4 text-green-700 border-green-200 hover:bg-green-100"
                    onClick={() => navigate("/beneficiary/services")}
                  >
                    Request New Service
                  </Button>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <Button 
                    variant="outline" 
                    className="h-auto py-1 px-4 text-blue-700 border-blue-200 hover:bg-blue-100"
                    onClick={() => navigate("/beneficiary/appointments")}
                  >
                    Schedule Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Requests</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <ServiceRequestList 
              refreshKey={refreshKey}
              onNewRequest={() => navigate("/beneficiary/services")} 
              showViewAll={false}
            />
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <AppointmentList 
              refreshKey={refreshKey}
              onNewAppointment={() => navigate("/beneficiary/appointments")}
              showViewAll={false}
            />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
                <CardDescription>
                  Past service requests and completed appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {serviceHistory.map((service) => (
                      <div key={service.id} className="p-4 border rounded-md">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{service.service_type}</h3>
                              {renderStatusBadge(service.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(service.delivery_date).toLocaleDateString()} at {
                                new Date(service.delivery_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              }
                            </p>
                            {service.description && (
                              <p className="text-sm mt-2">{service.description}</p>
                            )}
                            {service.staff?.full_name && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Staff: {service.staff.full_name}
                              </p>
                            )}
                          </div>
                          {service.notes && (
                            <div className="bg-muted p-3 rounded-md text-sm">
                              <p className="font-medium">Notes:</p>
                              <p>{service.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No service history available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryTracking;


import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getVolunteerOpportunities } from "@/services/volunteerService";
import { VolunteerOpportunity } from "@/types/volunteer";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import OpportunityForm from "@/components/admin/OpportunityForm";

const AdminVolunteerOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching opportunities...");
      const data = await getVolunteerOpportunities();
      console.log("Opportunities fetched:", data);
      setOpportunities(data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        variant: "destructive",
        title: "Failed to load opportunities",
        description: "There was an error loading volunteer opportunities."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const formatDateFromISO = (isoString: string) => {
    try {
      return format(parseISO(isoString), "MMM dd, yyyy");
    } catch (e) {
      return isoString;
    }
  };

  const formatTimeFromISO = (isoString: string) => {
    try {
      return format(parseISO(isoString), "h:mm a");
    } catch (e) {
      return isoString;
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    try {
      return `${formatTimeFromISO(start)} - ${formatTimeFromISO(end)}`;
    } catch (e) {
      return `${start} - ${end}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'full':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      default:
        return '';
    }
  };

  const handleOpportunityCreated = () => {
    console.log("Opportunity created, refreshing list...");
    fetchOpportunities();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Volunteer Opportunities</h1>
            <p className="text-muted-foreground">
              Manage volunteer opportunities across the organization
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Opportunity
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl" side="right">
              <SheetHeader>
                <SheetTitle>Create New Volunteer Opportunity</SheetTitle>
                <SheetDescription>
                  Fill out the form below to create a new volunteer opportunity
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <OpportunityForm onSuccess={handleOpportunityCreated} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Opportunities</CardTitle>
            <CardDescription>
              View and manage existing volunteer opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-md border p-4 animate-pulse">
                    <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
                    <div className="flex space-x-2 mb-2">
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="rounded-md border hover:border-primary/50 transition-colors">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{opportunity.title}</h3>
                            <Badge variant="outline" className={getStatusColor(opportunity.status)}>
                              {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">
                            {opportunity.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{formatDateFromISO(opportunity.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {formatTimeRange(opportunity.start_time, opportunity.end_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{opportunity.location}</span>
                            </div>
                          </div>
                          <Badge className="mt-2" variant="secondary">{opportunity.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="rounded-full">
                            <Users className="h-3 w-3 mr-1" />
                            {opportunity.spots_filled} / {opportunity.spots_available}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No volunteer opportunities found</p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Opportunity
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-xl" side="right">
                    <SheetHeader>
                      <SheetTitle>Create New Volunteer Opportunity</SheetTitle>
                      <SheetDescription>
                        Fill out the form below to create a new volunteer opportunity
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <OpportunityForm onSuccess={handleOpportunityCreated} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminVolunteerOpportunities;

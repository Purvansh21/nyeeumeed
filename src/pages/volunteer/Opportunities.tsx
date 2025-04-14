
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Filter, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { getVolunteerOpportunities, getVolunteerRegistrations, registerForOpportunity } from "@/services/volunteerService";
import { VolunteerOpportunity, VolunteerRegistration } from "@/types/volunteer";

const VolunteerOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [opportunitiesData, registrationsData] = await Promise.all([
          getVolunteerOpportunities(),
          getVolunteerRegistrations(user.id)
        ]);
        
        setOpportunities(opportunitiesData);
        setRegistrations(registrationsData);
      } catch (error) {
        console.error("Error fetching volunteer opportunities:", error);
        toast({
          variant: "destructive",
          title: "Failed to load opportunities",
          description: "There was an error loading volunteer opportunities. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const isRegistered = (opportunityId: string) => {
    return registrations.some(r => 
      r.opportunity_id === opportunityId && r.status === 'registered'
    );
  };

  const getRegistrationId = (opportunityId: string) => {
    const registration = registrations.find(r => 
      r.opportunity_id === opportunityId && r.status === 'registered'
    );
    return registration?.id;
  };

  const handleSignUp = async (opportunityId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to sign up for volunteer opportunities."
      });
      return;
    }
    
    const success = await registerForOpportunity(opportunityId, user.id);
    
    if (success) {
      // Update local state
      setRegistrations(prev => [
        ...prev,
        {
          id: Math.random().toString(), // Temporary ID until refresh
          volunteer_id: user.id,
          opportunity_id: opportunityId,
          status: 'registered',
          registered_at: new Date().toISOString()
        }
      ]);
      
      // Update opportunity spots
      setOpportunities(prev => 
        prev.map(o => {
          if (o.id === opportunityId) {
            const newSpotsFilled = o.spots_filled + 1;
            return {
              ...o,
              spots_filled: newSpotsFilled,
              status: newSpotsFilled >= o.spots_available ? 'full' : 'active'
            };
          }
          return o;
        })
      );
    }
  };

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

  // Filter opportunities for active ones that are in the future
  const filteredOpportunities = opportunities.filter(opportunity => {
    // Only show active opportunities
    if (opportunity.status !== 'active' && opportunity.status !== 'full') return false;
    
    // Only show future opportunities
    const opportunityDate = new Date(opportunity.date);
    if (opportunityDate < new Date()) return false;
    
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || opportunity.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get unique categories from opportunities
  const categories = [...new Set(opportunities.map(o => o.category))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Opportunities</h1>
          <p className="text-muted-foreground">
            Discover and sign up for volunteer opportunities in your community.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Available Opportunities</CardTitle>
                <CardDescription>
                  Browse and sign up for volunteer opportunities
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search opportunities..."
                    className="pl-8 w-full md:w-[260px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  value={filterCategory} 
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOpportunities.length > 0 ? (
              <div className="space-y-4">
                {filteredOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="rounded-md border hover:border-primary/50 transition-colors">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{opportunity.title}</h3>
                            {isRegistered(opportunity.id) && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                                Registered
                              </Badge>
                            )}
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
                        <div className="flex md:flex-col items-center gap-3">
                          <Badge variant="outline" className="rounded-full">
                            <Users className="h-3 w-3 mr-1" />
                            {opportunity.spots_available - opportunity.spots_filled} spots left
                          </Badge>
                          <Button 
                            variant={isRegistered(opportunity.id) ? "outline" : "default"}
                            className={isRegistered(opportunity.id) ? "bg-green-500/10 text-green-700 hover:text-green-700 hover:bg-green-500/20 border-green-500/30" : ""}
                            onClick={() => handleSignUp(opportunity.id)}
                            disabled={isRegistered(opportunity.id) || opportunity.spots_filled >= opportunity.spots_available}
                          >
                            {isRegistered(opportunity.id) ? "Registered" : "Sign Up"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setFilterCategory("all"); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerOpportunities;

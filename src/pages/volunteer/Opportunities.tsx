
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

const VolunteerOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock data for opportunities
  const opportunities = [
    { 
      id: 1, 
      title: "Community Food Distribution", 
      date: "Apr 22, 2025", 
      time: "10:00 AM - 2:00 PM",
      location: "Community Center", 
      spotsLeft: 3,
      isSignedUp: true,
      category: "Food",
      description: "Help distribute food packages to families in need."
    },
    { 
      id: 2, 
      title: "Children's Education Workshop", 
      date: "Apr 28, 2025", 
      time: "3:00 PM - 6:00 PM",
      location: "Public Library", 
      spotsLeft: 5,
      isSignedUp: false,
      category: "Education",
      description: "Assist in teaching basic subjects to disadvantaged children."
    },
    { 
      id: 3, 
      title: "Elderly Care Visit", 
      date: "May 5, 2025", 
      time: "9:00 AM - 12:00 PM",
      location: "Sunshine Senior Home", 
      spotsLeft: 2,
      isSignedUp: false,
      category: "Healthcare",
      description: "Provide companionship and assistance to elderly residents."
    },
    { 
      id: 4, 
      title: "Environmental Cleanup", 
      date: "May 12, 2025", 
      time: "8:00 AM - 11:00 AM",
      location: "Riverside Park", 
      spotsLeft: 8,
      isSignedUp: false,
      category: "Environment",
      description: "Help clean up trash and plant trees in the local park."
    },
  ];

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || opportunity.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSignUp = (opportunityId: number) => {
    toast({
      title: "Registration successful",
      description: "You've been signed up for this volunteer opportunity.",
    });
  };

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
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOpportunities.length > 0 ? (
              <div className="space-y-4">
                {filteredOpportunities.map((event) => (
                  <div key={event.id} className="rounded-md border hover:border-primary/50 transition-colors">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.isSignedUp && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                                Registered
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">
                            {event.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{event.location}</span>
                            </div>
                          </div>
                          <Badge className="mt-2" variant="secondary">{event.category}</Badge>
                        </div>
                        <div className="flex md:flex-col items-center gap-3">
                          <Badge variant="outline" className="rounded-full">
                            <Users className="h-3 w-3 mr-1" />
                            {event.spotsLeft} spots left
                          </Badge>
                          <Button 
                            variant={event.isSignedUp ? "outline" : "default"}
                            className={event.isSignedUp ? "bg-green-500/10 text-green-700 hover:text-green-700 hover:bg-green-500/20 border-green-500/30" : ""}
                            onClick={() => handleSignUp(event.id)}
                            disabled={event.isSignedUp}
                          >
                            {event.isSignedUp ? "Registered" : "Sign Up"}
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

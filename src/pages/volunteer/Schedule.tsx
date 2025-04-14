
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const VolunteerSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for scheduled shifts
  const scheduledEvents = [
    { 
      id: 1, 
      title: "Community Food Distribution", 
      date: "Apr 22, 2025", 
      time: "10:00 AM - 2:00 PM",
      location: "Community Center",
      role: "Food Distribution Assistant"
    },
    { 
      id: 2, 
      title: "Monthly Volunteer Meeting", 
      date: "Apr 26, 2025", 
      time: "9:00 AM - 10:30 AM",
      location: "NGO Headquarters",
      role: "Attendee"
    },
    { 
      id: 3, 
      title: "Fundraising Event", 
      date: "May 15, 2025", 
      time: "5:00 PM - 9:00 PM",
      location: "City Convention Center",
      role: "Event Support"
    },
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitHours = () => {
    toast({
      title: "Hours submitted successfully",
      description: "Your volunteer hours have been recorded.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View and manage your volunteer shifts and log your hours.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Upcoming Shifts</CardTitle>
                <CardDescription>
                  View your upcoming volunteer commitments
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="upcoming">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                    <SelectItem value="all">All Events</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scheduledEvents.length > 0 ? (
              <div className="space-y-4">
                {scheduledEvents.map((event) => (
                  <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-md hover:bg-accent/10 transition-colors">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1 md:col-span-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{event.location}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Role: {event.role}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You have no upcoming shifts scheduled.</p>
                <Button variant="outline" className="mt-4">Find Opportunities</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Hours</CardTitle>
            <CardDescription>
              Record your volunteer hours for completed events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event1">Community Food Distribution</SelectItem>
                      <SelectItem value="event2">Monthly Volunteer Meeting</SelectItem>
                      <SelectItem value="event3">Other (specify)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours</label>
                  <Input type="number" placeholder="Enter hours" min="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Service</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="admin">Administrative</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input placeholder="Add any additional details" />
              </div>
              <Button onClick={handleSubmitHours}>Submit Hours</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours Summary</CardTitle>
            <CardDescription>
              Overview of your volunteer hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md text-center">
                  <p className="text-lg font-semibold">32</p>
                  <p className="text-sm text-muted-foreground">Hours this month</p>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <p className="text-lg font-semibold">156</p>
                  <p className="text-sm text-muted-foreground">Hours this year</p>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <p className="text-lg font-semibold">243</p>
                  <p className="text-sm text-muted-foreground">Total hours</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                  <p className="font-medium">Download Certificate</p>
                  <p className="text-sm text-muted-foreground">Get a certificate of your volunteer hours</p>
                </div>
                <Button variant="outline">Generate Certificate</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerSchedule;

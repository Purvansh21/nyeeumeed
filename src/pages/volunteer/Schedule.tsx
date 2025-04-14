
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  getVolunteerRegistrations, 
  logVolunteerHours, 
  cancelRegistration,
  getVolunteerHoursSummary
} from "@/services/volunteerService";
import { format, parseISO } from "date-fns";
import { VolunteerRegistration, VolunteerHours } from "@/types/volunteer";

const VolunteerSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledEvents, setScheduledEvents] = useState<VolunteerRegistration[]>([]);
  const [hoursSummary, setHoursSummary] = useState<VolunteerHours | null>(null);
  const [filterStatus, setFilterStatus] = useState("upcoming");
  
  // Form state for logging hours
  const [selectedEvent, setSelectedEvent] = useState("");
  const [logDate, setLogDate] = useState("");
  const [hoursLogged, setHoursLogged] = useState("");
  const [activityType, setActivityType] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const [registrations, hours] = await Promise.all([
          getVolunteerRegistrations(user.id),
          getVolunteerHoursSummary(user.id)
        ]);
        
        setScheduledEvents(registrations);
        setHoursSummary(hours);
      } catch (error) {
        console.error("Error loading volunteer schedule data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "There was an error loading your schedule. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, toast]);

  const getFilteredEvents = () => {
    if (!scheduledEvents.length) return [];
    
    const now = new Date();
    
    return scheduledEvents.filter(event => {
      if (!event.opportunity) return false;
      
      const startTime = parseISO(event.opportunity.start_time);
      const isUpcoming = startTime > now && event.status === 'registered';
      const isPast = startTime < now || event.status !== 'registered';
      
      if (filterStatus === "upcoming") return isUpcoming;
      if (filterStatus === "past") return isPast;
      return true;
    });
  };

  const handleCancelRegistration = async (event: VolunteerRegistration) => {
    if (!event.opportunity) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to cancel this registration? This action cannot be undone."
    );
    
    if (confirmed) {
      const success = await cancelRegistration(event.id, event.opportunity.id);
      if (success) {
        // Update the local state
        setScheduledEvents(prev => 
          prev.map(e => e.id === event.id ? { ...e, status: 'cancelled' } : e)
        );
      }
    }
  };

  const handleSubmitHours = async () => {
    if (!selectedEvent || !hoursLogged) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select an event and enter hours"
      });
      return;
    }
    
    const hours = parseFloat(hoursLogged);
    if (isNaN(hours) || hours <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid hours",
        description: "Please enter a valid number of hours"
      });
      return;
    }
    
    const success = await logVolunteerHours(
      selectedEvent, 
      hours,
      notes
    );
    
    if (success) {
      // Update local state
      setScheduledEvents(prev => 
        prev.map(e => e.id === selectedEvent ? 
          { ...e, status: 'completed', hours_logged: hours, completed_at: new Date().toISOString() } 
          : e
        )
      );
      
      // Reset form
      setSelectedEvent("");
      setLogDate("");
      setHoursLogged("");
      setActivityType("");
      setNotes("");
      
      // Refresh hours summary
      if (user) {
        const updatedHours = await getVolunteerHoursSummary(user.id);
        setHoursSummary(updatedHours);
      }
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

  const filteredEvents = getFilteredEvents();
  const completedEvents = scheduledEvents.filter(e => e.status === 'completed');

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
                <Select 
                  value={filterStatus} 
                  onValueChange={setFilterStatus}
                >
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
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-md hover:bg-accent/10 transition-colors">
                    <div>
                      <h4 className="font-medium">{event.opportunity?.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {event.opportunity?.date ? formatDateFromISO(event.opportunity.date) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {event.opportunity?.start_time && event.opportunity?.end_time
                              ? formatTimeRange(event.opportunity.start_time, event.opportunity.end_time)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 md:col-span-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{event.opportunity?.location || 'N/A'}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Status: {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      {event.status === 'registered' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelRegistration(event)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {filterStatus === "upcoming" 
                    ? "You have no upcoming shifts scheduled."
                    : filterStatus === "past"
                      ? "You have no past volunteer activities."
                      : "You have no volunteer activities in your schedule."}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/volunteer/opportunities'}>
                  Find Opportunities
                </Button>
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
                  <Select 
                    value={selectedEvent} 
                    onValueChange={setSelectedEvent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduledEvents
                        .filter(event => 
                          event.status === 'registered' && 
                          event.opportunity && 
                          new Date(event.opportunity.start_time) <= new Date()
                        )
                        .map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.opportunity?.title || 'Unnamed Event'}
                          </SelectItem>
                        ))}
                      <SelectItem value="other">Other (specify)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date" 
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours</label>
                  <Input 
                    type="number" 
                    placeholder="Enter hours" 
                    min="0" 
                    step="0.5"
                    value={hoursLogged}
                    onChange={(e) => setHoursLogged(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Type</label>
                  <Select 
                    value={activityType}
                    onValueChange={setActivityType}
                  >
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
                <Input 
                  placeholder="Add any additional details" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                  <p className="text-lg font-semibold">{hoursSummary?.monthly || 0}</p>
                  <p className="text-sm text-muted-foreground">Hours this month</p>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <p className="text-lg font-semibold">{hoursSummary?.yearly || 0}</p>
                  <p className="text-sm text-muted-foreground">Hours this year</p>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <p className="text-lg font-semibold">{hoursSummary?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total hours</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                  <p className="font-medium">Download Certificate</p>
                  <p className="text-sm text-muted-foreground">Get a certificate of your volunteer hours</p>
                </div>
                <Button 
                  variant="outline" 
                  disabled={!hoursSummary?.total || hoursSummary.total < 10}
                >
                  Generate Certificate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerSchedule;

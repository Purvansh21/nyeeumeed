
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, MapPin, User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  getVolunteerRegistrations, 
  logVolunteerHours, 
  cancelRegistration,
  getVolunteerHoursSummary
} from "@/services/volunteerService";
import { format, parseISO } from "date-fns";
import { VolunteerRegistration, VolunteerHours } from "@/types/volunteer";
import ScheduleCalendar from "@/components/volunteer/ScheduleCalendar";
import EventDetailsDialog from "@/components/volunteer/EventDetailsDialog";
import LogHoursForm from "@/components/volunteer/LogHoursForm";

const VolunteerSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledEvents, setScheduledEvents] = useState<VolunteerRegistration[]>([]);
  const [hoursSummary, setHoursSummary] = useState<VolunteerHours | null>(null);
  const [filterStatus, setFilterStatus] = useState("upcoming");
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Event details dialog state
  const [selectedEvent, setSelectedEvent] = useState<VolunteerRegistration | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const refreshData = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const [registrations, hours] = await Promise.all([
        getVolunteerRegistrations(user.id),
        getVolunteerHoursSummary(user.id)
      ]);
      
      setScheduledEvents(registrations);
      setHoursSummary(hours);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        // Close the dialog if it's open
        if (detailsOpen) {
          setDetailsOpen(false);
        }
        
        toast({
          title: "Registration cancelled",
          description: "Your registration has been successfully cancelled"
        });
      }
    }
  };

  const handleViewDetails = (event: VolunteerRegistration) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleCalendarDayClick = (date: Date) => {
    setSelectedDate(date);
    // Switch to list view with focus on the selected date
    setViewMode("list");
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
                <Button 
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {viewMode === "calendar" ? "List View" : "Calendar View"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "list" ? (
              filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-md hover:bg-accent/10 transition-colors">
                      <div>
                        <h4 className="font-medium">{event.opportunity?.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(event)}
                        >
                          View Details
                        </Button>
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
              )
            ) : (
              <ScheduleCalendar 
                events={scheduledEvents} 
                onDayClick={handleCalendarDayClick} 
              />
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="log-hours">
          <TabsList className="mb-4">
            <TabsTrigger value="log-hours">Log Hours</TabsTrigger>
            <TabsTrigger value="summary">Hours Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log-hours">
            <LogHoursForm events={scheduledEvents} onSuccess={refreshData} />
          </TabsContent>
          
          <TabsContent value="summary">
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
          </TabsContent>
        </Tabs>

        {/* Event Details Dialog */}
        <EventDetailsDialog 
          event={selectedEvent} 
          open={detailsOpen} 
          onOpenChange={setDetailsOpen}
          onCancel={handleCancelRegistration}
        />
      </div>
    </DashboardLayout>
  );
};

export default VolunteerSchedule;


import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAppointments, Appointment, updateAppointment } from "@/services/beneficiaryService";
import { useToast } from "@/hooks/use-toast";

interface AppointmentListProps {
  onNewAppointment?: () => void;
  refreshKey?: number;
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const AppointmentList = ({ 
  onNewAppointment, 
  refreshKey = 0, 
  limit,
  showViewAll = false,
  onViewAll
}: AppointmentListProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAppointments();
        setAppointments(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [refreshKey]);

  const handleCancelAppointment = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
      if (!confirmed) return;
      
      const result = await updateAppointment(id, { 
        status: "cancelled", 
        updated_at: new Date().toISOString() 
      });
      
      if (result) {
        // Update the local state to reflect the change
        setAppointments(prev => prev.map(appt => 
          appt.id === id ? { ...appt, status: "cancelled" } : appt
        ));
        
        toast({
          title: "Appointment Cancelled",
          description: "Your appointment has been cancelled"
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const displayAppointments = limit 
    ? appointments.slice(0, limit) 
    : appointments;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[230px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{limit ? "Upcoming Appointments" : "My Appointments"}</CardTitle>
            <CardDescription>
              Manage your scheduled meetings and services
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={onNewAppointment}>
              Request Appointment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayAppointments.length > 0 ? (
          <div className="space-y-4">
            {displayAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-md border">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{appointment.title}</h3>
                      {appointment.is_virtual ? (
                        <Badge className="bg-blue-500/10 text-blue-700">Virtual</Badge>
                      ) : (
                        <Badge className="bg-violet-500/10 text-violet-700">In-person</Badge>
                      )}
                      {appointment.status === "cancelled" && (
                        <Badge variant="outline" className="text-destructive">Cancelled</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {appointment.is_virtual ? "Virtual Meeting" : appointment.location || "Location TBD"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Staff: {appointment.staff?.full_name || "To be assigned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {appointment.status !== "cancelled" && (
                      <>
                        {appointment.is_virtual && (
                          <Button>
                            Join Meeting
                          </Button>
                        )}
                        <Button variant="outline">
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === "cancelled" && (
                      <Button>
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You don't have any scheduled appointments.</p>
            <Button className="mt-4" onClick={onNewAppointment}>
              Schedule Appointment
            </Button>
          </div>
        )}
        
        {showViewAll && appointments.length > limit! && (
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={onViewAll}>
              View All Appointments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentList;


import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Calendar, Clock, User, MapPin, CheckCircle, XCircle, Edit, Trash,
  Filter, RefreshCw, Plus, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAppointments, updateAppointment } from "@/services/staffService";
import { Appointment } from "@/types/staff";

const statusColors = {
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  "in-progress": "bg-yellow-500",
};

const StaffAppointments = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["staff-appointments"],
    queryFn: fetchAppointments,
  });

  const updateMutation = useMutation({
    mutationFn: (appointment: Partial<Appointment>) => 
      updateAppointment(appointment.id as string, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-appointments"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update appointment",
      });
    },
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      !searchTerm ||
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.beneficiary?.full_name && 
        appointment.beneficiary.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingAppointments = filteredAppointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "in-progress"
  );

  const pastAppointments = filteredAppointments.filter(
    (appointment) => appointment.status === "completed" || appointment.status === "cancelled"
  );

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    updateMutation.mutate({
      id: appointmentId,
      status: newStatus as Appointment["status"],
    });
  };

  const handleOpenEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleUpdateAppointment = () => {
    if (selectedAppointment) {
      updateMutation.mutate(selectedAppointment);
    }
  };

  const columns = [
    {
      id: "date",
      header: "Date/Time",
      cell: (appointment: Appointment) => (
        <div className="flex flex-col">
          <div className="flex items-center font-medium">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            {format(new Date(appointment.date), "MMM dd, yyyy")}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-3 w-3" />
            {appointment.time_slot}
          </div>
        </div>
      ),
    },
    {
      id: "beneficiary",
      header: "Beneficiary",
      cell: (appointment: Appointment) => (
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{appointment.beneficiary?.full_name || "Unknown"}</span>
        </div>
      ),
    },
    {
      id: "title",
      header: "Title",
      cell: (appointment: Appointment) => (
        <div className="font-medium">{appointment.title}</div>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (appointment: Appointment) => (
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            {appointment.is_virtual ? "Virtual" : appointment.location || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (appointment: Appointment) => (
        <Badge
          className={`${
            statusColors[appointment.status] || "bg-gray-500"
          } hover:${statusColors[appointment.status] || "bg-gray-600"}`}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (appointment: Appointment) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditDialog(appointment)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {appointment.status === "scheduled" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(appointment.id, "completed")}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {appointment.status !== "cancelled" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(appointment.id, "cancelled")}
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    console.error("Error loading appointments:", error);
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground">
            Schedule, track, and manage appointments for beneficiaries
          </p>
        </div>
        <Button variant="default" className="flex items-center gap-1">
          <Plus size={16} /> New Appointment
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search appointments..."
            className="h-10 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<Search className="h-4 w-4" />}
          />
          <Select value={statusFilter || ""} onValueChange={(val) => setStatusFilter(val || null)}>
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["staff-appointments"] })}
        >
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading appointments...</p>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <DataTable
              data={upcomingAppointments}
              columns={columns}
              emptyState={
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-lg font-medium">No upcoming appointments found</p>
                  <p className="text-sm text-muted-foreground">
                    Try clearing your filters or create a new appointment
                  </p>
                </div>
              }
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg font-medium">No upcoming appointments found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter
                    ? "Try clearing your filters"
                    : "Schedule a new appointment to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="past" className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading appointments...</p>
            </div>
          ) : pastAppointments.length > 0 ? (
            <DataTable
              data={pastAppointments}
              columns={columns}
              emptyState={
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-lg font-medium">No past appointments found</p>
                  <p className="text-sm text-muted-foreground">
                    Past appointments will appear here once completed or cancelled
                  </p>
                </div>
              }
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg font-medium">No past appointments found</p>
                <p className="text-sm text-muted-foreground">
                  Past appointments will appear here once completed or cancelled
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update appointment details and status
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  value={selectedAppointment.title}
                  onChange={(e) =>
                    setSelectedAppointment({
                      ...selectedAppointment,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Input
                  id="notes"
                  value={selectedAppointment.notes || ""}
                  onChange={(e) =>
                    setSelectedAppointment({
                      ...selectedAppointment,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(value) =>
                    setSelectedAppointment({
                      ...selectedAppointment,
                      status: value as Appointment["status"],
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffAppointments;

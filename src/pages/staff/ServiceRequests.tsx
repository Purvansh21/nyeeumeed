
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Clock, User, AlertCircle, CheckCircle, XCircle, Edit, 
  Filter, RefreshCw, Plus, Search, FileText
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
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchServiceRequests, updateServiceRequest } from "@/services/staffService";
import { ServiceRequest } from "@/types/staff";

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const statusColors = {
  pending: "bg-yellow-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
};

const StaffServiceRequests = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: serviceRequests = [], isLoading, error } = useQuery({
    queryKey: ["service-requests"],
    queryFn: fetchServiceRequests,
  });

  const updateMutation = useMutation({
    mutationFn: (request: Partial<ServiceRequest>) => 
      updateServiceRequest(request.id as string, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast({
        title: "Success",
        description: "Service request updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service request",
      });
    },
  });

  const filteredRequests = serviceRequests.filter((request) => {
    const matchesSearch =
      !searchTerm ||
      request.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.beneficiary?.full_name && 
        request.beneficiary.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.description && 
        request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesUrgency = !urgencyFilter || request.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const activeRequests = filteredRequests.filter(
    (request) => request.status === "pending" || request.status === "in-progress"
  );

  const completedRequests = filteredRequests.filter(
    (request) => request.status === "completed" || request.status === "cancelled"
  );

  const handleStatusChange = (requestId: string, newStatus: string) => {
    updateMutation.mutate({
      id: requestId,
      status: newStatus as ServiceRequest["status"],
    });
  };

  const handleAssignToMe = (requestId: string, userId: string) => {
    updateMutation.mutate({
      id: requestId,
      assigned_staff: userId,
      status: "in-progress",
    });
  };

  const handleOpenEditDialog = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleUpdateRequest = () => {
    if (selectedRequest) {
      updateMutation.mutate(selectedRequest);
    }
  };

  const columns = [
    {
      id: "urgency",
      header: "Priority",
      cell: (request: ServiceRequest) => (
        <Badge
          className={`${
            priorityColors[request.urgency as keyof typeof priorityColors] || "bg-gray-500"
          } hover:${priorityColors[request.urgency as keyof typeof priorityColors] || "bg-gray-600"}`}
        >
          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
        </Badge>
      ),
    },
    {
      id: "created_at",
      header: "Requested",
      cell: (request: ServiceRequest) => (
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(request.created_at), "MMM dd, yyyy")}</span>
        </div>
      ),
    },
    {
      id: "beneficiary",
      header: "Beneficiary",
      cell: (request: ServiceRequest) => (
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{request.beneficiary?.full_name || "Unknown"}</span>
        </div>
      ),
    },
    {
      id: "service_type",
      header: "Service Type",
      cell: (request: ServiceRequest) => (
        <div className="font-medium">
          {request.service_type}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                  <FileText className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{request.description || "No description provided"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (request: ServiceRequest) => (
        <Badge
          className={`${
            statusColors[request.status as keyof typeof statusColors] || "bg-gray-500"
          } hover:${statusColors[request.status as keyof typeof statusColors] || "bg-gray-600"}`}
        >
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (request: ServiceRequest) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditDialog(request)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          {(request.status === "pending" || request.status === "in-progress") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(request.id, "completed")}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          
          {request.status !== "cancelled" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(request.id, "cancelled")}
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    console.error("Error loading service requests:", error);
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
          <p className="text-muted-foreground">
            Manage and respond to beneficiary service requests
          </p>
        </div>
        <Button variant="default" className="flex items-center gap-1">
          <Plus size={16} /> New Request
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search requests..."
            className="h-10 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<Search className="h-4 w-4" />}
          />
          <Select value={statusFilter || ""} onValueChange={(val) => setStatusFilter(val || null)}>
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter || ""} onValueChange={(val) => setUrgencyFilter(val || null)}>
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["service-requests"] })}
        >
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeRequests.length})
            {activeRequests.some(req => req.urgency === "high") && (
              <AlertCircle className="ml-1 h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading service requests...</p>
            </div>
          ) : activeRequests.length > 0 ? (
            <DataTable
              data={activeRequests}
              columns={columns}
              emptyState={
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-lg font-medium">No active service requests found</p>
                  <p className="text-sm text-muted-foreground">
                    Try clearing your filters or create a new request
                  </p>
                </div>
              }
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg font-medium">No active service requests found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter || urgencyFilter
                    ? "Try clearing your filters"
                    : "All service requests have been addressed"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading service requests...</p>
            </div>
          ) : completedRequests.length > 0 ? (
            <DataTable
              data={completedRequests}
              columns={columns}
              emptyState={
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-lg font-medium">No completed service requests found</p>
                  <p className="text-sm text-muted-foreground">
                    Completed requests will appear here
                  </p>
                </div>
              }
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg font-medium">No completed service requests found</p>
                <p className="text-sm text-muted-foreground">
                  Completed requests will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service Request</DialogTitle>
            <DialogDescription>
              Update service request details and status
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) =>
                    setSelectedRequest({
                      ...selectedRequest,
                      status: value as ServiceRequest["status"],
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="urgency" className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={selectedRequest.urgency}
                  onValueChange={(value) =>
                    setSelectedRequest({
                      ...selectedRequest,
                      urgency: value as ServiceRequest["urgency"],
                    })
                  }
                >
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="next_step" className="text-sm font-medium">
                  Next Steps
                </label>
                <Input
                  id="next_step"
                  value={selectedRequest.next_step || ""}
                  onChange={(e) =>
                    setSelectedRequest({
                      ...selectedRequest,
                      next_step: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRequest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffServiceRequests;

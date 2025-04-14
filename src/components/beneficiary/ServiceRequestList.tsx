
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, CheckCircle, Clock, XCircle, MessageCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchServiceRequests, ServiceRequest, updateServiceRequest } from "@/services/beneficiaryService";
import { useToast } from "@/hooks/use-toast";

interface ServiceRequestListProps {
  onNewRequest?: () => void;
  refreshKey?: number;
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const ServiceRequestList = ({ 
  onNewRequest, 
  refreshKey = 0, 
  limit,
  showViewAll = false,
  onViewAll
}: ServiceRequestListProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const data = await fetchServiceRequests();
        setRequests(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [refreshKey]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return "bg-green-500/20 text-green-700";
      case "pending":
        return "bg-yellow-500/20 text-yellow-700";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      case "completed":
        return "bg-blue-500/20 text-blue-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch(status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to cancel this request?");
      if (!confirmed) return;
      
      const result = await updateServiceRequest(id, { status: "rejected", updated_at: new Date().toISOString() });
      
      if (result) {
        // Update the local state to reflect the change
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "rejected" } : req));
        
        toast({
          title: "Request Cancelled",
          description: "Your service request has been cancelled"
        });
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
    }
  };

  const getFilteredRequests = () => {
    return requests.filter(request => {
      const matchesSearch = request.service_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const displayRequests = limit 
    ? getFilteredRequests().slice(0, limit) 
    : getFilteredRequests();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
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
            <CardTitle>{limit ? "Recent Service Requests" : "My Service Requests"}</CardTitle>
            <CardDescription>
              Track all your service requests and their status
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!limit && (
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search services..."
                    className="pl-8 w-[200px] md:w-[260px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  defaultValue={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Button onClick={onNewRequest}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Request Service
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayRequests.length > 0 ? (
          <div className="space-y-4">
            {displayRequests.map((request) => (
              <div key={request.id} className="p-4 rounded-md border">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${
                      request.status === "approved" 
                        ? "bg-green-500/10" 
                        : request.status === "pending"
                        ? "bg-yellow-500/10"
                        : request.status === "rejected"
                        ? "bg-destructive/10"
                        : "bg-blue-500/10"
                    }`}>
                      <StatusIcon status={request.status} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{request.service_type}</h3>
                        <div className={`text-xs px-2 py-1 rounded capitalize ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requested on {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.next_step && (
                        <p className="text-sm mt-1">
                          {request.next_step}
                        </p>
                      )}
                      {request.assigned_staff && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <span>Assigned to:</span>
                          <Badge variant="outline">{request.assigned_staff}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      View Details
                    </Button>
                    {request.status === "approved" && (
                      <Button variant="outline" className="bg-green-500/10 border-green-600/20 text-green-600 hover:text-green-600 hover:bg-green-500/20">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Staff
                      </Button>
                    )}
                    {request.status === "pending" && (
                      <Button 
                        variant="outline" 
                        className="bg-destructive/10 border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/20"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No service requests found matching your criteria." 
                : "You haven't submitted any service requests yet."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
        
        {showViewAll && requests.length > limit! && (
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={onViewAll}>
              View All Service Requests
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceRequestList;

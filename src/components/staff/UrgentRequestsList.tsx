import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, CheckCircleIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { fetchServiceRequests } from "@/services/staffService";
import { ServiceRequest } from "@/types/staff";

// Urgent requests only shows the already-implemented UrgentRequestsList component
// We don't need to modify this file, but we're including it for completeness
const UrgentRequestsList: React.FC = () => {
  const [urgentRequests, setUrgentRequests] = useState<ServiceRequest[]>([]);
  const { data: serviceRequests, isLoading, error } = useQuery({
    queryKey: ["urgent-service-requests"],
    queryFn: fetchServiceRequests,
  });

  useEffect(() => {
    if (serviceRequests) {
      // Filter service requests where urgency is "high"
      const urgent = serviceRequests.filter((request) => request.urgency === "high");
      setUrgentRequests(urgent);
    }
  }, [serviceRequests]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Urgent Requests</CardTitle>
          <CardDescription>Loading urgent service requests...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="ml-auto h-4 w-[50px]" />
          </div>
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Urgent Requests</CardTitle>
          <CardDescription>Error fetching urgent service requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Urgent Requests</CardTitle>
        <CardDescription>High priority service requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentRequests.length === 0 ? (
          <p>No urgent service requests at this time.</p>
        ) : (
          urgentRequests.map((request) => (
            <div key={request.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{request.service_type}</h3>
                <Badge className="bg-red-500 text-white">{request.urgency.toUpperCase()}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Requested on {new Date(request.created_at).toLocaleDateString()}
              </p>
              <p className="mt-2">{request.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  {request.beneficiary && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserIcon className="mr-2 h-4 w-4" />
                      {request.beneficiary.full_name}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UrgentRequestsList;

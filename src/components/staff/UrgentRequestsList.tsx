import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { fetchUrgentServiceRequests, verifyServiceRequest } from "@/services/beneficiaryService";
import { fetchUrgentRequests, verifyUrgentRequest } from "@/services/urgentRequestService";

const UrgentRequestsList: React.FC = () => {
  const { user } = useAuth();
  
  const { data: urgentRequests, isLoading, error, refetch } = useQuery({
    queryKey: ["urgent-service-requests"],
    queryFn: fetchUrgentServiceRequests,
  });

  const handleVerifyRequest = async (id: string, verified: boolean) => {
    if (!user) return;
    
    try {
      const result = await verifyServiceRequest(
        id,
        {
          verification_status: verified ? 'verified' : 'rejected',
          verification_notes: verified ? 'Request approved as urgent' : 'Request deemed not urgent',
          verified_by: user.id
        }
      );
      
      if (result) {
        toast({
          title: "Success",
          description: `Request ${verified ? 'verified' : 'rejected'} successfully`
        });
        refetch();
      }
    } catch (error) {
      console.error("Error verifying request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the request"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Urgent Requests</CardTitle>
          <CardDescription>Loading urgent service requests...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="ml-auto h-4 w-[50px]" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
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
          <div className="flex items-center p-4 text-red-600 bg-red-50 rounded-lg">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <span>
              {(error as Error).message || "An error occurred while loading urgent requests."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Urgent Requests</CardTitle>
        <CardDescription>High priority service requests that need verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!urgentRequests || urgentRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <CheckCircleIcon className="h-12 w-12 mb-3 text-gray-400" />
            <p>No urgent service requests at this time.</p>
          </div>
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
              
              {/* Verification Status */}
              {request.verification_status && (
                <div className="mt-2">
                  <Badge className={
                    request.verification_status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : request.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {request.verification_status === 'verified' 
                      ? 'Verified' 
                      : request.verification_status === 'rejected'
                      ? 'Rejected'
                      : 'Pending Verification'}
                  </Badge>
                  
                  {request.verification_notes && (
                    <p className="text-sm mt-1 italic">{request.verification_notes}</p>
                  )}
                </div>
              )}
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Contact: {request.preferred_contact_method || "Not specified"}
                </div>
                
                {/* Only show verification buttons if not already verified or rejected */}
                {(!request.verification_status || request.verification_status === 'unverified') && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleVerifyRequest(request.id, true)}
                      className="bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Verify as Urgent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVerifyRequest(request.id, false)}
                      className="bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UrgentRequestsList;

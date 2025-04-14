
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { 
  AlertTriangle, 
  Check, 
  CheckCircle, 
  Clock, 
  Phone, 
  X, 
  XCircle 
} from "lucide-react";
import { ServiceRequest, fetchUrgentServiceRequests, verifyServiceRequest } from "@/services/beneficiaryService";

export default function UrgentRequestsList() {
  const { user } = useAuth();
  const [urgentRequests, setUrgentRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  useEffect(() => {
    const loadUrgentRequests = async () => {
      setIsLoading(true);
      const data = await fetchUrgentServiceRequests();
      setUrgentRequests(data);
      setIsLoading(false);
    };
    
    loadUrgentRequests();
  }, [refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const openVerifyDialog = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setVerificationNotes("");
    setIsVerifyDialogOpen(true);
  };
  
  const openRejectDialog = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setVerificationNotes("");
    setIsRejectDialogOpen(true);
  };
  
  const handleVerify = async () => {
    if (!selectedRequest || !user) return;
    
    const result = await verifyServiceRequest(selectedRequest.id, {
      verification_status: 'verified',
      verification_notes: verificationNotes,
      verified_by: user.id
    });
    
    if (result) {
      setIsVerifyDialogOpen(false);
      handleRefresh();
      toast({
        title: "Request Verified",
        description: "The urgent request has been verified and approved."
      });
    }
  };
  
  const handleReject = async () => {
    if (!selectedRequest || !user) return;
    
    const result = await verifyServiceRequest(selectedRequest.id, {
      verification_status: 'rejected',
      verification_notes: verificationNotes,
      verified_by: user.id
    });
    
    if (result) {
      setIsRejectDialogOpen(false);
      handleRefresh();
      toast({
        title: "Request Rejected",
        description: "The urgent request has been rejected."
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-700"><Clock className="mr-1 h-4 w-4" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-700"><Check className="mr-1 h-4 w-4" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive"><X className="mr-1 h-4 w-4" /> Rejected</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-700"><CheckCircle className="mr-1 h-4 w-4" /> Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getVerificationBadge = (request: ServiceRequest) => {
    if (!request.verification_status) {
      return <Badge variant="outline"><AlertTriangle className="mr-1 h-4 w-4" /> Unverified</Badge>;
    }
    
    switch(request.verification_status) {
      case "verified":
        return <Badge className="bg-green-500/20 text-green-700"><CheckCircle className="mr-1 h-4 w-4" /> Verified</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive"><XCircle className="mr-1 h-4 w-4" /> Rejected</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="mr-1 h-4 w-4" /> Unverified</Badge>;
    }
  };
  
  const getContactMethodIcon = (method: string | null) => {
    if (!method) return null;
    
    switch(method.toLowerCase()) {
      case "phone":
        return <Phone className="h-4 w-4 mr-1" />;
      case "email":
        return <span className="mr-1">📧</span>;
      case "text":
        return <span className="mr-1">💬</span>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Urgent Service Requests
            </CardTitle>
            <CardDescription>
              Verify and respond to high priority service requests
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : urgentRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No urgent service requests found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Contact Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urgentRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell>{request.service_type}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={request.description || ""}>
                      {request.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getContactMethodIcon(request.preferred_contact_method)}
                      {request.preferred_contact_method || "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{getVerificationBadge(request)}</TableCell>
                  <TableCell className="text-right">
                    {!request.verification_status && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => openVerifyDialog(request)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openRejectDialog(request)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {request.verification_status && (
                      <div className="text-sm text-muted-foreground">
                        {request.verification_date && formatDate(request.verification_date)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Verify Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Urgent Request</DialogTitle>
            <DialogDescription>
              Verifying this request will mark it as approved and notify the beneficiary.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="space-y-2">
                <div><strong>Service Type:</strong> {selectedRequest.service_type}</div>
                <div><strong>Description:</strong> {selectedRequest.description || "No description"}</div>
                <div><strong>Requested:</strong> {formatDate(selectedRequest.created_at)}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="font-medium">
                Verification Notes
              </label>
              <Textarea
                placeholder="Enter any notes about the verification (optional)"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerify}>
              Verify Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Urgent Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this request? Please provide a reason for the rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter reason for rejection"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

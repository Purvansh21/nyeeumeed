
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, Calendar, Phone, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const VolunteerBeneficiaries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for assigned beneficiaries
  const assignedBeneficiaries = [
    { 
      id: 1, 
      name: "Jane Smith", 
      services: ["Education Support", "Food Assistance"], 
      lastContact: "2 days ago", 
      nextCheckIn: "Apr 25, 2025",
      contactInfo: {
        phone: "555-123-4567",
        email: "jane.smith@example.com"
      },
      notes: "Prefers morning visits. Has two children in elementary school."
    },
    { 
      id: 2, 
      name: "Robert Johnson", 
      services: ["Health Check-ups", "Counseling"], 
      lastContact: "1 week ago", 
      nextCheckIn: "Apr 30, 2025",
      contactInfo: {
        phone: "555-987-6543",
        email: "robert.johnson@example.com"
      },
      notes: "Needs assistance with medication management. Prefer visits on weekends."
    },
    { 
      id: 3, 
      name: "Maria Garcia", 
      services: ["Housing Support", "Job Training"], 
      lastContact: "3 days ago", 
      nextCheckIn: "May 2, 2025",
      contactInfo: {
        phone: "555-567-8901",
        email: "maria.garcia@example.com"
      },
      notes: "Currently in temporary housing. Looking for work in administrative roles."
    },
  ];

  const filteredBeneficiaries = assignedBeneficiaries.filter(beneficiary => 
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleContact = (beneficiaryId: number) => {
    toast({
      title: "Contact initiated",
      description: "You're now contacting this beneficiary.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Beneficiaries</h1>
          <p className="text-muted-foreground">
            Manage and assist beneficiaries assigned to you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Your Beneficiaries</CardTitle>
                <CardDescription>
                  Individuals you are assigned to assist
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search beneficiaries..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBeneficiaries.length > 0 ? (
              <div className="space-y-6">
                {filteredBeneficiaries.map((beneficiary) => (
                  <Tabs key={beneficiary.id} defaultValue="overview" className="border rounded-lg">
                    <div className="p-4 border-b">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-secondary/20 p-2">
                            <User className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{beneficiary.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {beneficiary.services.map((service, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs bg-muted px-2 py-0.5 rounded"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleContact(beneficiary.id)}>
                            Contact
                          </Button>
                          <Button size="sm">
                            Add Note
                          </Button>
                        </div>
                      </div>
                      <TabsList className="mt-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="assistance">Assistance History</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="overview" className="p-4 space-y-4">
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Last Contact:</span>
                          <span className="text-sm">{beneficiary.lastContact}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Next Check-in:</span>
                          <span className="text-sm">{beneficiary.nextCheckIn}</span>
                        </div>
                        <Separator />
                        <h4 className="font-medium pt-2">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{beneficiary.contactInfo.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{beneficiary.contactInfo.email}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="notes" className="p-4">
                      <div className="space-y-4">
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-sm">{beneficiary.notes}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">Added by: You - Apr 10, 2025</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Add a new note..." />
                          <Button>Add</Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="assistance" className="p-4">
                      <div className="space-y-4">
                        <div className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">Food Assistance Package</span>
                            </div>
                            <Badge>Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Provided weekly food package</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Apr 8, 2025</span>
                          </div>
                        </div>
                        <div className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">School Supplies Distribution</span>
                            </div>
                            <Badge>Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Provided notebooks, pens, and other school supplies</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Mar 25, 2025</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No beneficiaries found matching your search.</p>
                {searchTerm && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assistance Guidelines</CardTitle>
            <CardDescription>
              Best practices for beneficiary interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Communication</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Always communicate respectfully and clearly. Avoid technical jargon and ensure beneficiaries understand available services.
                </p>
              </div>
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Privacy & Confidentiality</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Protect all personal information and only discuss cases with authorized staff. Never share details with unauthorized persons.
                </p>
              </div>
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Documentation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Record all interactions accurately and promptly in the system. This ensures continuity of service and proper tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerBeneficiaries;

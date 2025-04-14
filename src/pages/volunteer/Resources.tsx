
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, CheckCircle, BookOpen, Play, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const VolunteerResources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for training resources
  const trainingResources = [
    { 
      id: 1, 
      title: "Basics of Community Service", 
      description: "Introduction to effective volunteering", 
      category: "Orientation",
      type: "Video",
      duration: "45 min",
      completed: true 
    },
    { 
      id: 2, 
      title: "Beneficiary Communication", 
      description: "Effective interaction with service recipients", 
      category: "Communication",
      type: "Interactive",
      duration: "60 min",
      completed: true 
    },
    { 
      id: 3, 
      title: "Privacy & Confidentiality", 
      description: "Guidelines for handling sensitive information", 
      category: "Policy",
      type: "Document",
      duration: "30 min",
      completed: false 
    },
    { 
      id: 4, 
      title: "Crisis Management", 
      description: "How to handle emergency situations", 
      category: "Safety",
      type: "Video",
      duration: "90 min",
      completed: false 
    },
    { 
      id: 5, 
      title: "Cultural Sensitivity", 
      description: "Working with diverse communities", 
      category: "Diversity",
      type: "Interactive",
      duration: "75 min",
      completed: false 
    },
  ];

  // Mock data for downloadable resources
  const downloadableResources = [
    {
      id: 1,
      title: "Volunteer Handbook",
      description: "Complete guide to volunteering with our organization",
      type: "PDF",
      fileSize: "2.4 MB"
    },
    {
      id: 2,
      title: "Safety Guidelines",
      description: "Important safety protocols for various volunteer activities",
      type: "PDF",
      fileSize: "1.8 MB"
    },
    {
      id: 3,
      title: "Reporting Templates",
      description: "Forms and templates for activity reporting",
      type: "ZIP",
      fileSize: "3.1 MB"
    },
    {
      id: 4,
      title: "Community Resource Map",
      description: "Map of community resources and support services",
      type: "PDF",
      fileSize: "5.2 MB"
    }
  ];

  const filteredResources = trainingResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "completed" && resource.completed) || 
                          (filterStatus === "pending" && !resource.completed);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleStartTraining = (resourceId: number) => {
    toast({
      title: "Training started",
      description: "You've started the training module.",
    });
  };

  const handleDownload = (resourceId: number) => {
    toast({
      title: "Download started",
      description: "Your resource is being downloaded.",
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
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
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
          <h1 className="text-3xl font-bold tracking-tight">Training & Resources</h1>
          <p className="text-muted-foreground">
            Access educational materials and resources to enhance your volunteering skills.
          </p>
        </div>

        <Tabs defaultValue="training" className="space-y-4">
          <TabsList>
            <TabsTrigger value="training">Training Modules</TabsTrigger>
            <TabsTrigger value="downloads">Downloadable Resources</TabsTrigger>
            <TabsTrigger value="progress">Skills Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Training Resources</CardTitle>
                    <CardDescription>
                      Materials to enhance your volunteering skills
                    </CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-8 w-full md:w-[260px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select 
                      value={filterStatus} 
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-full md:w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Resources</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredResources.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResources.map((resource) => (
                      <div key={resource.id} className="flex flex-col md:flex-row items-start gap-3 p-4 rounded-md border hover:bg-accent/10 transition-colors">
                        <div className={`rounded-full p-2 ${resource.completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                          {resource.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{resource.title}</p>
                                <Badge variant="outline" className="text-xs">
                                  {resource.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {resource.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {resource.duration}
                              </Badge>
                              <Badge variant="outline" className={resource.completed ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                                {resource.completed ? "Completed" : "To Complete"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="md:w-24"
                          onClick={() => handleStartTraining(resource.id)}
                        >
                          {resource.completed ? "Review" : (
                            <>
                              <Play className="h-3 w-3 mr-1" /> Start
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No resources found matching your criteria.</p>
                    <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle>Downloadable Resources</CardTitle>
                <CardDescription>
                  Useful documents and materials for your volunteer work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {downloadableResources.map((resource) => (
                    <div key={resource.id} className="p-4 border rounded-md">
                      <div className="flex justify-between">
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {resource.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{resource.fileSize}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDownload(resource.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>External Resources</CardTitle>
                <CardDescription>
                  Additional resources from partner organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Community Support Network</h3>
                          <Badge>Partner</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Access specialized training and community resources
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Site
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Volunteer Skills Academy</h3>
                          <Badge>Partner</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Free courses for volunteer skill development
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Site
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Skills Progress</CardTitle>
                <CardDescription>
                  Track your volunteer skill development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Communication Skills</span>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      4 out of 5 communication modules completed
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Beneficiary Support</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      3 out of 5 support modules completed
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Crisis Management</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      1 out of 5 crisis management modules completed
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Cultural Awareness</span>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      2 out of 5 cultural awareness modules completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Volunteer certifications you can earn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Basic Volunteer Certification</p>
                        <p className="text-sm text-muted-foreground">Complete all orientation modules</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-700">Completed</Badge>
                    </div>
                    <Progress value={100} className="h-2 mt-2" />
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Advanced Support Skills</p>
                        <p className="text-sm text-muted-foreground">Complete all beneficiary support modules</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700">In Progress</Badge>
                    </div>
                    <Progress value={60} className="h-2 mt-2" />
                  </div>
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Crisis Response Expert</p>
                        <p className="text-sm text-muted-foreground">Complete all safety and crisis modules</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-700">Not Started</Badge>
                    </div>
                    <Progress value={10} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerResources;

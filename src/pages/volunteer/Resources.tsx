
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, CheckCircle, BookOpen, Play, Download, ExternalLink, Video, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { VolunteerTrainingMaterial, VolunteerTrainingProgress } from "@/types/volunteer";
import { getTrainingMaterials, getTrainingProgress, updateTrainingProgress, downloadResource } from "@/services/resourceService";

const VolunteerResources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [trainingMaterials, setTrainingMaterials] = useState<VolunteerTrainingMaterial[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<VolunteerTrainingProgress[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load training materials
      const materials = await getTrainingMaterials();
      setTrainingMaterials(materials);

      // Load training progress if user is logged in
      if (user) {
        const progress = await getTrainingProgress(user.id);
        setTrainingProgress(progress);
      }
    } catch (error) {
      console.error("Error loading resources data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load resources",
        description: "There was an error loading your training resources."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare the resource list with progress information
  const resourcesWithProgress = trainingMaterials.map(material => {
    const progress = trainingProgress.find(p => p.material_id === material.id) || {
      status: 'not_started',
      started_at: undefined,
      completed_at: undefined
    };
    
    return {
      ...material,
      status: progress.status,
      completed: progress.status === 'completed'
    };
  });

  const filteredResources = resourcesWithProgress.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "completed" && resource.status === 'completed') || 
                          (filterStatus === "pending" && resource.status !== 'completed');
    return matchesSearch && matchesStatus;
  });

  const handleStartTraining = async (resourceId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to track your training progress."
      });
      return;
    }

    try {
      const resource = trainingMaterials.find(m => m.id === resourceId);
      if (!resource) return;

      const progress = trainingProgress.find(p => p.material_id === resourceId);
      const newStatus = progress?.status === 'completed' ? 'completed' : 'in_progress';
      
      const success = await updateTrainingProgress(user.id, resourceId, newStatus);
      
      if (success) {
        toast({
          title: newStatus === 'completed' ? "Reviewing training" : "Training started",
          description: newStatus === 'completed' ? 
            "You're reviewing the completed training module." : 
            "You've started the training module."
        });
        
        // Attempt to open the resource
        await handleDownload(resourceId);
        
        // Reload training progress
        loadData();
      }
    } catch (error) {
      console.error("Error starting training:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start training. Please try again."
      });
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const url = await downloadResource(resourceId);
      window.open(url, '_blank');
      
      toast({
        title: "Download initiated",
        description: "The resource is being downloaded or opened in a new tab."
      });
    } catch (error) {
      console.error("Error downloading resource:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading the resource."
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'interactive':
        return <Code className="h-5 w-5 text-green-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-green-500" />;
    }
  };

  // Calculate progress percentages
  const totalRequired = trainingMaterials.filter(m => m.is_required).length;
  const completedRequired = trainingProgress.filter(p => 
    p.status === 'completed' && 
    trainingMaterials.find(m => m.id === p.material_id)?.is_required
  ).length;
  
  const requiredProgress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  // Count by category
  const categoryCounts: Record<string, { total: number, completed: number }> = {};
  
  trainingMaterials.forEach(material => {
    if (!categoryCounts[material.category]) {
      categoryCounts[material.category] = { total: 0, completed: 0 };
    }
    categoryCounts[material.category].total++;
    
    const isCompleted = trainingProgress.some(p => 
      p.material_id === material.id && p.status === 'completed'
    );
    
    if (isCompleted) {
      categoryCounts[material.category].completed++;
    }
  });

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
                        <div className={`rounded-full p-2 ${resource.status === 'completed' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                          {resource.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            getTypeIcon(resource.content_type)
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
                                {resource.content_type}
                              </Badge>
                              {resource.is_required && (
                                <Badge variant="secondary" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              <Badge variant="outline" className={resource.status === 'completed' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                                {resource.status === 'completed' ? "Completed" : resource.status === 'in_progress' ? "In Progress" : "To Complete"}
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
                          {resource.status === 'completed' ? "Review" : (
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
                      <span className="text-sm font-medium">Required Training</span>
                      <span className="text-sm font-medium">{Math.round(requiredProgress)}%</span>
                    </div>
                    <Progress value={requiredProgress} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {completedRequired} out of {totalRequired} required modules completed
                    </p>
                  </div>
                  
                  {Object.entries(categoryCounts).map(([category, { total, completed }]) => {
                    const progress = total > 0 ? (completed / total) * 100 : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {completed} out of {total} {category} modules completed
                        </p>
                      </div>
                    );
                  })}
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
                        <p className="text-sm text-muted-foreground">Complete all required orientation modules</p>
                      </div>
                      <Badge variant="outline" className={requiredProgress >= 100 ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"}>
                        {requiredProgress >= 100 ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <Progress value={requiredProgress} className="h-2 mt-2" />
                  </div>
                  
                  {Object.entries(categoryCounts)
                    .filter(([category]) => ["communication", "safety", "ethics"].includes(category.toLowerCase()))
                    .map(([category, { total, completed }]) => {
                      const progress = total > 0 ? (completed / total) * 100 : 0;
                      const isComplete = progress >= 100;
                      const title = category.charAt(0).toUpperCase() + category.slice(1);
                      
                      return (
                        <div key={category} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{title} Specialist</p>
                              <p className="text-sm text-muted-foreground">Complete all {category.toLowerCase()} modules</p>
                            </div>
                            <Badge variant="outline" className={isComplete ? 
                              "bg-green-500/10 text-green-700" : 
                              progress > 0 ? "bg-amber-500/10 text-amber-700" : "bg-blue-500/10 text-blue-700"}>
                              {isComplete ? "Completed" : progress > 0 ? "In Progress" : "Not Started"}
                            </Badge>
                          </div>
                          <Progress value={progress} className="h-2 mt-2" />
                        </div>
                      );
                    })}
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

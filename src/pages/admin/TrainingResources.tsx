
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, Search, Edit, Trash2, Download, FileUp } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import { VolunteerTrainingMaterial } from "@/types/volunteer";
import { getTrainingMaterials } from "@/services/resourceService";
import { useToast } from "@/hooks/use-toast";

const AdminTrainingResources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<VolunteerTrainingMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    loadResources();
  }, []);
  
  const loadResources = async () => {
    try {
      setIsLoading(true);
      const data = await getTrainingMaterials();
      setResources(data);
    } catch (error) {
      console.error("Error loading resources:", error);
      toast({
        variant: "destructive",
        title: "Failed to load resources",
        description: "There was an error loading the training resources."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResourceCreated = () => {
    toast({
      title: "Resource Created",
      description: "The training resource has been successfully created."
    });
    loadResources();
  };
  
  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Resources</h1>
          <p className="text-muted-foreground">
            Manage training materials for volunteers
          </p>
        </div>
        
        <Tabs defaultValue="resources" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resources">Resources List</TabsTrigger>
            <TabsTrigger value="upload">Upload New Resource</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Training Resources</CardTitle>
                    <CardDescription>
                      All training materials available to volunteers
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search resources..."
                      className="pl-8 w-full md:w-[260px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading resources...</p>
                  </div>
                ) : filteredResources.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-4 p-4">
                          <div className="md:col-span-3 space-y-1">
                            <div className="flex items-center gap-2">
                              {resource.content_type === "document" ? (
                                <FileText className="h-5 w-5 text-blue-500" />
                              ) : resource.content_type === "video" ? (
                                <FileUp className="h-5 w-5 text-red-500" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-green-500" />
                              )}
                              <h3 className="font-medium">{resource.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">{resource.category}</Badge>
                              <Badge variant="outline">{resource.content_type}</Badge>
                              {resource.is_required && (
                                <Badge variant="secondary">Required</Badge>
                              )}
                            </div>
                          </div>
                          <div className="md:col-span-1 flex flex-row md:flex-col gap-2 justify-end items-end mt-3 md:mt-0">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No resources found matching your criteria.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload">
            <ResourceUploadForm onSuccess={handleResourceCreated} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminTrainingResources;

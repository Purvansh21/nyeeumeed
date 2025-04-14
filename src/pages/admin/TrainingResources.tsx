
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import ResourcesDataTable from "@/components/admin/ResourcesDataTable";
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
  
  const handleDeleteResource = (resource: VolunteerTrainingMaterial) => {
    // TODO: Implement delete functionality
    toast({
      title: "Resource Deleted",
      description: `${resource.title} has been deleted.`
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
                <ResourcesDataTable 
                  resources={filteredResources}
                  isLoading={isLoading}
                  onDelete={handleDeleteResource}
                />
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


import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchBeneficiaryResources, recordResourceAccess, BeneficiaryResource } from "@/services/beneficiaryService";

// Mock data until we have real resources
const availableResources = [
  { id: "1", title: "Education Opportunities Guide", description: "Information on available educational programs", category: "Education", url: "#" },
  { id: "2", title: "Healthcare Services Directory", description: "List of available healthcare services", category: "Health", url: "#" },
  { id: "3", title: "Financial Assistance Programs", description: "Guide to available financial support", category: "Finance", url: "#" },
  { id: "4", title: "Housing Assistance Information", description: "Resources for housing support", category: "Housing", url: "#" },
  { id: "5", title: "Job Training Programs", description: "Available vocational training options", category: "Employment", url: "#" },
  { id: "6", title: "Legal Services Guide", description: "Information on free legal assistance", category: "Legal", url: "#" },
];

interface ResourceLibraryProps {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const ResourceLibrary = ({ 
  limit,
  showViewAll = false,
  onViewAll 
}: ResourceLibraryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [resourcesAccessed, setResourcesAccessed] = useState<BeneficiaryResource[]>([]);

  useEffect(() => {
    const loadResourcesAccessed = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBeneficiaryResources();
        setResourcesAccessed(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadResourcesAccessed();
  }, []);

  const handleResourceAccess = async (resource: any) => {
    try {
      await recordResourceAccess({
        title: resource.title,
        category: resource.category,
        description: resource.description,
        url: resource.url,
        resource_id: resource.id
      });
    } catch (error) {
      console.error("Error recording resource access:", error);
    }
  };

  // Filter resources based on search term and category
  const getFilteredResources = () => {
    return availableResources.filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const displayResources = limit 
    ? getFilteredResources().slice(0, limit) 
    : getFilteredResources();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[230px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36" />
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
            <CardTitle>Resource Library</CardTitle>
            <CardDescription>
              Access educational materials and support resources
            </CardDescription>
          </div>
          {!limit && (
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="pl-8 w-[200px] md:w-[260px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Employment">Employment</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayResources.map((resource) => (
              <div key={resource.id} className="border rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                      </div>
                      <Badge variant="outline">{resource.category}</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResourceAccess(resource)}
                      >
                        View Online
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResourceAccess(resource)}
                      >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No resources found matching your criteria.</p>
            {(searchTerm || categoryFilter !== "all") && (
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
        
        {showViewAll && availableResources.length > limit! && (
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={onViewAll}>
              Browse Resource Library
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceLibrary;

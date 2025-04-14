
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VolunteerTrainingMaterial } from "@/types/volunteer";
import { DataTable } from "@/components/ui/data-table";
import { downloadResource } from "@/services/resourceService";
import { 
  FileText, 
  Video, 
  Code, 
  Download, 
  Edit, 
  Trash2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResourcesDataTableProps {
  resources: VolunteerTrainingMaterial[];
  onEdit?: (resource: VolunteerTrainingMaterial) => void;
  onDelete?: (resource: VolunteerTrainingMaterial) => void;
  isLoading?: boolean;
}

const ResourcesDataTable = ({ 
  resources, 
  onEdit, 
  onDelete,
  isLoading = false 
}: ResourcesDataTableProps) => {
  const { toast } = useToast();
  const [resourceToDelete, setResourceToDelete] = useState<VolunteerTrainingMaterial | null>(null);
  
  const handleDownload = async (resource: VolunteerTrainingMaterial) => {
    try {
      const url = await downloadResource(resource.id);
      window.open(url, '_blank');
      
      toast({
        title: "Download initiated",
        description: `${resource.title} is being downloaded.`
      });
    } catch (error) {
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
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'interactive':
        return <Code className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const columns = [
    {
      id: "title",
      header: "Title",
      cell: (resource: VolunteerTrainingMaterial) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(resource.content_type)}
          <div>
            <div className="font-medium">{resource.title}</div>
            <div className="text-sm text-muted-foreground">{resource.description}</div>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (resource: VolunteerTrainingMaterial) => (
        <Badge variant="outline">{resource.category}</Badge>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (resource: VolunteerTrainingMaterial) => (
        <Badge variant="outline">{resource.content_type}</Badge>
      ),
    },
    {
      id: "required",
      header: "Required",
      cell: (resource: VolunteerTrainingMaterial) => (
        <Badge variant={resource.is_required ? "secondary" : "outline"}>
          {resource.is_required ? "Required" : "Optional"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (resource: VolunteerTrainingMaterial) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload(resource)}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
          
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(resource)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-destructive"
              onClick={() => setResourceToDelete(resource)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-8">
      <FileText className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
      <p className="text-lg font-medium">No resources found</p>
      <p className="text-sm text-muted-foreground">
        Upload some training materials to get started.
      </p>
    </div>
  );

  return (
    <>
      <DataTable
        data={resources}
        columns={columns}
        emptyState={emptyState}
      />
      
      <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resource "{resourceToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (resourceToDelete && onDelete) {
                  onDelete(resourceToDelete);
                  setResourceToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ResourcesDataTable;

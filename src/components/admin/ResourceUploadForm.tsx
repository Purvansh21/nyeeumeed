
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "@/components/admin/FileUploader";
import { useToast } from "@/hooks/use-toast";
import { createTrainingResource } from "@/services/resourceService";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(2, { message: "Category is required" }),
  contentType: z.enum(["document", "video", "link", "interactive"]),
  isRequired: z.boolean().default(false),
  file: z.any().optional(),
  externalUrl: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ResourceUploadFormProps {
  onSuccess: () => void;
}

const ResourceUploadForm = ({ onSuccess }: ResourceUploadFormProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      contentType: "document",
      isRequired: false,
      externalUrl: "",
    },
  });
  
  const contentType = form.watch("contentType");
  
  const handleFileSelected = (file: File) => {
    setFileToUpload(file);
  };
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true);
      
      // Create the training resource
      const resourceData = {
        title: values.title,
        description: values.description,
        category: values.category,
        content_type: values.contentType,
        is_required: values.isRequired,
        url: values.contentType === "link" ? values.externalUrl : "",
        file: fileToUpload
      };
      
      const result = await createTrainingResource(resourceData);
      
      if (result) {
        toast({
          title: "Resource Created",
          description: "Training resource has been successfully created",
        });
        form.reset();
        setFileToUpload(null);
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create resource",
          description: "There was an error creating the training resource",
        });
      }
    } catch (error) {
      console.error("Error creating training resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Training Resource</CardTitle>
        <CardDescription>
          Create a new training resource for volunteers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Resource Title"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of this resource"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category" 
              placeholder="e.g., Orientation, Safety, Ethics"
              {...form.register("category")}
            />
            {form.formState.errors.category && (
              <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select
              onValueChange={(value) => form.setValue("contentType", value as any)}
              defaultValue={form.watch("contentType")}
            >
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
                <SelectItem value="interactive">Interactive Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {contentType === "link" ? (
            <div className="grid gap-2">
              <Label htmlFor="externalUrl">External URL</Label>
              <Input
                id="externalUrl"
                placeholder="https://example.com/resource"
                {...form.register("externalUrl")}
              />
              {form.formState.errors.externalUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.externalUrl.message}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Upload File</Label>
              <FileUploader onFileSelected={handleFileSelected} />
              {fileToUpload && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {fileToUpload.name} ({Math.round(fileToUpload.size / 1024)} KB)
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isRequired"
              checked={form.watch("isRequired")}
              onCheckedChange={(checked) => form.setValue("isRequired", checked)}
            />
            <Label htmlFor="isRequired" className="cursor-pointer">
              Required for volunteers
            </Label>
          </div>
          
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Create Resource"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResourceUploadForm;

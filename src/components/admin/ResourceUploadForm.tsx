
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "@/components/admin/FileUploader";
import { createTrainingResource } from "@/services/resourceService";
import { useToast } from "@/hooks/use-toast";

const resourceFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  content_type: z.enum(["document", "video", "interactive"]),
  is_required: z.boolean().default(false),
  url: z.string().url().optional().or(z.literal("")),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

interface ResourceUploadFormProps {
  onSuccess: () => void;
}

const ResourceUploadForm = ({ onSuccess }: ResourceUploadFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      content_type: "document",
      is_required: false,
      url: "",
    },
  });
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };
  
  const onSubmit = async (data: ResourceFormValues) => {
    try {
      setIsSubmitting(true);
      
      // If no file was uploaded and no URL was provided, show an error
      if (!selectedFile && !data.url) {
        toast({
          variant: "destructive",
          title: "Missing resource file",
          description: "Please upload a file or provide a URL to the resource.",
        });
        return;
      }
      
      const success = await createTrainingResource({
        ...data,
        file: selectedFile,
      });
      
      if (success) {
        toast({
          title: "Resource created",
          description: "The training resource has been successfully created.",
        });
        form.reset();
        setSelectedFile(null);
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create resource",
          description: "There was an error creating the training resource.",
        });
      }
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Training Resource</CardTitle>
        <CardDescription>
          Add new training materials for volunteers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter resource title" 
                      {...field} 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter resource description" 
                      {...field} 
                      className="min-h-[100px]" 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., orientation, safety, communication" 
                        {...field} 
                        disabled={isSubmitting} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select 
                      disabled={isSubmitting}
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What type of content is this resource?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/resource" 
                      {...field} 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormDescription>
                    If the resource is hosted elsewhere, enter the URL here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Required Training
                    </FormLabel>
                    <FormDescription>
                      Mark this resource as required for volunteers.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Upload File</FormLabel>
              <FileUploader
                onFileSelected={handleFileSelected}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.zip"
                maxSizeMB={10}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Uploading..." : "Upload Resource"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResourceUploadForm;

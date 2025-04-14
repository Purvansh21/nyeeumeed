import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { createServiceRequest, NewServiceRequest } from "@/services/beneficiaryService";

interface ServiceRequestFormProps {
  onSuccess?: () => void;
}

const ServiceRequestForm = ({ onSuccess }: ServiceRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewServiceRequest>({
    service_type: "",
    description: "",
    urgency: "",
    preferred_contact_method: ""
  });

  const handleChange = (field: keyof NewServiceRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.service_type) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a service type"
      });
      return;
    }
    
    if (!formData.urgency) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select an urgency level"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createServiceRequest(formData);
      
      if (result) {
        setFormData({
          service_type: "",
          description: "",
          urgency: "",
          preferred_contact_method: ""
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request New Service</CardTitle>
        <CardDescription>
          Apply for additional services or support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Type</label>
            <Select 
              value={formData.service_type}
              onValueChange={(value) => handleChange("service_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education">Education Support</SelectItem>
                <SelectItem value="health">Healthcare Services</SelectItem>
                <SelectItem value="food">Food Assistance</SelectItem>
                <SelectItem value="housing">Housing Support</SelectItem>
                <SelectItem value="employment">Job Training & Employment</SelectItem>
                <SelectItem value="legal">Legal Assistance</SelectItem>
                <SelectItem value="other">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Urgency Level</label>
            <Select 
              value={formData.urgency}
              onValueChange={(value) => handleChange("urgency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Within 30 days</SelectItem>
                <SelectItem value="medium">Medium - Within 14 days</SelectItem>
                <SelectItem value="high">High - Within 7 days</SelectItem>
                <SelectItem value="urgent">Urgent - Immediate assistance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="Briefly describe your needs" 
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Contact Method</label>
            <Select 
              value={formData.preferred_contact_method || ""}
              onValueChange={(value) => handleChange("preferred_contact_method", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS/Text Message</SelectItem>
                <SelectItem value="inperson">In-Person Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4 p-3 border rounded-md bg-amber-50 text-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm">
              Urgent requests may require verification. A staff member will contact you shortly after submission.
            </p>
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Service Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;

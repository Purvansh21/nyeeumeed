
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createAppointment, NewAppointment } from "@/services/beneficiaryService";

interface AppointmentFormProps {
  onSuccess?: () => void;
}

const AppointmentForm = ({ onSuccess }: AppointmentFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewAppointment>({
    title: "",
    appointment_type: "",
    date: "",
    time_slot: "",
    location: "",
    is_virtual: false,
    notes: ""
  });

  const handleChange = (field: keyof NewAppointment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter an appointment title"
      });
      return;
    }
    
    if (!formData.appointment_type) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select an appointment type"
      });
      return;
    }
    
    if (!formData.date) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a date"
      });
      return;
    }
    
    if (!formData.time_slot) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a time slot"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createAppointment(formData);
      
      if (result) {
        setFormData({
          title: "",
          appointment_type: "",
          date: "",
          time_slot: "",
          location: "",
          is_virtual: false,
          notes: ""
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
        <CardTitle>Request New Appointment</CardTitle>
        <CardDescription>
          Schedule a meeting with our staff
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Appointment Title</label>
            <Input 
              placeholder="Enter appointment title" 
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Appointment Type</label>
              <Select 
                value={formData.appointment_type}
                onValueChange={(value) => handleChange("appointment_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkin">Regular Check-in</SelectItem>
                  <SelectItem value="assessment">Needs Assessment</SelectItem>
                  <SelectItem value="counseling">Counseling Session</SelectItem>
                  <SelectItem value="training">Training Session</SelectItem>
                  <SelectItem value="other">Other (Specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Format</label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is-virtual" 
                  checked={formData.is_virtual}
                  onCheckedChange={(checked) => handleChange("is_virtual", checked)}
                />
                <Label htmlFor="is-virtual">Virtual Meeting</Label>
              </div>
              {!formData.is_virtual && (
                <Input 
                  placeholder="Meeting location (if in-person)" 
                  className="mt-2"
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Date</label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Time</label>
              <Select 
                value={formData.time_slot}
                onValueChange={(value) => handleChange("time_slot", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                  <SelectItem value="evening">Evening (5PM - 7PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea 
              placeholder="Any specific concerns or questions" 
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentForm;

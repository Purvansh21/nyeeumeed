
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VolunteerRegistration } from "@/types/volunteer";
import { format } from "date-fns";
import { logVolunteerHours } from "@/services/volunteerService";
import { useToast } from "@/hooks/use-toast";
import { numericSchema } from "@/utils/formValidation";

const FormSchema = z.object({
  eventId: z.string().min(1, { message: "Please select an event" }),
  date: z.string().min(1, { message: "Please select a date" }),
  hours: numericSchema.refine(val => {
    const num = parseFloat(val);
    return num > 0 && num <= 24;
  }, { message: "Hours must be between 0.1 and 24" }),
  activityType: z.string().min(1, { message: "Please select an activity type" }),
  notes: z.string().max(500, { message: "Notes cannot exceed 500 characters" }).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface LogHoursFormProps {
  events: VolunteerRegistration[];
  onSuccess: () => void;
}

const LogHoursForm = ({ events, onSuccess }: LogHoursFormProps) => {
  const { toast } = useToast();
  const [eligibleEvents, setEligibleEvents] = useState<VolunteerRegistration[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      eventId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      hours: "",
      activityType: "",
      notes: "",
    },
  });

  useEffect(() => {
    // Filter for events that are registered and have start_time in the past
    const filtered = events.filter(event => 
      event.status === 'registered' && 
      event.opportunity && 
      new Date(event.opportunity.start_time) <= new Date()
    );
    setEligibleEvents(filtered);
  }, [events]);

  const onSubmit = async (values: FormValues) => {
    try {
      const hours = parseFloat(values.hours);
      
      if (isNaN(hours) || hours <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid hours",
          description: "Please enter a valid number of hours"
        });
        return;
      }
      
      const success = await logVolunteerHours(
        values.eventId, 
        hours,
        values.notes || ""
      );
      
      if (success) {
        toast({
          title: "Hours logged successfully",
          description: "Your volunteer hours have been recorded"
        });
        form.reset();
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to log hours. Please try again."
        });
      }
    } catch (error) {
      console.error("Error logging hours:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Volunteer Hours</CardTitle>
        <CardDescription>
          Record your hours for completed volunteer activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventId">Event</Label>
            <Select
              value={form.watch("eventId")}
              onValueChange={(value) => form.setValue("eventId", value)}
            >
              <SelectTrigger id="eventId" className={form.formState.errors.eventId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {eligibleEvents.length > 0 ? (
                  eligibleEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.opportunity?.title || "Unnamed Event"} ({event.opportunity?.date ? format(new Date(event.opportunity.date), "MMM d, yyyy") : "No date"})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No eligible events found
                  </SelectItem>
                )}
                <SelectItem value="other">Other (specify in notes)</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.eventId && (
              <p className="text-sm text-destructive">{form.formState.errors.eventId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date" 
                type="date"
                {...form.register("date")}
                className={form.formState.errors.date ? "border-destructive" : ""}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                placeholder="Enter hours"
                min="0.5"
                step="0.5"
                {...form.register("hours")}
                className={form.formState.errors.hours ? "border-destructive" : ""}
              />
              {form.formState.errors.hours && (
                <p className="text-sm text-destructive">{form.formState.errors.hours.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type</Label>
            <Select 
              value={form.watch("activityType")}
              onValueChange={(value) => form.setValue("activityType", value)}
            >
              <SelectTrigger id="activityType" className={form.formState.errors.activityType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct Service</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="admin">Administrative</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.activityType && (
              <p className="text-sm text-destructive">{form.formState.errors.activityType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details about your volunteer work"
              {...form.register("notes")}
              className={form.formState.errors.notes ? "border-destructive" : ""}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            )}
          </div>
          
          <Button 
            type="submit"
            disabled={eligibleEvents.length === 0 && form.watch("eventId") !== "other"}
          >
            Submit Hours
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LogHoursForm;

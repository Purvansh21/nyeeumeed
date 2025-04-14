
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { TimeInput } from "@/components/ui/time-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createVolunteerOpportunity } from "@/services/volunteerService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  date: z.date(),
  start_time: z.string().min(5, {
    message: "Start time must be in HH:MM format.",
  }),
  end_time: z.string().min(5, {
    message: "End time must be in HH:MM format.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  spots_available: z.coerce.number().min(1, {
    message: "Spots available must be at least 1.",
  }),
  status: z.enum(["active", "cancelled", "completed", "full"]),
});

interface OpportunityFormProps {
  onSuccess: () => void;
}

type FormValues = z.infer<typeof FormSchema>;

const OpportunityForm: React.FC<OpportunityFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: new Date(),
      start_time: "09:00",
      end_time: "17:00",
      location: "",
      spots_available: 1,
      status: "active",
    },
  });

  const { watch } = form;
  const watchedStatus = watch("status");

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "You must be logged in to create an opportunity.",
        });
        return;
      }

      const newOpportunity = {
        title: values.title,
        description: values.description,
        category: values.category,
        date: values.date.toISOString().split('T')[0],
        start_time: values.start_time,
        end_time: values.end_time,
        location: values.location,
        spots_available: values.spots_available,
        status: values.status,
        created_by: user.id
      };

      const opportunity = await createVolunteerOpportunity(newOpportunity);

      if (opportunity) {
        toast({
          title: "Success",
          description: "Volunteer opportunity created.",
        });
        onSuccess();
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create volunteer opportunity.",
        });
      }
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create volunteer opportunity.",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Opportunity Title" type="text" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Opportunity Description" type="text" {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" placeholder="Opportunity Category" type="text" {...form.register("category")} />
        {form.formState.errors.category && (
          <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {date && form.setValue("date", date)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start_time">Start Time</Label>
          <TimeInput id="start_time" {...form.register("start_time")} />
          {form.formState.errors.start_time && (
            <p className="text-sm text-red-500">{form.formState.errors.start_time.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end_time">End Time</Label>
          <TimeInput id="end_time" {...form.register("end_time")} />
          {form.formState.errors.end_time && (
            <p className="text-sm text-red-500">{form.formState.errors.end_time.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" placeholder="Opportunity Location" type="text" {...form.register("location")} />
        {form.formState.errors.location && (
          <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="spots_available">Spots Available</Label>
        <Input
          id="spots_available"
          placeholder="Number of Spots Available"
          type="number"
          {...form.register("spots_available", { valueAsNumber: true })}
        />
        {form.formState.errors.spots_available && (
          <p className="text-sm text-red-500">{form.formState.errors.spots_available.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select {...form.register("status")} defaultValue="active">
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.status && (
          <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
        )}
      </div>
      <Button type="submit">Create Opportunity</Button>
    </form>
  );
};

export default OpportunityForm;

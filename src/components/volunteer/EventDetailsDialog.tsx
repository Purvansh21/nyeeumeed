
import { VolunteerRegistration } from "@/types/volunteer";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EventDetailsDialogProps {
  event: VolunteerRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (event: VolunteerRegistration) => void;
}

const EventDetailsDialog = ({ 
  event, 
  open, 
  onOpenChange,
  onCancel
}: EventDetailsDialogProps) => {
  if (!event || !event.opportunity) return null;

  const formatDateFromISO = (isoString: string) => {
    try {
      return format(parseISO(isoString), "MMM dd, yyyy");
    } catch (e) {
      return isoString;
    }
  };

  const formatTimeFromISO = (isoString: string) => {
    try {
      return format(parseISO(isoString), "h:mm a");
    } catch (e) {
      return isoString;
    }
  };

  const isUpcoming = new Date(event.opportunity.start_time) > new Date() && event.status === 'registered';

  // Helper function to determine badge variant
  const getBadgeVariant = (status: string): "outline" | "secondary" | "destructive" => {
    switch (status) {
      case 'registered':
        return 'outline';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event.opportunity.title}</DialogTitle>
          <DialogDescription>
            Event details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="flex items-start gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="text-sm">
              <p className="text-muted-foreground">Description</p>
              <p>{event.opportunity.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Date</p>
                <p>{formatDateFromISO(event.opportunity.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Time</p>
                <p>{formatTimeFromISO(event.opportunity.start_time)} - {formatTimeFromISO(event.opportunity.end_time)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <p className="text-muted-foreground">Location</p>
              <p>{event.opportunity.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <p className="text-muted-foreground">Spots</p>
              <p>{event.opportunity.spots_filled} / {event.opportunity.spots_available}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getBadgeVariant(event.status)}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="outline">
                {event.opportunity.category}
              </Badge>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          {isUpcoming ? (
            <Button 
              variant="destructive" 
              onClick={() => onCancel(event)}
            >
              Cancel Registration
            </Button>
          ) : (
            <div></div>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;

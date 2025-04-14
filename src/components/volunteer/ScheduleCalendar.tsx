
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { isSameDay } from "date-fns";
import { VolunteerRegistration } from "@/types/volunteer";

interface ScheduleCalendarProps {
  events: VolunteerRegistration[];
  onDayClick: (date: Date) => void;
}

const ScheduleCalendar = ({ events, onDayClick }: ScheduleCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDayClick(date);
    }
  };

  // Create a map of dates to count events
  const eventDates = events.reduce((acc, event) => {
    if (!event.opportunity?.date) return acc;
    
    const date = event.opportunity.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {} as Record<string, number>);

  // Custom rendering for days with events
  const renderDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const hasEvents = eventDates[dateString] > 0;
    
    return (
      <div className="relative flex items-center justify-center">
        {day.getDate()}
        {hasEvents && (
          <div className="absolute bottom-0 w-5 h-1 rounded-full bg-primary"></div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Calendar View</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="rounded-md border shadow p-3 pointer-events-auto"
          components={{
            Day: ({ date }) => renderDay(date),
          }}
        />
        
        {selectedDate && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">
              Events on {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-2">
              {events
                .filter(event => 
                  event.opportunity?.date && 
                  isSameDay(new Date(event.opportunity.date), selectedDate)
                )
                .map(event => (
                  <div key={event.id} className="p-2 border rounded-md">
                    <div className="font-medium">{event.opportunity?.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.opportunity?.start_time && format(new Date(event.opportunity.start_time), 'h:mm a')} - 
                      {event.opportunity?.end_time && format(new Date(event.opportunity.end_time), 'h:mm a')}
                    </div>
                    <Badge variant="outline" className="mt-1">{event.status}</Badge>
                  </div>
                ))}
              {events.filter(event => 
                event.opportunity?.date && 
                isSameDay(new Date(event.opportunity.date), selectedDate)
              ).length === 0 && (
                <p className="text-sm text-muted-foreground">No events scheduled for this date.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;

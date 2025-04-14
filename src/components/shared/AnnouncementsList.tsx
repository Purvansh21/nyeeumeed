
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon, BellIcon, CalendarIcon, MegaphoneIcon } from "lucide-react";
import { fetchAnnouncements } from "@/services/announcementService";
import { useQuery } from "@tanstack/react-query";
import { Announcement } from "@/services/announcementService";

interface AnnouncementsListProps {
  limit?: number;
  showTitle?: boolean;
  customAnnouncements?: Announcement[];
  isLoading?: boolean;
  error?: Error | null;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ 
  limit, 
  showTitle = true,
  customAnnouncements,
  isLoading: propIsLoading,
  error: propError
}) => {
  const { 
    data: fetchedAnnouncements, 
    isLoading: queryIsLoading, 
    error: queryError 
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    // Skip query if custom announcements are provided
    enabled: !customAnnouncements,
  });

  const isLoading = propIsLoading !== undefined ? propIsLoading : queryIsLoading;
  const error = propError !== undefined ? propError : queryError;
  const announcements = customAnnouncements || fetchedAnnouncements;

  console.log("AnnouncementsList data:", announcements);

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Loading announcements...</CardDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>There was an error loading announcements.</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center p-4 text-red-600 bg-red-50 rounded-lg">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <span>Unable to load announcements. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayAnnouncements = limit ? announcements?.slice(0, limit) : announcements;

  if (!displayAnnouncements || displayAnnouncements.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Organization-wide notices and updates</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <BellIcon className="h-12 w-12 mb-3 text-gray-400" />
            <p>No announcements available at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Organization-wide notices and updates</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {displayAnnouncements?.map((announcement) => (
          <div 
            key={announcement.id} 
            className={`border rounded-md p-4 hover:bg-gray-50 transition-colors ${
              announcement.status === 'active' ? 'border-l-4 border-l-green-500' : 
              announcement.status === 'scheduled' ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <MegaphoneIcon className="h-5 w-5 mr-2 text-primary" />
                {announcement.title}
              </h3>
              <Badge 
                variant={
                  announcement.status === 'active' ? 'default' : 
                  announcement.status === 'scheduled' ? 'secondary' : 'outline'
                }
                className={
                  announcement.status === 'active' ? 'bg-green-500' : 
                  announcement.status === 'scheduled' ? 'bg-blue-500 text-white' : ''
                }
              >
                {announcement.status === 'active' ? 'Active' : 
                 announcement.status === 'scheduled' ? 'Scheduled' : 'Expired'}
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(new Date(announcement.date), 'MMM d, yyyy')}
            </div>
            
            <div className="mt-3 text-gray-700 whitespace-pre-line">
              {announcement.message}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsList;

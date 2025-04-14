
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MegaphoneIcon, AlertCircleIcon, CalendarIcon } from "lucide-react";
import AnnouncementsList from "./AnnouncementsList";
import SharedDashboardLayout from "../layout/SharedDashboardLayout";
import { fetchAnnouncements } from "@/services/announcementService";
import { format } from "date-fns";

interface AnnouncementsViewProps {
  title?: string;
  showHeader?: boolean;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  title = "Announcements",
  showHeader = true
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const filteredAnnouncements = React.useMemo(() => {
    if (!announcements) return [];
    if (statusFilter === "all") return announcements;
    return announcements.filter(announcement => announcement.status === statusFilter);
  }, [announcements, statusFilter]);

  const activeCount = announcements?.filter(a => a.status === "active").length || 0;
  const scheduledCount = announcements?.filter(a => a.status === "scheduled").length || 0;
  const expiredCount = announcements?.filter(a => a.status === "expired").length || 0;

  return (
    <SharedDashboardLayout showAnnouncements={false}>
      <Helmet>
        <title>{title} | NGO Hub</title>
      </Helmet>
      
      {showHeader && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            Organization-wide notices and important updates
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Badge variant="default" className="mr-2 bg-green-500">
                  {activeCount}
                </Badge>
                Active Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Currently active and visible announcements
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Badge variant="secondary" className="mr-2 bg-blue-500 text-white">
                  {scheduledCount}
                </Badge>
                Scheduled Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Announcements scheduled for the future
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Badge variant="outline" className="mr-2">
                  {expiredCount}
                </Badge>
                Expired Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Past announcements no longer active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List with Filtering */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <MegaphoneIcon className="h-5 w-5 mr-2 text-primary" />
                  All Announcements
                </CardTitle>
                <CardDescription>
                  Viewing {filteredAnnouncements.length} of {announcements?.length || 0} announcements
                </CardDescription>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <AnnouncementsList 
                  showTitle={false} 
                  customAnnouncements={filteredAnnouncements}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
              
              <TabsContent value="detailed">
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <p>Loading announcements...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center p-4 text-red-600 bg-red-50 rounded-lg">
                    <AlertCircleIcon className="h-5 w-5 mr-2" />
                    <span>Unable to load announcements. Please try again later.</span>
                  </div>
                ) : filteredAnnouncements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
                    <MegaphoneIcon className="h-12 w-12 mb-3 text-gray-400" />
                    <p>No announcements available with the selected filter.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAnnouncements.map(announcement => (
                      <Card key={announcement.id} className="overflow-hidden">
                        <div className={`h-2 w-full ${
                          announcement.status === 'active' ? 'bg-green-500' : 
                          announcement.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle>{announcement.title}</CardTitle>
                            <Badge variant={
                              announcement.status === 'active' ? 'default' : 
                              announcement.status === 'scheduled' ? 'secondary' : 'outline'
                            }>
                              {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {format(new Date(announcement.date), 'MMM d, yyyy')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                            {announcement.message}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </SharedDashboardLayout>
  );
};

export default AnnouncementsView;

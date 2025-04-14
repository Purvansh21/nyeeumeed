
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnnouncementsList from "./AnnouncementsList";
import SharedDashboardLayout from "../layout/SharedDashboardLayout";
import { fetchAnnouncements } from "@/services/announcementService";

interface AnnouncementsViewProps {
  title?: string;
  showHeader?: boolean;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  title = "Announcements",
  showHeader = true
}) => {
  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            Viewing all {announcements?.length || 0} announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementsList showTitle={false} />
        </CardContent>
      </Card>
    </SharedDashboardLayout>
  );
};

export default AnnouncementsView;

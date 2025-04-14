
import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import AnnouncementsList from '../shared/AnnouncementsList';

interface SharedDashboardLayoutProps {
  children: React.ReactNode;
  showAnnouncements?: boolean;
}

const SharedDashboardLayout: React.FC<SharedDashboardLayoutProps> = ({ 
  children, 
  showAnnouncements = true // Changed default to true
}) => {
  const location = useLocation();
  
  // Show announcements by default on all dashboard pages
  // Only hide them if explicitly set to false via props
  const shouldShowAnnouncements = showAnnouncements;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {shouldShowAnnouncements && (
          <section>
            <AnnouncementsList limit={3} />
          </section>
        )}
        <section>
          {children}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default SharedDashboardLayout;

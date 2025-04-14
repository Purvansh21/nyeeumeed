
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
  showAnnouncements
}) => {
  const location = useLocation();
  
  // Only show announcements on main dashboard pages
  const isDashboardPage = 
    location.pathname === '/admin' || 
    location.pathname === '/staff' || 
    location.pathname === '/volunteer' || 
    location.pathname === '/beneficiary';
  
  // Use the prop value if provided, otherwise use the isDashboardPage check
  const shouldShowAnnouncements = showAnnouncements !== undefined ? showAnnouncements : isDashboardPage;

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

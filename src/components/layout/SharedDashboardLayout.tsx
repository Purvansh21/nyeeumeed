
import React from 'react';
import DashboardLayout from './DashboardLayout';
import AnnouncementsList from '../shared/AnnouncementsList';

interface SharedDashboardLayoutProps {
  children: React.ReactNode;
  showAnnouncements?: boolean;
}

const SharedDashboardLayout: React.FC<SharedDashboardLayoutProps> = ({ 
  children, 
  showAnnouncements = true 
}) => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {showAnnouncements && (
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

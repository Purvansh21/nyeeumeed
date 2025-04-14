
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SharedDashboardLayout from "@/components/layout/SharedDashboardLayout";
import ServiceRequestList from "@/components/beneficiary/ServiceRequestList";
import ServiceRequestForm from "@/components/beneficiary/ServiceRequestForm";

const BeneficiaryServices = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <SharedDashboardLayout showAnnouncements={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground">
            View your service requests and apply for new services.
          </p>
        </div>

        <ServiceRequestList 
          refreshKey={refreshKey}
          onNewRequest={() => {
            // Scrolls to the service request form
            const formElement = document.getElementById('service-request-form');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        <div id="service-request-form">
          <ServiceRequestForm onSuccess={handleRefresh} />
        </div>
      </div>
    </SharedDashboardLayout>
  );
};

export default BeneficiaryServices;

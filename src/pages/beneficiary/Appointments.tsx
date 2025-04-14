
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppointmentList from "@/components/beneficiary/AppointmentList";
import AppointmentForm from "@/components/beneficiary/AppointmentForm";

const BeneficiaryAppointments = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your appointments and schedule new meetings.
          </p>
        </div>

        <AppointmentList 
          refreshKey={refreshKey}
          onNewAppointment={() => {
            // Scrolls to the appointment form
            const formElement = document.getElementById('appointment-form');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        <div id="appointment-form">
          <AppointmentForm onSuccess={handleRefresh} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryAppointments;

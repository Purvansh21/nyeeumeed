
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UrgentRequestsList from "@/components/staff/UrgentRequestsList";

const UrgentRequestsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Urgent Requests</h1>
          <p className="text-muted-foreground">
            Verify and respond to urgent service requests from beneficiaries
          </p>
        </div>

        <UrgentRequestsList />
      </div>
    </DashboardLayout>
  );
};

export default UrgentRequestsPage;

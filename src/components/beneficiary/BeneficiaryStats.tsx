
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBeneficiaryDashboardStats } from "@/services/beneficiaryService";

interface BeneficiaryStatsProps {
  refreshKey?: number;
}

const BeneficiaryStats = ({ refreshKey = 0 }: BeneficiaryStatsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeServices: 0,
    upcomingAppointments: 0,
    completedServices: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBeneficiaryDashboardStats();
        setStats(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeServices}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Services currently in progress
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Upcoming scheduled appointments
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedServices}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Services successfully delivered
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Requests awaiting approval
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiaryStats;

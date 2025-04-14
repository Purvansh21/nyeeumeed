
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ResourceLibrary from "@/components/beneficiary/ResourceLibrary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BeneficiaryResources = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Access educational materials and support resources.
          </p>
        </div>

        <ResourceLibrary />

        <Card>
          <CardHeader>
            <CardTitle>Community Support</CardTitle>
            <CardDescription>
              Additional community resources that may be helpful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Local Food Banks</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Information on local food banks and distribution centers in your area.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  View Directory
                </Button>
              </div>
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Healthcare Clinics</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Low-cost and free healthcare options available in your community.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  View Directory
                </Button>
              </div>
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Support Groups</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with people facing similar challenges in supportive environments.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Find Groups
                </Button>
              </div>
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Employment Services</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Job training, resume assistance, and employment opportunities.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Explore Services
                </Button>
              </div>
              <div className="p-3 border rounded-md">
                <h4 className="font-medium">Educational Resources</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Schools, scholarships, and adult education programs.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Browse Resources
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryResources;

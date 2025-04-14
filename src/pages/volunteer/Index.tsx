
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Award, FileText, User, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const VolunteerDashboard = () => {
  const { user } = useAuth();

  // Mock data for volunteer stats
  const volunteerStats = {
    hoursLogged: 32,
    upcomingEvents: 3,
    completedEvents: 15,
    skillsCompleted: 70, // percentage
  };

  // Mock data for upcoming volunteer opportunities
  const upcomingOpportunities = [
    { 
      id: 1, 
      title: "Community Food Distribution", 
      date: "Apr 22, 2025", 
      time: "10:00 AM - 2:00 PM",
      location: "Community Center", 
      spotsLeft: 3,
      isSignedUp: true
    },
    { 
      id: 2, 
      title: "Children's Education Workshop", 
      date: "Apr 28, 2025", 
      time: "3:00 PM - 6:00 PM",
      location: "Public Library", 
      spotsLeft: 5,
      isSignedUp: false
    },
    { 
      id: 3, 
      title: "Elderly Care Visit", 
      date: "May 5, 2025", 
      time: "9:00 AM - 12:00 PM",
      location: "Sunshine Senior Home", 
      spotsLeft: 2,
      isSignedUp: false
    },
  ];

  // Mock data for assigned beneficiaries
  const assignedBeneficiaries = [
    { id: 1, name: "Jane Smith", services: ["Education Support", "Food Assistance"], lastContact: "2 days ago" },
    { id: 2, name: "Robert Johnson", services: ["Health Check-ups", "Counseling"], lastContact: "1 week ago" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}. Thank you for your service!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerStats.hoursLogged} hrs</div>
              <p className="text-xs text-muted-foreground">
                Total volunteer hours this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerStats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Events you've signed up for
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerStats.completedEvents}</div>
              <p className="text-xs text-muted-foreground">
                Events you've participated in
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteerStats.skillsCompleted}%</div>
              <Progress value={volunteerStats.skillsCompleted} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Training modules completed
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Opportunities</CardTitle>
            <CardDescription>
              Volunteer events you can sign up for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingOpportunities.map((event) => (
                <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-md border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      {event.isSignedUp && (
                        <span className="bg-green-500/20 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          Signed Up
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{event.spotsLeft} spots left</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button 
                      size="sm"
                      variant={event.isSignedUp ? "outline" : "default"}
                      className={event.isSignedUp ? "bg-green-500/10 text-green-700 hover:text-green-700 hover:bg-green-500/20 border-green-500/30" : ""}
                    >
                      {event.isSignedUp ? "Registered" : "Sign Up"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">View All Opportunities</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Assigned Beneficiaries</CardTitle>
              <CardDescription>
                Individuals you are assigned to assist
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedBeneficiaries.length > 0 ? (
                <div className="space-y-4">
                  {assignedBeneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="p-4 rounded-md border">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-secondary/20 p-2">
                          <User className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{beneficiary.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {beneficiary.services.map((service, index) => (
                              <span 
                                key={index} 
                                className="text-xs bg-muted px-2 py-0.5 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last contact: {beneficiary.lastContact}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                        <Button size="sm" className="text-xs">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No beneficiaries assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Training Resources</CardTitle>
              <CardDescription>
                Educational materials to enhance your volunteering skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Basics of Community Service</p>
                    <p className="text-xs text-muted-foreground">Introduction to effective volunteering</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Beneficiary Communication</p>
                    <p className="text-xs text-muted-foreground">Effective interaction with service recipients</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-md border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Privacy & Confidentiality</p>
                    <p className="text-xs text-muted-foreground">Guidelines for handling sensitive information</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </li>
              </ul>
              <div className="mt-4">
                <Button variant="outline" className="w-full">Access All Resources</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;

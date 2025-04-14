import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Award, FileText, User, BookOpen, Users, Filter, Search, MapPin, CheckCircle, XCircle, Trophy, Star, Medal, Certificate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const volunteerStats = {
    hoursLogged: 32,
    upcomingEvents: 3,
    completedEvents: 15,
    skillsCompleted: 70,
    achievements: 5
  };

  const upcomingOpportunities = [
    { 
      id: 1, 
      title: "Community Food Distribution", 
      date: "Apr 22, 2025", 
      time: "10:00 AM - 2:00 PM",
      location: "Community Center", 
      spotsLeft: 3,
      isSignedUp: true,
      description: "Help distribute food packages to families in need."
    },
    { 
      id: 2, 
      title: "Children's Education Workshop", 
      date: "Apr 28, 2025", 
      time: "3:00 PM - 6:00 PM",
      location: "Public Library", 
      spotsLeft: 5,
      isSignedUp: false,
      description: "Assist in teaching basic subjects to disadvantaged children."
    },
    { 
      id: 3, 
      title: "Elderly Care Visit", 
      date: "May 5, 2025", 
      time: "9:00 AM - 12:00 PM",
      location: "Sunshine Senior Home", 
      spotsLeft: 2,
      isSignedUp: false,
      description: "Provide companionship and assistance to elderly residents."
    },
    { 
      id: 4, 
      title: "Environmental Cleanup", 
      date: "May 12, 2025", 
      time: "8:00 AM - 11:00 AM",
      location: "Riverside Park", 
      spotsLeft: 8,
      isSignedUp: false,
      description: "Help clean up trash and plant trees in the local park."
    },
  ];

  const assignedBeneficiaries = [
    { id: 1, name: "Jane Smith", services: ["Education Support", "Food Assistance"], lastContact: "2 days ago", nextCheckIn: "Apr 25, 2025" },
    { id: 2, name: "Robert Johnson", services: ["Health Check-ups", "Counseling"], lastContact: "1 week ago", nextCheckIn: "Apr 30, 2025" },
    { id: 3, name: "Maria Garcia", services: ["Housing Support", "Job Training"], lastContact: "3 days ago", nextCheckIn: "May 2, 2025" },
  ];

  const scheduledEvents = [
    { 
      id: 1, 
      title: "Community Food Distribution", 
      date: "Apr 22, 2025", 
      time: "10:00 AM - 2:00 PM",
      location: "Community Center",
      role: "Food Distribution Assistant"
    },
    { 
      id: 2, 
      title: "Monthly Volunteer Meeting", 
      date: "Apr 26, 2025", 
      time: "9:00 AM - 10:30 AM",
      location: "NGO Headquarters",
      role: "Attendee"
    },
    { 
      id: 3, 
      title: "Fundraising Event", 
      date: "May 15, 2025", 
      time: "5:00 PM - 9:00 PM",
      location: "City Convention Center",
      role: "Event Support"
    },
  ];

  const trainingResources = [
    { id: 1, title: "Basics of Community Service", description: "Introduction to effective volunteering", completed: true },
    { id: 2, title: "Beneficiary Communication", description: "Effective interaction with service recipients", completed: true },
    { id: 3, title: "Privacy & Confidentiality", description: "Guidelines for handling sensitive information", completed: false },
    { id: 4, title: "Crisis Management", description: "How to handle emergency situations", completed: false },
    { id: 5, title: "Cultural Sensitivity", description: "Working with diverse communities", completed: false },
  ];

  const achievements = [
    { 
      id: 1, 
      title: "Community Champion", 
      date: "Feb 15, 2025", 
      description: "Awarded for completing 10 community service events",
      icon: "Trophy"
    },
    { 
      id: 2, 
      title: "First Responder", 
      date: "Mar 5, 2025", 
      description: "Successfully completed emergency response training",
      icon: "Star"
    },
    { 
      id: 3, 
      title: "100 Hours of Service", 
      date: "Mar 30, 2025", 
      description: "Reached 100 hours of volunteer service",
      icon: "Award"
    },
    { 
      id: 4, 
      title: "Beneficiary Support Excellence", 
      date: "Apr 10, 2025", 
      description: "Recognized for exceptional care and support to beneficiaries",
      icon: "Medal"
    },
    { 
      id: 5, 
      title: "Team Leadership Award", 
      date: "Apr 12, 2025", 
      description: "Successfully led a team of volunteers during a major event",
      icon: "Certificate"
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          
          <Skeleton className="h-80" />
          
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}. Thank you for your service!
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{volunteerStats.hoursLogged} hrs</div>
                  <p className="text-xs text-muted-foreground pt-1">
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
                  <p className="text-xs text-muted-foreground pt-1">
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
                  <p className="text-xs text-muted-foreground pt-1">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{volunteerStats.achievements}</div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Recognitions earned
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
                  {upcomingOpportunities.slice(0, 3).map((event) => (
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("opportunities")}>
                    View All Opportunities
                  </Button>
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
                      {assignedBeneficiaries.slice(0, 2).map((beneficiary) => (
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
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("beneficiaries")}>
                      View All Beneficiaries
                    </Button>
                  </div>
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
                    {trainingResources.slice(0, 3).map((resource) => (
                      <li key={resource.id} className="flex items-center gap-3 p-3 rounded-md border">
                        <div className={`rounded-full p-2 ${resource.completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                          {resource.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("training")}>
                      Access All Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>
                  Your recent recognitions and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <li key={achievement.id} className="flex items-center gap-3 p-3 rounded-md border">
                      <div className="rounded-full p-2 bg-amber-100">
                        {achievement.icon === "Trophy" && <Trophy className="h-4 w-4 text-amber-600" />}
                        {achievement.icon === "Star" && <Star className="h-4 w-4 text-amber-600" />}
                        {achievement.icon === "Award" && <Award className="h-4 w-4 text-amber-600" />}
                        {achievement.icon === "Medal" && <Medal className="h-4 w-4 text-amber-600" />}
                        {achievement.icon === "Certificate" && <FileText className="h-4 w-4 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("achievements")}>
                    View All Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Available Opportunities</CardTitle>
                    <CardDescription>
                      Browse and sign up for volunteer opportunities
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search opportunities..."
                        className="pl-8 w-[200px] md:w-[260px]"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingOpportunities.map((event) => (
                    <div key={event.id} className="rounded-md border">
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              {event.isSignedUp && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                                  Registered
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mt-1">
                              {event.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex md:flex-col items-center gap-3">
                            <Badge variant="outline" className="rounded-full">
                              {event.spotsLeft} spots left
                            </Badge>
                            <Button 
                              variant={event.isSignedUp ? "outline" : "default"}
                              className={event.isSignedUp ? "bg-green-500/10 text-green-700 hover:text-green-700 hover:bg-green-500/20 border-green-500/30" : ""}
                            >
                              {event.isSignedUp ? "Registered" : "Sign Up"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>My Schedule</CardTitle>
                    <CardDescription>
                      View your upcoming volunteer commitments
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="upcoming">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="past">Past Events</SelectItem>
                        <SelectItem value="all">All Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledEvents.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-md">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 md:col-span-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{event.location}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          Role: {event.role}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Hours</CardTitle>
                <CardDescription>
                  Record your volunteer hours for completed events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event1">Community Food Distribution</SelectItem>
                          <SelectItem value="event2">Monthly Volunteer Meeting</SelectItem>
                          <SelectItem value="event3">Other (specify)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hours</label>
                      <Input type="number" placeholder="Enter hours" min="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Activity Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct Service</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="admin">Administrative</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Input placeholder="Add any additional details" />
                  </div>
                  <Button>Submit Hours</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="beneficiaries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Assigned Beneficiaries</CardTitle>
                    <CardDescription>
                      Individuals you are assigned to assist
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search beneficiaries..."
                      className="pl-8 w-[200px] md:w-[260px]"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {assignedBeneficiaries.length > 0 ? (
                  <div className="space-y-4">
                    {assignedBeneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="p-4 rounded-md border">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 text-xs text-muted-foreground mt-1">
                                <span>Last contact: {beneficiary.lastContact}</span>
                                <span>Next check-in: {beneficiary.nextCheckIn}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm">
                              Contact
                            </Button>
                            <Button size="sm" variant="outline">
                              Notes
                            </Button>
                          </div>
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

            <Card>
              <CardHeader>
                <CardTitle>Assistance Guidelines</CardTitle>
                <CardDescription>
                  Best practices for beneficiary interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Communication</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Always communicate respectfully and clearly. Avoid technical jargon and ensure beneficiaries understand available services.
                    </p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Privacy & Confidentiality</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Protect all personal information and only discuss cases with authorized staff. Never share details with unauthorized persons.
                    </p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Documentation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Record all interactions accurately and promptly in the system. This ensures continuity of service and proper tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Training Resources</CardTitle>
                    <CardDescription>
                      Materials to enhance your volunteering skills
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="pl-8 w-[200px] md:w-[260px]"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Resources</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingResources.map((resource) => (
                    <div key={resource.id} className="flex items-center gap-3 p-4 rounded-md border">
                      <div className={`rounded-full p-2 ${resource.completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                        {resource.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          </div>
                          <Badge variant="outline" className={resource.completed ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                            {resource.completed ? "Completed" : "To Complete"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline">
                        {resource.completed ? "Review" : "Start"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Progress</CardTitle>
                <CardDescription>
                  Track your volunteer skill development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Communication Skills</span>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      4 out of 5 communication modules completed
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Beneficiary Support</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      3 out of 5 support modules completed
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Crisis Management</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      1 out of 5 crisis management modules completed
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Cultural Awareness</span>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      2 out of 5 cultural awareness modules completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Achievements & Recognitions</CardTitle>
                    <CardDescription>
                      Your milestones and awards for volunteer service
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Awards</SelectItem>
                        <SelectItem value="current-year">This Year</SelectItem>
                        <SelectItem value="milestone">Milestones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-md">
                      <div className="flex items-center justify-center p-4 bg-amber-50 rounded-full">
                        {achievement.icon === "Trophy" && <Trophy className="h-8 w-8 text-amber-600" />}
                        {achievement.icon === "Star" && <Star className="h-8 w-8 text-amber-600" />}
                        {achievement.icon === "Award" && <Award className="h-8 w-8 text-amber-600" />}
                        {achievement.icon === "Medal" && <Medal className="h-8 w-8 text-amber-600" />}
                        {achievement.icon === "Certificate" && <FileText className="h-8 w-8 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground">Awarded on {achievement.date}</p>
                          </div>
                          <Badge variant="outline" className="mt-2 md:mt-0 w-fit bg-amber-50 text-amber-700 border-amber-200">
                            Achievement
                          </Badge>
                        </div>
                        <p className="mt-2">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Milestones</CardTitle>
                <CardDescription>
                  Track your progress towards the next volunteer service milestone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Hours of Service</span>
                      <span className="font-medium">132 / 250 hours</span>
                    </div>
                    <Progress value={53} className="h-2" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      You're 53% of the way to your 250 hour service award
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Events Participated</span>
                      <span className="font-medium">15 / 25 events</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Participate in 10 more events to receive the Event Excellence award
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Training Certification</span>
                      <span className="font-medium">3 / 5 modules</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Complete 2 more training modules to earn your Advanced Volunteer certification
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;

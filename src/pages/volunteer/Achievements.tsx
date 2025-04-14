
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award, Medal, FileText, Calendar, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  getVolunteerAchievements, 
  getMilestoneProgress, 
  getLeaderboardData,
  shareAchievement
} from "@/services/achievementService";
import { VolunteerAchievement } from "@/types/volunteer";

const VolunteerAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("all");
  const [achievements, setAchievements] = useState<VolunteerAchievement[]>([]);
  const [milestoneProgress, setMilestoneProgress] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Loading achievements data...");
        const [achievementsData, progressData, leaderboardData] = await Promise.all([
          getVolunteerAchievements(user.id),
          getMilestoneProgress(user.id),
          getLeaderboardData()
        ]);
        
        setAchievements(achievementsData);
        setMilestoneProgress(progressData);
        setLeaderboard(leaderboardData);
        
        console.log("Achievements data loaded successfully");
      } catch (error) {
        console.error("Error loading achievements data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load achievements",
          description: "There was an error loading your achievements data."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, toast]);

  // Filter achievements based on selected year
  const filteredAchievements = yearFilter === "all" 
    ? achievements 
    : achievements.filter(achievement => {
        const year = new Date(achievement.date_earned).getFullYear().toString();
        return year === yearFilter;
      });

  const handleShareAchievement = async (achievementId: number | string) => {
    try {
      const success = await shareAchievement(achievementId.toString());
      
      if (success) {
        toast({
          title: "Achievement shared",
          description: "Your achievement has been shared to your profile.",
        });
      } else {
        throw new Error("Failed to share achievement");
      }
    } catch (error) {
      console.error("Error sharing achievement:", error);
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "There was an error sharing your achievement."
      });
    }
  };

  const handleDownloadCertificate = (achievementId: number | string) => {
    toast({
      title: "Certificate download started",
      description: "Your achievement certificate is being downloaded.",
    });
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className="h-8 w-8 text-amber-600" />;
      case "Star":
        return <Star className="h-8 w-8 text-amber-600" />;
      case "Award":
        return <Award className="h-8 w-8 text-amber-600" />;
      case "Medal":
        return <Medal className="h-8 w-8 text-amber-600" />;
      case "FileText":
        return <FileText className="h-8 w-8 text-amber-600" />;
      default:
        return <Trophy className="h-8 w-8 text-amber-600" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
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
          <h1 className="text-3xl font-bold tracking-tight">Achievements & Milestones</h1>
          <p className="text-muted-foreground">
            Track your progress and celebrate your volunteer accomplishments.
          </p>
        </div>

        <Tabs defaultValue="awards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="awards">Awards & Recognitions</TabsTrigger>
            <TabsTrigger value="milestones">Service Milestones</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="awards">
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
                    <Select 
                      value={yearFilter} 
                      onValueChange={setYearFilter}
                    >
                      <SelectTrigger className="w-full md:w-[130px]">
                        <SelectValue placeholder="Filter by Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAchievements.length > 0 ? (
                  <div className="space-y-6">
                    {filteredAchievements.map((achievement) => {
                      // Convert date_earned to a display format
                      const awardDate = new Date(achievement.date_earned);
                      const displayDate = awardDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      // Determine icon based on badge_name or another property
                      const iconName = achievement.badge_name.includes('champion') 
                        ? "Trophy" 
                        : achievement.badge_name.includes('responder')
                          ? "Star"
                          : achievement.badge_name.includes('hours')
                            ? "Award"
                            : "Medal";
                      
                      return (
                        <div key={achievement.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-md hover:bg-accent/10 transition-colors">
                          <div className="flex items-center justify-center p-4 bg-amber-50 rounded-full">
                            {getIconComponent(iconName)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="font-bold text-lg">{achievement.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">Awarded on {displayDate}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="mt-2 md:mt-0 w-fit bg-amber-50 text-amber-700 border-amber-200">
                                {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                              </Badge>
                            </div>
                            <p className="mt-2">{achievement.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Button size="sm" variant="outline" className="h-8" onClick={() => handleShareAchievement(achievement.id)}>
                                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                Share
                              </Button>
                              <Button size="sm" variant="outline" className="h-8" onClick={() => handleDownloadCertificate(achievement.id)}>
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Certificate
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No achievements found for the selected year.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setYearFilter("all")}>
                      View All Years
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Service Milestones</CardTitle>
                <CardDescription>
                  Track your progress towards the next volunteer service milestone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {milestoneProgress && (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Hours of Service</span>
                          <span className="font-medium">{milestoneProgress.hours.current} / {milestoneProgress.hours.target} hours</span>
                        </div>
                        <Progress value={milestoneProgress.hours.percentage} className="h-2" />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            You're {milestoneProgress.hours.percentage}% of the way to your {milestoneProgress.hours.target} hour service award
                          </p>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                            {milestoneProgress.hours.target - milestoneProgress.hours.current} hours to go
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Events Participated</span>
                          <span className="font-medium">{milestoneProgress.events.current} / {milestoneProgress.events.target} events</span>
                        </div>
                        <Progress value={milestoneProgress.events.percentage} className="h-2" />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            Participate in {milestoneProgress.events.target - milestoneProgress.events.current} more events to receive the Event Excellence award
                          </p>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                            {milestoneProgress.events.target - milestoneProgress.events.current} events to go
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Training Certification</span>
                          <span className="font-medium">{milestoneProgress.training.current} / {milestoneProgress.training.target} modules</span>
                        </div>
                        <Progress value={milestoneProgress.training.percentage} className="h-2" />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            Complete {milestoneProgress.training.target - milestoneProgress.training.current} more training modules to earn your Advanced Volunteer certification
                          </p>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                            {milestoneProgress.training.target - milestoneProgress.training.current} modules to go
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Consecutive Months Active</span>
                          <span className="font-medium">{milestoneProgress.months_active.current} / {milestoneProgress.months_active.target} months</span>
                        </div>
                        <Progress value={milestoneProgress.months_active.percentage} className="h-2" />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            Stay active for {milestoneProgress.months_active.target - milestoneProgress.months_active.current} more months to earn the Dedicated Volunteer award
                          </p>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                            {milestoneProgress.months_active.target - milestoneProgress.months_active.current} months to go
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  See how you compare with other volunteers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map(volunteer => {
                    const isCurrentUser = volunteer.isCurrentUser;
                    
                    if (isCurrentUser) {
                      return (
                        <div key={volunteer.volunteer_id} className="p-4 border rounded-md bg-primary/5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                              {volunteer.position}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">You</p>
                                  <Badge variant="outline" className="text-xs">{volunteer.hours} hours</Badge>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  Top {Math.round((volunteer.position / leaderboard.length) * 100)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Determine badge style based on position
                      let positionClass = "bg-zinc-100 text-zinc-800";
                      if (volunteer.position === 1) positionClass = "bg-amber-100 text-amber-800";
                      else if (volunteer.position === 2) positionClass = "bg-zinc-100 text-zinc-800";
                      else if (volunteer.position === 3) positionClass = "bg-amber-50 text-amber-600";
                      
                      return (
                        <div key={volunteer.volunteer_id} className="p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${positionClass} font-bold`}>
                              {volunteer.position}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">{volunteer.name}</p>
                                <Badge variant="outline">{volunteer.hours} hours</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Your Certificates</CardTitle>
                <CardDescription>
                  Certificates and badges you've earned for your volunteer work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-amber-50 rounded-full">
                          <Trophy className="h-12 w-12 text-amber-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-center">Basic Volunteer Certification</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">Awarded: Jan 15, 2025</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleDownloadCertificate(1)}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-amber-50 rounded-full">
                          <Star className="h-12 w-12 text-amber-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-center">Community Service Award</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">Awarded: Mar 10, 2025</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleDownloadCertificate(2)}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4 flex flex-col bg-muted/30">
                    <div className="flex-1">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-zinc-100 rounded-full">
                          <Award className="h-12 w-12 text-zinc-400" />
                        </div>
                      </div>
                      <h3 className="font-bold text-center text-muted-foreground">Advanced Support Specialist</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">In progress: 60% complete</p>
                      <Progress value={60} className="h-2 mt-4" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" disabled>
                      Locked
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Available Certifications</CardTitle>
                <CardDescription>
                  Certifications you can earn through volunteer work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <Medal className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Crisis Response Specialist</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Complete all crisis management training modules and participate in at least 3 emergency response events.
                        </p>
                        <div className="mt-3">
                          <Progress value={20} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            1 of 5 modules completed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="p-3 bg-green-50 rounded-full">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Leadership Excellence</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Successfully lead or coordinate at least 5 volunteer events with positive feedback.
                        </p>
                        <div className="mt-3">
                          <Progress value={40} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            2 of 5 events completed
                          </p>
                        </div>
                      </div>
                    </div>
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

export default VolunteerAchievements;

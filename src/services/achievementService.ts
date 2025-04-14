
import { supabase } from "@/integrations/supabase/client";
import { VolunteerAchievement } from "@/types/volunteer";

// Mock data for development, used as fallback
const MOCK_ACHIEVEMENTS = [
  { 
    id: "1", 
    volunteer_id: "user-1",
    title: "Community Champion", 
    date_earned: "2025-02-15T00:00:00Z", 
    description: "Awarded for completing 10 community service events",
    badge_name: "community_champion",
    category: "service",
    points: 100
  },
  { 
    id: "2", 
    volunteer_id: "user-1",
    title: "First Responder", 
    date_earned: "2025-03-05T00:00:00Z", 
    description: "Successfully completed emergency response training",
    badge_name: "first_responder",
    category: "training",
    points: 75
  },
  { 
    id: "3", 
    volunteer_id: "user-1",
    title: "100 Hours of Service", 
    date_earned: "2025-03-30T00:00:00Z", 
    description: "Reached 100 hours of volunteer service",
    badge_name: "hours_100",
    category: "milestone",
    points: 150
  }
];

/**
 * Fetch volunteer achievements for a specific volunteer
 */
export const getVolunteerAchievements = async (volunteerId: string): Promise<VolunteerAchievement[]> => {
  try {
    console.log("Fetching achievements for volunteer:", volunteerId);
    
    // For now, we'll just use the mock data since the volunteer_achievements table doesn't exist yet
    console.log("Using mock achievement data");
    return MOCK_ACHIEVEMENTS;
  } catch (error) {
    console.error("Failed to fetch volunteer achievements:", error);
    // Return mock data for now to prevent UI breaking
    return MOCK_ACHIEVEMENTS;
  }
};

/**
 * Share an achievement to the volunteer's profile
 */
export const shareAchievement = async (achievementId: string): Promise<boolean> => {
  try {
    console.log(`Sharing achievement ${achievementId}`);
    
    // In a real implementation, this would update a shared flag or create a post
    // For now, just log it and return success
    return true;
  } catch (error) {
    console.error("Failed to share achievement:", error);
    return false;
  }
};

/**
 * Get milestone progress for a volunteer
 */
export const getMilestoneProgress = async (volunteerId: string): Promise<any> => {
  try {
    console.log("Fetching milestone progress for volunteer:", volunteerId);
    
    // This would fetch progress towards various milestones from the database
    // For now, return mock data
    const progress = {
      hours: {
        current: 132,
        target: 250,
        percentage: 53
      },
      events: {
        current: 15,
        target: 25,
        percentage: 60
      },
      training: {
        current: 3,
        target: 5,
        percentage: 60
      },
      months_active: {
        current: 6,
        target: 12,
        percentage: 50
      }
    };
    
    return progress;
  } catch (error) {
    console.error("Failed to fetch milestone progress:", error);
    return null;
  }
};

/**
 * Get volunteer leaderboard data
 */
export const getLeaderboardData = async (): Promise<any[]> => {
  try {
    console.log("Fetching leaderboard data");
    
    // This would fetch top volunteers by hours, etc from the database
    // For now, return mock data
    const leaderboard = [
      {
        position: 1,
        name: "Sarah Johnson",
        hours: 210,
        volunteer_id: "user-2"
      },
      {
        position: 2,
        name: "Michael Chen",
        hours: 185,
        volunteer_id: "user-3"
      },
      {
        position: 3,
        name: "Priya Patel",
        hours: 156,
        volunteer_id: "user-4"
      },
      {
        position: 4,
        name: "Current User",
        hours: 132,
        volunteer_id: "user-1",
        isCurrentUser: true
      }
    ];
    
    return leaderboard;
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    return [];
  }
};

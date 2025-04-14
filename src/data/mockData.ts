
import { User, UserRole } from "@/types/auth";
import { v4 as uuidv4 } from "uuid";
import { 
  validateShiftStatus, 
  validateNeedPriority, 
  validateNeedStatus, 
  validateTaskPriority,
  validateTaskStatus,
  validateAppointmentStatus,
  validateServiceRequestStatus,
  validateServiceRequestUrgency 
} from "@/services/utils/validationUtils";

// Enhanced user data with more realistic information
export const enhancedUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@ngo.org",
    fullName: "Raj Patel",
    role: "admin",
    isActive: true,
    contactInfo: "+91 98765-43210",
    createdAt: "2023-05-15T10:30:00Z",
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Administration",
      accessLevel: "Full",
      joiningDate: "2023-05-15",
      experience: "10+ years in NGO management",
      specializations: ["Policy Development", "Strategic Planning", "Fundraising"]
    }
  },
  {
    id: "staff-1",
    email: "staff@ngo.org",
    fullName: "Priya Singh",
    role: "staff",
    isActive: true,
    contactInfo: "+91 87654-32109",
    createdAt: "2023-06-20T09:15:00Z",
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Field Operations",
      specialization: "Community Outreach",
      joiningDate: "2023-06-20",
      languages: ["Hindi", "English", "Marathi"],
      certifications: ["Community Development", "Crisis Management"]
    }
  },
  {
    id: "volunteer-1",
    email: "volunteer@ngo.org",
    fullName: "Amit Kumar",
    role: "volunteer",
    isActive: true,
    contactInfo: "+91 76543-21098",
    createdAt: "2023-07-10T14:45:00Z",
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      skills: ["Teaching", "Computer Training", "First Aid"],
      availability: "Weekends, Evening hours",
      interests: ["Education", "Healthcare", "Elderly Care"],
      totalHours: 120,
      joiningDate: "2023-07-10"
    }
  },
  {
    id: "beneficiary-1",
    email: "beneficiary@example.com",
    fullName: "Meera Devi",
    role: "beneficiary",
    isActive: true,
    contactInfo: "+91 65432-10987",
    createdAt: "2023-08-05T11:20:00Z",
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      services: ["Education Support", "Healthcare", "Skill Development"],
      familySize: 4,
      location: "Mumbai Suburbs",
      registrationDate: "2023-08-05",
      primaryNeeds: ["Education for children", "Healthcare access"]
    }
  },
  {
    id: "volunteer-2",
    email: "volunteer2@ngo.org",
    fullName: "Sanjay Sharma",
    role: "volunteer",
    isActive: true,
    contactInfo: "+91 76543-21088",
    createdAt: "2023-09-15T10:00:00Z",
    lastLoginAt: "2024-04-01T15:30:00Z",
    additionalInfo: {
      skills: ["Medical Aid", "Counseling", "Community Service"],
      availability: "Tuesday, Thursday evenings",
      interests: ["Mental Health", "Youth Development"],
      totalHours: 85,
      joiningDate: "2023-09-15"
    }
  },
  {
    id: "staff-2",
    email: "staff2@ngo.org",
    fullName: "Neha Gupta",
    role: "staff",
    isActive: true,
    contactInfo: "+91 87654-32100",
    createdAt: "2023-10-05T11:45:00Z",
    lastLoginAt: "2024-04-10T09:15:00Z",
    additionalInfo: {
      department: "Resource Management",
      specialization: "Supply Chain",
      joiningDate: "2023-10-05",
      languages: ["Hindi", "English"],
      certifications: ["Resource Management", "Inventory Control"]
    }
  },
  {
    id: "beneficiary-2",
    email: "beneficiary2@example.com",
    fullName: "Ramesh Joshi",
    role: "beneficiary",
    isActive: true,
    contactInfo: "+91 65432-10980",
    createdAt: "2023-11-10T08:30:00Z",
    lastLoginAt: "2024-04-05T14:20:00Z",
    additionalInfo: {
      services: ["Skill Development", "Job Placement", "Housing Support"],
      familySize: 3,
      location: "Delhi NCR",
      registrationDate: "2023-11-10",
      primaryNeeds: ["Vocational training", "Employment assistance"]
    }
  }
];

// Sample volunteer opportunities
export const volunteerOpportunities = [
  {
    id: "opp-1",
    title: "Community Health Camp",
    description: "Assist in organizing and running a health camp providing basic health check-ups and awareness in underserved communities.",
    location: "Dharavi, Mumbai",
    date: "2024-05-20",
    start_time: "2024-05-20T09:00:00Z",
    end_time: "2024-05-20T17:00:00Z",
    required_skills: ["First Aid", "Communication", "Organization"],
    slots_available: 8,
    status: "active",
    created_by: "staff-1",
    created_at: "2024-04-05T10:00:00Z",
    category: "healthcare"
  },
  {
    id: "opp-2",
    title: "Children's Education Program",
    description: "Teach basic literacy and numeracy skills to underprivileged children aged 6-12 years.",
    location: "Community Center, Pune",
    date: "2024-05-25",
    start_time: "2024-05-25T14:00:00Z",
    end_time: "2024-05-25T17:00:00Z",
    required_skills: ["Teaching", "Patience", "Creativity"],
    slots_available: 5,
    status: "active",
    created_by: "staff-2",
    created_at: "2024-04-08T11:30:00Z",
    category: "education"
  },
  {
    id: "opp-3",
    title: "Food Distribution Drive",
    description: "Help distribute food packages to homeless and low-income families.",
    location: "Various locations in Delhi",
    date: "2024-05-18",
    start_time: "2024-05-18T08:00:00Z",
    end_time: "2024-05-18T14:00:00Z",
    required_skills: ["Organization", "Physical Stamina", "Compassion"],
    slots_available: 12,
    status: "active",
    created_by: "staff-1",
    created_at: "2024-04-01T09:00:00Z",
    category: "food_security"
  }
];

// Sample beneficiary needs
export const beneficiaryNeeds = [
  {
    id: "need-1",
    beneficiary_id: "beneficiary-1",
    type: "education",
    description: "School supplies and tutoring for two children (ages 8 and 11)",
    priority: validateNeedPriority("high"),
    status: validateNeedStatus("in-progress"),
    created_at: "2024-04-01T10:15:00Z",
    updated_at: "2024-04-10T11:30:00Z",
    assigned_staff: "staff-1"
  },
  {
    id: "need-2",
    beneficiary_id: "beneficiary-1",
    type: "healthcare",
    description: "Medical check-up and medications for elderly family member",
    priority: validateNeedPriority("medium"),
    status: validateNeedStatus("pending"),
    created_at: "2024-04-05T09:30:00Z",
    updated_at: "2024-04-05T09:30:00Z",
    assigned_staff: null
  },
  {
    id: "need-3",
    beneficiary_id: "beneficiary-2",
    type: "employment",
    description: "Job training and placement assistance in IT sector",
    priority: validateNeedPriority("high"),
    status: validateNeedStatus("pending"),
    created_at: "2024-04-08T14:00:00Z",
    updated_at: "2024-04-08T14:00:00Z",
    assigned_staff: "staff-2"
  }
];

// Sample resources (for resource management)
export const resources = [
  {
    id: "res-1",
    name: "Food Package (Basic)",
    type: "food",
    quantity: 150,
    unit: "package",
    location: "Mumbai Warehouse",
    status: "available",
    last_updated: "2024-04-10T11:00:00Z",
    notes: "Contains rice, lentils, cooking oil, salt, and sugar"
  },
  {
    id: "res-2",
    name: "School Supply Kit",
    type: "education",
    quantity: 75,
    unit: "kit",
    location: "Delhi Center",
    status: "available",
    last_updated: "2024-04-08T09:30:00Z",
    notes: "Includes notebooks, pencils, erasers, sharpeners, and a geometry box"
  },
  {
    id: "res-3",
    name: "First Aid Kit",
    type: "healthcare",
    quantity: 50,
    unit: "kit",
    location: "Pune Center",
    status: "limited",
    last_updated: "2024-04-12T10:15:00Z",
    notes: "Basic medical supplies for emergency treatment"
  }
];

// Sample tasks for staff members
export const staffTasks = [
  {
    id: "task-1",
    title: "Organize Community Health Camp",
    description: "Coordinate with healthcare volunteers and arrange venue, equipment, and supplies for the upcoming health camp.",
    assigned_to: "staff-1",
    status: validateTaskStatus("in-progress"),
    priority: validateTaskPriority("high"),
    due_date: "2024-05-15T17:00:00Z",
    created_at: "2024-04-01T10:00:00Z",
    created_by: "admin-1"
  },
  {
    id: "task-2",
    title: "Update Beneficiary Records",
    description: "Review and update the database with current information for all active beneficiaries.",
    assigned_to: "staff-2",
    status: validateTaskStatus("pending"),
    priority: validateTaskPriority("medium"),
    due_date: "2024-04-30T17:00:00Z",
    created_at: "2024-04-10T11:30:00Z",
    created_by: "admin-1"
  },
  {
    id: "task-3",
    title: "Coordinate Food Distribution",
    description: "Arrange logistics for food package distribution in Delhi next week.",
    assigned_to: "staff-1",
    status: validateTaskStatus("pending"),
    priority: validateTaskPriority("high"),
    due_date: "2024-05-10T16:00:00Z",
    created_at: "2024-04-12T14:00:00Z",
    created_by: "admin-1"
  }
];

// Sample announcements
export const announcements = [
  {
    id: "ann-1",
    title: "Upcoming Community Health Camp",
    content: "We are organizing a community health camp on May 20th. Free check-ups and consultations will be available. Volunteers are needed!",
    author_id: "admin-1",
    author_name: "Raj Patel",
    target_audience: ["staff", "volunteer", "beneficiary"],
    published_at: "2024-04-12T10:00:00Z",
    expires_at: "2024-05-21T23:59:59Z",
    priority: "high"
  },
  {
    id: "ann-2",
    title: "New Resource Management System",
    content: "We have updated our resource management system. Staff members are requested to complete the training module by April 30th.",
    author_id: "admin-1",
    author_name: "Raj Patel",
    target_audience: ["staff"],
    published_at: "2024-04-10T11:30:00Z",
    expires_at: "2024-04-30T23:59:59Z",
    priority: "medium"
  },
  {
    id: "ann-3",
    title: "Volunteer Recognition Event",
    content: "Join us on May 5th for our quarterly volunteer recognition event. We'll be celebrating your contributions and sharing success stories.",
    author_id: "staff-1",
    author_name: "Priya Singh",
    target_audience: ["volunteer"],
    published_at: "2024-04-15T09:00:00Z",
    expires_at: "2024-05-06T23:59:59Z",
    priority: "low"
  }
];

// Generate a mock user ID
export const generateUserId = (role: UserRole): string => {
  const prefix = role.charAt(0).toLowerCase();
  return `${prefix}-${uuidv4().slice(0, 8)}`;
};

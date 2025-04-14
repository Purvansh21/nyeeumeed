
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

// Enhanced user data with more realistic Indian information
export const enhancedUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@ngo.org",
    fullName: "Rajesh Sharma",
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
      specializations: ["Policy Development", "Strategic Planning", "Fundraising"],
      address: "Sector 29, Gurugram, Haryana"
    }
  },
  {
    id: "staff-1",
    email: "staff@ngo.org",
    fullName: "Priya Patel",
    role: "staff",
    isActive: true,
    contactInfo: "+91 87654-32109",
    createdAt: "2023-06-20T09:15:00Z",
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Field Operations",
      specialization: "Community Outreach",
      joiningDate: "2023-06-20",
      languages: ["Hindi", "English", "Gujarati"],
      certifications: ["Community Development", "Crisis Management"],
      address: "Andheri East, Mumbai, Maharashtra"
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
      joiningDate: "2023-07-10",
      address: "Salt Lake City, Kolkata, West Bengal"
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
      location: "Dharavi, Mumbai, Maharashtra",
      registrationDate: "2023-08-05",
      primaryNeeds: ["Education for children", "Healthcare access"],
      aadharNumber: "XXXX-XXXX-1234"
    }
  },
  {
    id: "volunteer-2",
    email: "volunteer2@ngo.org",
    fullName: "Sanjay Goswami",
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
      joiningDate: "2023-09-15",
      address: "Indiranagar, Bangalore, Karnataka"
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
      languages: ["Hindi", "English", "Bengali"],
      certifications: ["Resource Management", "Inventory Control"],
      address: "Lajpat Nagar, Delhi"
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
      location: "Rohini, Delhi NCR",
      registrationDate: "2023-11-10",
      primaryNeeds: ["Vocational training", "Employment assistance"],
      aadharNumber: "XXXX-XXXX-5678"
    }
  },
  {
    id: "admin-2",
    email: "admin2@ngo.org",
    fullName: "Vikram Singh",
    role: "admin",
    isActive: true,
    contactInfo: "+91 98765-43211",
    createdAt: "2023-04-10T09:30:00Z",
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Finance & Compliance",
      accessLevel: "High",
      joiningDate: "2023-04-10",
      experience: "8 years in non-profit sector",
      specializations: ["Financial Management", "Grant Writing", "Compliance"],
      address: "Vaishali, Ghaziabad, Uttar Pradesh"
    }
  },
  {
    id: "volunteer-3",
    email: "volunteer3@ngo.org",
    fullName: "Ananya Chatterjee",
    role: "volunteer",
    isActive: true,
    contactInfo: "+91 76543-21089",
    createdAt: "2023-08-20T13:15:00Z", 
    lastLoginAt: "2024-04-08T16:45:00Z",
    additionalInfo: {
      skills: ["Content Writing", "Social Media", "Event Management"],
      availability: "Weekends, Remote work",
      interests: ["Digital Literacy", "Women Empowerment"],
      totalHours: 65,
      joiningDate: "2023-08-20",
      address: "Park Street, Kolkata, West Bengal",
      occupation: "Marketing Professional"
    }
  }
];

// Sample volunteer opportunities with Indian contexts
export const volunteerOpportunities = [
  {
    id: "opp-1",
    title: "Health Camp in Urban Slum",
    description: "Assist in organizing and running a health camp providing basic health check-ups and awareness in underserved communities.",
    location: "Dharavi, Mumbai, Maharashtra",
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
    location: "Government School, Sector 15, Chandigarh",
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
    location: "Various locations in Delhi NCR",
    date: "2024-05-18",
    start_time: "2024-05-18T08:00:00Z",
    end_time: "2024-05-18T14:00:00Z",
    required_skills: ["Organization", "Physical Stamina", "Compassion"],
    slots_available: 12,
    status: "active",
    created_by: "staff-1",
    created_at: "2024-04-01T09:00:00Z",
    category: "food_security"
  },
  {
    id: "opp-4",
    title: "Digital Literacy Workshop",
    description: "Conduct basic computer and smartphone usage workshops for rural women.",
    location: "Community Center, Jaipur, Rajasthan",
    date: "2024-06-02",
    start_time: "2024-06-02T10:00:00Z",
    end_time: "2024-06-02T15:00:00Z",
    required_skills: ["Technical Knowledge", "Teaching", "Patience"],
    slots_available: 6,
    status: "active",
    created_by: "staff-2",
    created_at: "2024-04-12T13:30:00Z",
    category: "education"
  },
  {
    id: "opp-5",
    title: "Tree Plantation Drive",
    description: "Plant native trees in urban areas to increase green cover and create awareness about environmental conservation.",
    location: "Cubbon Park, Bangalore, Karnataka",
    date: "2024-06-05",
    start_time: "2024-06-05T07:00:00Z",
    end_time: "2024-06-05T12:00:00Z",
    required_skills: ["Physical Stamina", "Environmental Knowledge", "Team Work"],
    slots_available: 20,
    status: "active",
    created_by: "staff-1",
    created_at: "2024-04-15T09:45:00Z",
    category: "environment"
  }
];

// Sample beneficiary needs with Indian context
export const beneficiaryNeeds = [
  {
    id: "need-1",
    beneficiary_id: "beneficiary-1",
    type: "education",
    description: "School supplies and tutoring for two children (ages 8 and 11) attending municipal school",
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
    description: "Medical check-up and diabetes medications for elderly family member (grandmother, age 68)",
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
    description: "Job training and placement assistance in IT sector for recent graduate",
    priority: validateNeedPriority("high"),
    status: validateNeedStatus("pending"),
    created_at: "2024-04-08T14:00:00Z",
    updated_at: "2024-04-08T14:00:00Z",
    assigned_staff: "staff-2"
  },
  {
    id: "need-4",
    beneficiary_id: "beneficiary-2",
    type: "housing",
    description: "Assistance with finding affordable housing near Rohini area in Delhi NCR",
    priority: validateNeedPriority("medium"),
    status: validateNeedStatus("in-progress"),
    created_at: "2024-04-10T11:00:00Z",
    updated_at: "2024-04-15T09:30:00Z",
    assigned_staff: "staff-1"
  },
  {
    id: "need-5",
    beneficiary_id: "beneficiary-1",
    type: "legal",
    description: "Assistance with obtaining Aadhar card and ration card documents",
    priority: validateNeedPriority("low"),
    status: validateNeedStatus("completed"),
    created_at: "2024-03-15T13:45:00Z",
    updated_at: "2024-04-02T10:15:00Z",
    assigned_staff: "staff-2"
  }
];

// Sample resources with Indian context
export const resources = [
  {
    id: "res-1",
    name: "Food Package (Basic)",
    type: "food",
    quantity: 150,
    unit: "package",
    location: "Andheri Warehouse, Mumbai",
    status: "available",
    last_updated: "2024-04-10T11:00:00Z",
    notes: "Contains rice, dal, atta, mustard oil, salt, sugar, and masala packets"
  },
  {
    id: "res-2",
    name: "School Supply Kit",
    type: "education",
    quantity: 75,
    unit: "kit",
    location: "Delhi Center, Lajpat Nagar",
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
    location: "Pune Center, Kothrud",
    status: "limited",
    last_updated: "2024-04-12T10:15:00Z",
    notes: "Basic medical supplies for emergency treatment"
  },
  {
    id: "res-4",
    name: "Sewing Machine",
    type: "livelihood",
    quantity: 15,
    unit: "piece",
    location: "Jaipur Center, Raja Park",
    status: "available",
    last_updated: "2024-04-05T14:30:00Z",
    notes: "Basic manual sewing machines for vocational training"
  },
  {
    id: "res-5",
    name: "Computer Tablet",
    type: "education",
    quantity: 30,
    unit: "piece",
    location: "Bangalore Center, Koramangala",
    status: "limited",
    last_updated: "2024-04-14T16:45:00Z",
    notes: "Preloaded with educational apps and content in Hindi, English, and Kannada"
  },
  {
    id: "res-6",
    name: "Winter Blanket",
    type: "clothing",
    quantity: 200,
    unit: "piece",
    location: "Delhi Warehouse, Rohini",
    status: "available",
    last_updated: "2024-04-01T09:15:00Z",
    notes: "Heavy cotton blankets for winter distribution"
  }
];

// Sample tasks for staff members
export const staffTasks = [
  {
    id: "task-1",
    title: "Organize Urban Slum Health Camp",
    description: "Coordinate with healthcare volunteers and arrange venue, equipment, and supplies for the upcoming health camp in Dharavi.",
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
    description: "Review and update the database with current information for all active beneficiaries, ensuring Aadhar details are properly recorded.",
    assigned_to: "staff-2",
    status: validateTaskStatus("pending"),
    priority: validateTaskPriority("medium"),
    due_date: "2024-04-30T17:00:00Z",
    created_at: "2024-04-10T11:30:00Z",
    created_by: "admin-1"
  },
  {
    id: "task-3",
    title: "Coordinate Food Distribution in Delhi NCR",
    description: "Arrange logistics for food package distribution in slum areas of Delhi next week.",
    assigned_to: "staff-1",
    status: validateTaskStatus("pending"),
    priority: validateTaskPriority("high"),
    due_date: "2024-05-10T16:00:00Z",
    created_at: "2024-04-12T14:00:00Z",
    created_by: "admin-1"
  },
  {
    id: "task-4",
    title: "Vocational Training Follow-up",
    description: "Contact beneficiaries who completed the tailoring course to check on job placement progress.",
    assigned_to: "staff-2",
    status: validateTaskStatus("completed"),
    priority: validateTaskPriority("medium"),
    due_date: "2024-04-20T15:00:00Z",
    created_at: "2024-04-05T11:00:00Z",
    created_by: "admin-2"
  },
  {
    id: "task-5",
    title: "School Partnership Development",
    description: "Meet with principals of 5 municipal schools in Mumbai to discuss after-school program implementation.",
    assigned_to: "staff-1",
    status: validateTaskStatus("in-progress"),
    priority: validateTaskPriority("high"),
    due_date: "2024-05-05T16:30:00Z",
    created_at: "2024-04-08T13:15:00Z",
    created_by: "admin-2"
  }
];

// Sample announcements with Indian context
export const announcements = [
  {
    id: "ann-1",
    title: "Upcoming Health Camp in Dharavi",
    content: "We are organizing a community health camp in Dharavi on May 20th. Free check-ups for diabetes, blood pressure, and general health will be available. Volunteers with medical background are especially needed!",
    author_id: "admin-1",
    author_name: "Rajesh Sharma",
    target_audience: ["staff", "volunteer", "beneficiary"],
    published_at: "2024-04-12T10:00:00Z",
    expires_at: "2024-05-21T23:59:59Z",
    priority: "high"
  },
  {
    id: "ann-2",
    title: "New Resource Management System",
    content: "We have updated our resource management system. Staff members are requested to complete the training module by April 30th. Contact Neha Gupta for assistance.",
    author_id: "admin-1",
    author_name: "Rajesh Sharma",
    target_audience: ["staff"],
    published_at: "2024-04-10T11:30:00Z",
    expires_at: "2024-04-30T23:59:59Z",
    priority: "medium"
  },
  {
    id: "ann-3",
    title: "Volunteer Recognition Event",
    content: "Join us on May 5th at our Delhi center for our quarterly volunteer recognition event. We'll be celebrating your contributions and sharing success stories. Light refreshments will be provided.",
    author_id: "staff-1",
    author_name: "Priya Patel",
    target_audience: ["volunteer"],
    published_at: "2024-04-15T09:00:00Z",
    expires_at: "2024-05-06T23:59:59Z",
    priority: "low"
  },
  {
    id: "ann-4",
    title: "Skill Development Workshop Series",
    content: "We are launching a new series of skill development workshops focusing on digital literacy, financial management, and spoken English. Beneficiaries interested in these programs can register at their local center.",
    author_id: "staff-2",
    author_name: "Neha Gupta",
    target_audience: ["beneficiary"],
    published_at: "2024-04-16T12:30:00Z",
    expires_at: "2024-05-15T23:59:59Z",
    priority: "medium"
  },
  {
    id: "ann-5",
    title: "Annual Fundraising Drive",
    content: "Our annual fundraising drive will begin on May 1st. This year, we aim to raise ₹25 lakhs to support our education and healthcare initiatives. Staff and volunteers are encouraged to share our campaign with their networks.",
    author_id: "admin-2",
    author_name: "Vikram Singh",
    target_audience: ["staff", "volunteer"],
    published_at: "2024-04-18T10:00:00Z",
    expires_at: "2024-06-01T23:59:59Z",
    priority: "high"
  }
];

// Generate a mock user ID
export const generateUserId = (role: UserRole): string => {
  const prefix = role.charAt(0).toLowerCase();
  return `${prefix}-${uuidv4().slice(0, 8)}`;
};

// Sample education resources for beneficiaries
export const educationResources = [
  {
    id: "edu-1",
    title: "Basic Computer Skills Course",
    description: "Learn fundamental computer skills including typing, using common applications, and internet browsing.",
    type: "course",
    language: "Hindi, English",
    level: "Beginner",
    created_by: "staff-2",
    created_at: "2024-03-10T09:00:00Z"
  },
  {
    id: "edu-2",
    title: "Financial Literacy Workshop",
    description: "Understand personal finance, banking, savings, and basic investment concepts.",
    type: "workshop",
    language: "Hindi, Marathi, English",
    level: "All Levels",
    created_by: "staff-1",
    created_at: "2024-03-15T14:30:00Z"
  },
  {
    id: "edu-3",
    title: "Spoken English Practice",
    description: "Improve conversational English skills for better employment opportunities.",
    type: "course",
    language: "English",
    level: "Intermediate",
    created_by: "volunteer-3",
    created_at: "2024-03-20T11:15:00Z"
  },
  {
    id: "edu-4",
    title: "Primary School Support Materials",
    description: "Educational resources for children in Classes 1-5 aligned with NCERT curriculum.",
    type: "materials",
    language: "Hindi, English, Tamil, Telugu",
    level: "Primary",
    created_by: "staff-2",
    created_at: "2024-03-25T10:00:00Z"
  }
];

// Sample healthcare services offered
export const healthcareServices = [
  {
    id: "health-1",
    service_name: "General Health Check-up",
    description: "Basic health assessment including blood pressure, blood sugar, and general examination.",
    availability: "All center locations, Tuesdays and Fridays",
    requirements: "Beneficiary ID card",
    contact_person: "staff-1"
  },
  {
    id: "health-2",
    service_name: "Women's Health Camp",
    description: "Specialized health services focused on women's health issues including reproductive health.",
    availability: "Monthly, rotating between centers",
    requirements: "Beneficiary ID card, prior registration recommended",
    contact_person: "staff-2"
  },
  {
    id: "health-3",
    service_name: "Child Vaccination",
    description: "Essential vaccines for children under 5 years of age.",
    availability: "First Monday of every month at all centers",
    requirements: "Beneficiary ID card, child's health record if available",
    contact_person: "staff-1"
  },
  {
    id: "health-4",
    service_name: "Mental Health Counseling",
    description: "Confidential counseling services for stress, anxiety, depression, and other mental health concerns.",
    availability: "By appointment only",
    requirements: "Beneficiary ID card, referral from general check-up recommended",
    contact_person: "volunteer-2"
  }
];

// Sample livelihood programs
export const livelihoodPrograms = [
  {
    id: "lively-1",
    program_name: "Tailoring and Garment Making",
    description: "3-month training program in basic and advanced tailoring skills.",
    duration: "3 months",
    location: "Mumbai and Delhi centers",
    start_date: "2024-06-01T00:00:00Z",
    end_date: "2024-08-31T00:00:00Z",
    max_participants: 20,
    current_participants: 12
  },
  {
    id: "lively-2",
    program_name: "Beauty and Wellness Training",
    description: "Professional training in beauty services including hair care, skin care, and make-up.",
    duration: "2 months",
    location: "Bangalore and Jaipur centers",
    start_date: "2024-05-15T00:00:00Z",
    end_date: "2024-07-15T00:00:00Z",
    max_participants: 15,
    current_participants: 9
  },
  {
    id: "lively-3",
    program_name: "Mobile Phone Repair",
    description: "Technical training in diagnosing and repairing common mobile phone issues.",
    duration: "6 weeks",
    location: "Delhi and Chandigarh centers",
    start_date: "2024-06-15T00:00:00Z",
    end_date: "2024-07-31T00:00:00Z",
    max_participants: 15,
    current_participants: 7
  },
  {
    id: "lively-4",
    program_name: "Food Processing and Preservation",
    description: "Skills training in food processing, packaging, and small business management.",
    duration: "2 months",
    location: "Pune center",
    start_date: "2024-07-01T00:00:00Z",
    end_date: "2024-08-31T00:00:00Z",
    max_participants: 15,
    current_participants: 5
  }
];

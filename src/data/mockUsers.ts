
import { User, UserRole } from "@/types/auth";
import { v4 as uuidv4 } from "uuid";

// Mock data for initial users with Indian names and context
export const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@ngo.org",
    fullName: "Rajesh Sharma",
    role: "admin",
    isActive: true,
    contactInfo: "+91 98765-43210",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Management",
      accessLevel: "Full",
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
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Operations",
      specialization: "Project Management",
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
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      skills: ["Teaching", "First Aid"],
      availability: "Weekends",
      address: "Salt Lake City, Kolkata, West Bengal"
    }
  },
  {
    id: "beneficiary-1",
    email: "beneficiary@example.com",
    fullName: "Meera Devi",
    role: "beneficiary",
    isActive: true,
    contactInfo: "+91 76543-21098",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      services: ["Education", "Healthcare"],
      familySize: 4,
      address: "Dharavi, Mumbai, Maharashtra",
      aadharNumber: "XXXX-XXXX-1234"
    }
  }
];

// Mock password storage (in a real app, this would be hashed and stored in a database)
export const mockPasswords: Record<string, string> = {
  "admin@ngo.org": "admin123",
  "staff@ngo.org": "staff123",
  "volunteer@ngo.org": "volunteer123",
  "beneficiary@example.com": "beneficiary123"
};

// Function to generate a mock user ID
export const generateUserId = (role: UserRole): string => {
  const prefix = role.charAt(0).toLowerCase();
  return `${prefix}-${uuidv4().slice(0, 8)}`;
};

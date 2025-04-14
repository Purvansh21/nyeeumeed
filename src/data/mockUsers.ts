
import { User, UserRole } from "@/types/auth";
import { v4 as uuidv4 } from "uuid";

// Mock data for initial users
export const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@ngo.org",
    fullName: "Admin User",
    role: "admin",
    isActive: true,
    contactInfo: "+1 123-456-7890",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Management",
      accessLevel: "Full"
    }
  },
  {
    id: "staff-1",
    email: "staff@ngo.org",
    fullName: "Staff Member",
    role: "staff",
    isActive: true,
    contactInfo: "+1 234-567-8901",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      department: "Operations",
      specialization: "Project Management"
    }
  },
  {
    id: "volunteer-1",
    email: "volunteer@ngo.org",
    fullName: "Volunteer Helper",
    role: "volunteer",
    isActive: true,
    contactInfo: "+1 345-678-9012",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      skills: ["Teaching", "First Aid"],
      availability: "Weekends"
    }
  },
  {
    id: "beneficiary-1",
    email: "beneficiary@example.com",
    fullName: "Service Recipient",
    role: "beneficiary",
    isActive: true,
    contactInfo: "+1 456-789-0123",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    additionalInfo: {
      services: ["Education", "Healthcare"],
      familySize: 4
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

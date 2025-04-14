
import { z } from "zod";

// Phone number validation
export const phoneSchema = z
  .string()
  .trim()
  .min(10, { message: "Phone number must be at least 10 digits" })
  .max(15, { message: "Phone number should not exceed 15 digits" })
  .regex(/^[+]?[0-9\s-()]*$/, { 
    message: "Phone number can only contain digits, spaces, and the following characters: +()-" 
  });

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email address" });

// Password validation
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

// Common text input validation
export const requiredStringSchema = (fieldName: string = "Field") => 
  z.string().trim().min(1, { message: `${fieldName} is required` });

// Date validation
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" });

// Common form validation schemas
export const contactInfoSchema = z.object({
  fullName: requiredStringSchema("Full name"),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().optional(),
});

// Zip code validation (US format)
export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code" });

// URL validation
export const urlSchema = z
  .string()
  .url({ message: "Invalid URL format" });

// Message/Description validation (for forms with text areas)
export const messageSchema = z
  .string()
  .trim()
  .min(10, { message: "Message must be at least 10 characters" })
  .max(1000, { message: "Message cannot exceed 1000 characters" });

// Numeric validation
export const numericSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, { message: "Must be a valid number" });

// Form helper functions
export const formatValidationErrors = (errors: any) => {
  return Object.entries(errors).reduce((acc: Record<string, string>, [key, value]) => {
    acc[key] = Array.isArray(value) ? value[0].message : value.message;
    return acc;
  }, {});
};

// Function to validate phone number format
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  
  // Remove all non-digits
  const phoneNumber = value.replace(/[^\d]/g, '');
  
  // Format based on length
  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

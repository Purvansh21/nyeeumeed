
import { UserRole } from "@/types/auth";

// Permission constants
export const PERMISSIONS = {
  // User management
  VIEW_ALL_USERS: "view_all_users",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DEACTIVATE_USER: "deactivate_user",
  
  // Profile management
  VIEW_OWN_PROFILE: "view_own_profile",
  UPDATE_OWN_PROFILE: "update_own_profile",
  
  // Dashboard access
  ACCESS_ADMIN_DASHBOARD: "access_admin_dashboard",
  ACCESS_STAFF_DASHBOARD: "access_staff_dashboard",
  ACCESS_VOLUNTEER_DASHBOARD: "access_volunteer_dashboard",
  ACCESS_BENEFICIARY_DASHBOARD: "access_beneficiary_dashboard",
  
  // Volunteer management
  MANAGE_VOLUNTEERS: "manage_volunteers",
  VIEW_VOLUNTEER_OPPORTUNITIES: "view_volunteer_opportunities",
  SIGN_UP_FOR_OPPORTUNITIES: "sign_up_for_opportunities",
  
  // Beneficiary management
  MANAGE_BENEFICIARIES: "manage_beneficiaries",
  VIEW_SERVICE_REQUESTS: "view_service_requests",
  SUBMIT_SERVICE_REQUESTS: "submit_service_requests",
  
  // Resource management
  MANAGE_RESOURCES: "manage_resources",
  ACCESS_RESOURCES: "access_resources",
  
  // Reporting
  VIEW_REPORTS: "view_reports",
  GENERATE_REPORTS: "generate_reports",
  
  // System configuration
  SYSTEM_CONFIGURATION: "system_configuration",
  VIEW_AUDIT_LOGS: "view_audit_logs"
} as const;

// Permission mapping by role
const rolePermissions: Record<UserRole, string[]> = {
  admin: Object.values(PERMISSIONS),
  staff: [
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DEACTIVATE_USER,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.ACCESS_STAFF_DASHBOARD,
    PERMISSIONS.MANAGE_VOLUNTEERS,
    PERMISSIONS.MANAGE_BENEFICIARIES,
    PERMISSIONS.MANAGE_RESOURCES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_VOLUNTEER_OPPORTUNITIES,
  ],
  volunteer: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.ACCESS_VOLUNTEER_DASHBOARD,
    PERMISSIONS.VIEW_VOLUNTEER_OPPORTUNITIES,
    PERMISSIONS.SIGN_UP_FOR_OPPORTUNITIES,
    PERMISSIONS.ACCESS_RESOURCES,
  ],
  beneficiary: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.ACCESS_BENEFICIARY_DASHBOARD,
    PERMISSIONS.SUBMIT_SERVICE_REQUESTS,
    PERMISSIONS.ACCESS_RESOURCES,
  ]
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole | undefined, permission: string): boolean => {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
};

// Get dashboard route based on role
export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "staff":
      return "/staff";
    case "volunteer":
      return "/volunteer";
    case "beneficiary":
      return "/beneficiary";
    default:
      return "/";
  }
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Check if a user can access a specific route
export const canAccessRoute = (role: UserRole | undefined, route: string): boolean => {
  if (!role) return false;
  
  if (route === "/") return true;
  if (route === "/login") return true;
  
  if (route.startsWith("/admin")) {
    return hasPermission(role, PERMISSIONS.ACCESS_ADMIN_DASHBOARD);
  }
  
  if (route.startsWith("/staff")) {
    return hasPermission(role, PERMISSIONS.ACCESS_STAFF_DASHBOARD);
  }
  
  if (route.startsWith("/volunteer")) {
    return hasPermission(role, PERMISSIONS.ACCESS_VOLUNTEER_DASHBOARD);
  }
  
  if (route.startsWith("/beneficiary")) {
    return hasPermission(role, PERMISSIONS.ACCESS_BENEFICIARY_DASHBOARD);
  }
  
  return false;
};

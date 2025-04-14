
import React from "react";
import { User, UserRole } from "@/types/auth";
import { getRoleDisplayName } from "@/utils/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, User as UserIcon, UserX, Briefcase, Heart, Shield, Users, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UsersTableProps {
  users: User[];
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, toggleUserStatus }) => {
  // If no users found for this role/filter
  if (users.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md">
        <div className="text-muted-foreground">No users found</div>
      </div>
    );
  }

  // Get role icon based on user role
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "staff":
        return <Briefcase className="h-4 w-4" />;
      case "volunteer":
        return <Heart className="h-4 w-4" />;
      case "beneficiary":
        return <Users className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">User</TableHead>
            <TableHead className="w-[15%]">Role</TableHead>
            <TableHead className="hidden md:table-cell w-[25%]">Contact</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="text-right w-[10%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${getRoleBgColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {user.contactInfo || "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.isActive ? "default" : "outline"}
                  className={user.isActive ? "bg-green-500/20 text-green-700 hover:bg-green-500/20" : ""}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    className={!user.isActive ? "text-green-600" : "text-destructive"}
                    title={user.isActive ? "Deactivate user" : "Activate user"}
                  >
                    {user.isActive ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Get role icon background color
const getRoleBgColor = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-purple-100";
    case "staff":
      return "bg-blue-100";
    case "volunteer":
      return "bg-green-100";
    case "beneficiary":
      return "bg-amber-100";
    default:
      return "bg-gray-100";
  }
};

// Create a reusable component for role badges
const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  let badgeClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  
  switch (role) {
    case "admin":
      badgeClasses += " bg-purple-100 text-purple-800";
      break;
    case "staff":
      badgeClasses += " bg-blue-100 text-blue-800";
      break;
    case "volunteer":
      badgeClasses += " bg-green-100 text-green-800";
      break;
    case "beneficiary":
      badgeClasses += " bg-amber-100 text-amber-800";
      break;
    default:
      badgeClasses += " bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={badgeClasses}>
      {getRoleDisplayName(role)}
    </span>
  );
};

export default UsersTable;


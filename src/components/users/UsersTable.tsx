import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UsersTableProps {
  users: User[];
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  updateUserProfile?: (userId: string, updates: Partial<User>) => Promise<void>;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, toggleUserStatus, updateUserProfile }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userUpdates, setUserUpdates] = useState<Partial<User>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  // Handle opening the edit dialog
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserUpdates({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      contactInfo: user.contactInfo || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle saving user updates
  const handleSaveUserUpdates = async () => {
    if (!editingUser || !updateUserProfile) return;
    
    setIsSubmitting(true);
    try {
      await updateUserProfile(editingUser.id, userUpdates);
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling user status (activate/deactivate)
  const handleToggleUserStatus = async (userId: string, newStatus: boolean) => {
    try {
      setProcessingId(userId);
      await toggleUserStatus(userId, newStatus);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => updateUserProfile && handleEditUser(user)}
                      disabled={processingId === user.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                      className={user.isActive ? "text-destructive" : "text-green-600"}
                      title={user.isActive ? "Deactivate user" : "Activate user"}
                      disabled={processingId === user.id}
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

      {/* Edit User Dialog */}
      {updateUserProfile && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-fullName" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="edit-fullName"
                  value={userUpdates.fullName || ""}
                  onChange={(e) => setUserUpdates({ ...userUpdates, fullName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={userUpdates.email || ""}
                  onChange={(e) => setUserUpdates({ ...userUpdates, email: e.target.value })}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select
                  value={userUpdates.role}
                  onValueChange={(value) => setUserUpdates({ ...userUpdates, role: value as UserRole })}
                >
                  <SelectTrigger id="edit-role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="beneficiary">Beneficiary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contactInfo" className="text-right">
                  Contact
                </Label>
                <Input
                  id="edit-contactInfo"
                  placeholder="Phone number or contact info"
                  className="col-span-3"
                  value={userUpdates.contactInfo || ""}
                  onChange={(e) => setUserUpdates({ ...userUpdates, contactInfo: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveUserUpdates}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
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

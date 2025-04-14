import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRoleDisplayName } from "@/utils/permissions";
import { UserRole, User } from "@/types/auth";
import { UserPlus, Search, Filter, RefreshCw, User as UserIcon, Edit, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const UserManagement = () => {
  const { createUser, updateUserProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "staff" as UserRole,
    contactInfo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      // Convert Json type to Record<string, any>
      const mappedUsers: User[] = profiles.map(profile => {
        // Ensure additionalInfo is always a Record<string, any> or empty object
        let additionalInfo: Record<string, any> = {};
        if (profile.additional_info && typeof profile.additional_info === 'object' && !Array.isArray(profile.additional_info)) {
          additionalInfo = profile.additional_info as Record<string, any>;
        }
        
        return {
          id: profile.id,
          email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder for demo
          fullName: profile.full_name,
          role: profile.role as UserRole,
          isActive: profile.is_active,
          contactInfo: profile.contact_info || '',
          createdAt: profile.created_at,
          lastLoginAt: profile.last_login_at || undefined,
          additionalInfo
        };
      });
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "Could not retrieve user data from the database."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    // Filter by search term
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by role
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    // Sort by role priority: admin > staff > volunteer > beneficiary
    const rolePriority = { admin: 0, staff: 1, volunteer: 2, beneficiary: 3 };
    return (rolePriority[a.role] || 999) - (rolePriority[b.role] || 999) || a.fullName.localeCompare(b.fullName);
  });

  // Reset the new user form
  const resetNewUserForm = () => {
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      role: "staff",
      contactInfo: "",
    });
  };

  // Handle create user submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createUser({
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        contactInfo: newUser.contactInfo,
      });
      
      setIsCreateDialogOpen(false);
      resetNewUserForm();
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user activation/deactivation
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateUserProfile(userId, { isActive: !isActive });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !isActive } : user
      ));
      
      toast({
        title: isActive ? "User deactivated" : "User activated",
        description: `The user has been ${isActive ? "deactivated" : "activated"} successfully.`,
      });
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Failed to update user status. Please try again.",
      });
    }
  };

  // Get role badge styling
  const getRoleBadgeClass = (role: UserRole) => {
    return `role-badge role-badge-${role}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              All registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-48">
                  <Select
                    value={filterRole}
                    onValueChange={(value) => setFilterRole(value as UserRole | "all")}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by role" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="beneficiary">Beneficiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterRole("all");
                    fetchUsers();
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/40">
                <div className="col-span-5 sm:col-span-4">User</div>
                <div className="col-span-3 sm:col-span-2">Role</div>
                <div className="hidden sm:block sm:col-span-3">Contact</div>
                <div className="col-span-2 sm:col-span-1">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="text-muted-foreground">Loading users...</div>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-5 sm:col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <UserIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <div className={getRoleBadgeClass(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </div>
                      </div>
                      <div className="hidden sm:block sm:col-span-3 text-sm">
                        {user.contactInfo || "—"}
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Badge
                          variant={user.isActive ? "default" : "outline"}
                          className={user.isActive ? "bg-green-500/20 text-green-700 hover:bg-green-500/20" : ""}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={!user.isActive ? "text-green-600" : "text-destructive"}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-muted-foreground">No users found</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with the appropriate role and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  className="col-span-3"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="col-span-3"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="col-span-3"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                >
                  <SelectTrigger id="role" className="col-span-3">
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
                <Label htmlFor="contactInfo" className="text-right">
                  Contact
                </Label>
                <Input
                  id="contactInfo"
                  placeholder="Phone number or contact info"
                  className="col-span-3"
                  value={newUser.contactInfo}
                  onChange={(e) => setNewUser({ ...newUser, contactInfo: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetNewUserForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;

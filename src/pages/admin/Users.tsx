
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoleDisplayName } from "@/utils/permissions";
import { UserRole, User } from "@/types/auth";
import { UserPlus, Search, RefreshCw, User as UserIcon, Edit, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Json } from "@/integrations/supabase/types";
import UsersTable from "@/components/users/UsersTable";

const UserManagement = () => {
  const { createUser, updateUserProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [selectedTab, setSelectedTab] = useState("all");

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
  const getFilteredUsers = (role: UserRole | "all") => {
    return users.filter(user => {
      // Filter by search term
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by role
      const matchesRole = role === "all" || user.role === role;
      
      return matchesSearch && matchesRole;
    }).sort((a, b) => {
      // Sort by role priority: admin > staff > volunteer > beneficiary
      const rolePriority = { admin: 0, staff: 1, volunteer: 2, beneficiary: 3 };
      return (rolePriority[a.role] || 999) - (rolePriority[b.role] || 999) || a.fullName.localeCompare(b.fullName);
    });
  };

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
      
      toast({
        title: "User created successfully",
        description: `${newUser.fullName} has been added as a ${getRoleDisplayName(newUser.role)}.`
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: "There was an error creating the user. Please try again."
      });
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

  // Handle user profile updates
  const handleUpdateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUserProfile(userId, updates);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update user information. Please try again.",
      });
      throw error; // Re-throw to be caught by the component
    }
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTab("all");
                    fetchUsers();
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs 
              defaultValue="all" 
              className="w-full" 
              value={selectedTab} 
              onValueChange={setSelectedTab}
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="volunteer">Volunteers</TabsTrigger>
                <TabsTrigger value="beneficiary">Beneficiaries</TabsTrigger>
              </TabsList>

              {isLoading ? (
                <SkeletonTable />
              ) : (
                <>
                  <TabsContent value="all">
                    <UsersTable 
                      users={getFilteredUsers("all")} 
                      toggleUserStatus={toggleUserStatus}
                      updateUserProfile={handleUpdateUserProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="admin">
                    <UsersTable 
                      users={getFilteredUsers("admin")} 
                      toggleUserStatus={toggleUserStatus}
                      updateUserProfile={handleUpdateUserProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="staff">
                    <UsersTable 
                      users={getFilteredUsers("staff")} 
                      toggleUserStatus={toggleUserStatus}
                      updateUserProfile={handleUpdateUserProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="volunteer">
                    <UsersTable 
                      users={getFilteredUsers("volunteer")} 
                      toggleUserStatus={toggleUserStatus}
                      updateUserProfile={handleUpdateUserProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="beneficiary">
                    <UsersTable 
                      users={getFilteredUsers("beneficiary")} 
                      toggleUserStatus={toggleUserStatus}
                      updateUserProfile={handleUpdateUserProfile}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
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

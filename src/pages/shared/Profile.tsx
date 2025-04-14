
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRoleDisplayName } from "@/utils/permissions";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    contactInfo: user?.contactInfo || "",
    additionalInfo: {
      bio: user?.additionalInfo?.bio || "",
      skills: user?.additionalInfo?.skills || [],
      preferences: user?.additionalInfo?.preferences || "",
    }
  });

  if (!user) return null;

  // Get user's initials for the avatar
  const getInitials = () => {
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserProfile(user.id, {
        fullName: formData.fullName,
        contactInfo: formData.contactInfo,
        additionalInfo: {
          ...user.additionalInfo,
          bio: formData.additionalInfo.bio,
          preferences: formData.additionalInfo.preferences,
        }
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role-specific profile sections
  const renderRoleSpecificSection = () => {
    switch (user.role) {
      case "admin":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Administration</CardTitle>
              <CardDescription>System administration details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Department</Label>
                  <div className="mt-1 p-2 bg-muted rounded">
                    {user.additionalInfo?.department || "Management"}
                  </div>
                </div>
                <div>
                  <Label>Access Level</Label>
                  <div className="mt-1 p-2 bg-muted rounded">
                    {user.additionalInfo?.accessLevel || "Full System Access"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "staff":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Staff Details</CardTitle>
              <CardDescription>Professional information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Department</Label>
                  <div className="mt-1 p-2 bg-muted rounded">
                    {user.additionalInfo?.department || "Operations"}
                  </div>
                </div>
                <div>
                  <Label>Specialization</Label>
                  <div className="mt-1 p-2 bg-muted rounded">
                    {user.additionalInfo?.specialization || "Project Management"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "volunteer":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Details</CardTitle>
              <CardDescription>Skills and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Skills</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.additionalInfo?.skills && Array.isArray(user.additionalInfo.skills) ? (
                      user.additionalInfo.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <div className="p-2 bg-muted rounded text-sm">No skills listed</div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Availability</Label>
                  <div className="mt-1 p-2 bg-muted rounded">
                    {user.additionalInfo?.availability || "Not specified"}
                  </div>
                </div>
                {isEditing && (
                  <div>
                    <Label htmlFor="additionalInfo.preferences">Preferences</Label>
                    <Textarea
                      id="additionalInfo.preferences"
                      name="additionalInfo.preferences"
                      placeholder="Enter your volunteering preferences"
                      className="mt-1"
                      value={formData.additionalInfo.preferences}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Specify your preferred volunteering activities, areas, or any limitations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "beneficiary":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Beneficiary Details</CardTitle>
              <CardDescription>Service information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Services</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.additionalInfo?.services && Array.isArray(user.additionalInfo.services) ? (
                      user.additionalInfo.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <div className="p-2 bg-muted rounded text-sm">No services listed</div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Family Size</Label>
                  <div className="mt-1 p-2 bg-muted rounded">
                    {user.additionalInfo?.familySize || "Not specified"}
                  </div>
                </div>
                {isEditing && (
                  <div>
                    <Label htmlFor="additionalInfo.preferences">Special Needs</Label>
                    <Textarea
                      id="additionalInfo.preferences"
                      name="additionalInfo.preferences"
                      placeholder="Enter any special needs or requirements"
                      className="mt-1"
                      value={formData.additionalInfo.preferences}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Specify any special needs, accommodations, or requirements.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your account information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (isEditing) {
                        // Reset form data when canceling edit
                        setFormData({
                          fullName: user.fullName || "",
                          contactInfo: user.contactInfo || "",
                          additionalInfo: {
                            bio: user.additionalInfo?.bio || "",
                            skills: user.additionalInfo?.skills || [],
                            preferences: user.additionalInfo?.preferences || "",
                          }
                        });
                      }
                      setIsEditing(!isEditing);
                    }}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
                <CardDescription>
                  Your basic account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 bg-muted rounded">
                          {user.fullName}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="mt-1 p-2 bg-muted rounded">
                        {user.email}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email address cannot be changed
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="contactInfo">Contact Information</Label>
                      {isEditing ? (
                        <Input
                          id="contactInfo"
                          name="contactInfo"
                          value={formData.contactInfo}
                          onChange={handleInputChange}
                          placeholder="Enter phone number or other contact info"
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 bg-muted rounded">
                          {user.contactInfo || "Not provided"}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <div className="mt-1 flex items-center">
                        <div className={`role-badge role-badge-${user.role}`}>
                          {getRoleDisplayName(user.role)}
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div>
                        <Label htmlFor="additionalInfo.bio">Bio</Label>
                        <Textarea
                          id="additionalInfo.bio"
                          name="additionalInfo.bio"
                          placeholder="Tell us a bit about yourself"
                          className="mt-1"
                          value={formData.additionalInfo.bio}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="mt-6">
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Saving Changes..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Details about your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Account Status</Label>
                    <div className="mt-1 flex items-center">
                      <Badge
                        variant={user.isActive ? "default" : "outline"}
                        className={user.isActive ? "bg-green-500/20 text-green-700 hover:bg-green-500/20" : ""}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Account Created</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Last Login</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "Never"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Separator className="mb-2" />
                <div className="flex flex-col w-full space-y-2">
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            {renderRoleSpecificSection()}
            
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
                <CardDescription>Personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      id="additionalInfo.bio"
                      name="additionalInfo.bio"
                      placeholder="Tell us about yourself"
                      className="min-h-[150px]"
                      value={formData.additionalInfo.bio}
                      onChange={handleInputChange}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <p>{user.additionalInfo?.bio || "No bio information provided yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>
                  Manage your security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="outline">Not Enabled</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts when new logins are detected
                      </p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Privacy</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage how your data is used and shared
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

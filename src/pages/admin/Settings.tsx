import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { Save, RefreshCw, Megaphone, Bell, Trash2, Plus, Check, X } from "lucide-react";
import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  Announcement 
} from "@/integrations/supabase/announcements";

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAnnouncementForm, setShowNewAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);

  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true);
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error loading announcements:", error);
        toast({
          variant: "destructive",
          title: "Failed to load announcements",
          description: "There was an error loading the announcements. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "announcements") {
      loadAnnouncements();
    }
  }, [activeTab]);

  const notificationForm = useForm({
    defaultValues: {
      enableEmailNotifications: true,
      enableSystemNotifications: true,
      dailyDigest: false,
      notifyNewUsers: true,
      notifySystemUpdates: true,
      notifySecurityAlerts: true,
    }
  });

  const announcementForm = useForm({
    defaultValues: {
      title: "",
      message: "",
      status: "active" as "active" | "scheduled" | "expired",
      date: new Date().toISOString().split('T')[0],
    }
  });

  const handleNotificationSubmit = (data: any) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("Notification settings saved:", data);
      
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully.",
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  const handleAddAnnouncement = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (editingAnnouncement !== null) {
        const updated = await updateAnnouncement(editingAnnouncement, data);
        
        if (updated) {
          setAnnouncements(announcements.map(a => 
            a.id === editingAnnouncement ? { ...a, ...data } : a
          ));
          
          toast({
            title: "Announcement updated",
            description: "The announcement has been updated successfully.",
          });
          
          setEditingAnnouncement(null);
        } else {
          throw new Error("Failed to update announcement");
        }
      } else {
        const created = await createAnnouncement(data);
        
        if (created) {
          setAnnouncements([created, ...announcements]);
          
          toast({
            title: "Announcement created",
            description: "A new announcement has been created successfully.",
          });
        } else {
          throw new Error("Failed to create announcement");
        }
      }
      
      setShowNewAnnouncementForm(false);
      announcementForm.reset({
        title: "",
        message: "",
        status: "active",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error with announcement:", error);
      toast({
        variant: "destructive",
        title: "Operation failed",
        description: "There was an error processing your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const success = await deleteAnnouncement(id);
      
      if (success) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        
        toast({
          title: "Announcement deleted",
          description: "The announcement has been removed successfully.",
        });
      } else {
        throw new Error("Failed to delete announcement");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the announcement. Please try again.",
      });
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    announcementForm.reset({
      title: announcement.title,
      message: announcement.message,
      status: announcement.status,
      date: announcement.date,
    });
    
    setEditingAnnouncement(announcement.id);
    setShowNewAnnouncementForm(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements & Notifications</h1>
            <p className="text-muted-foreground">
              Manage system announcements and notification preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="announcements" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="announcements">
              <Megaphone className="mr-2 h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="announcements" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    System Announcements
                  </CardTitle>
                  <CardDescription>
                    Create and manage announcements for all users
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    announcementForm.reset({
                      title: "",
                      message: "",
                      status: "active",
                      date: new Date().toISOString().split('T')[0],
                    });
                    setEditingAnnouncement(null);
                    setShowNewAnnouncementForm(!showNewAnnouncementForm);
                  }}
                >
                  {showNewAnnouncementForm ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      New Announcement
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {showNewAnnouncementForm && (
                  <Card className="mb-6 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {editingAnnouncement !== null ? "Edit Announcement" : "Create New Announcement"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...announcementForm}>
                        <form onSubmit={announcementForm.handleSubmit(handleAddAnnouncement)} className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={announcementForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Announcement Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter title" />
                                  </FormControl>
                                  <FormDescription>
                                    A short, descriptive title
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={announcementForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Display Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    When this announcement will be displayed
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={announcementForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Announcement Message</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Enter announcement message" rows={3} />
                                </FormControl>
                                <FormDescription>
                                  The full announcement text that will be displayed to users
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={announcementForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="active">Active</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="expired">Expired</option>
                                  </select>
                                </FormControl>
                                <FormDescription>
                                  Active announcements are visible to all users
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-4">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                announcementForm.reset();
                                setShowNewAnnouncementForm(false);
                                setEditingAnnouncement(null);
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              <Save className="mr-2 h-4 w-4" />
                              {isSubmitting ? "Saving..." : (editingAnnouncement !== null ? "Update Announcement" : "Save Announcement")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Title</TableHead>
                        <TableHead className="hidden md:table-cell">Message</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex justify-center">
                              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : announcements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No announcements available. Create your first announcement.
                          </TableCell>
                        </TableRow>
                      ) : (
                        announcements.map((announcement) => (
                          <TableRow key={announcement.id}>
                            <TableCell className="font-medium">{announcement.title}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {announcement.message.length > 60 
                                ? `${announcement.message.substring(0, 60)}...` 
                                : announcement.message}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                announcement.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : announcement.status === 'scheduled' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{announcement.date}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditAnnouncement(announcement)}
                                >
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Channels</h3>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={notificationForm.control}
                          name="enableEmailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Send notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="enableSystemNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>In-App Notifications</FormLabel>
                                <FormDescription>
                                  Show notifications in the application
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={notificationForm.control}
                        name="dailyDigest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Daily Digest</FormLabel>
                              <FormDescription>
                                Send a daily summary instead of individual notifications
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifyNewUsers"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>New User Registrations</FormLabel>
                              <FormDescription>
                                Notify when new users register
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifySystemUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>System Updates</FormLabel>
                              <FormDescription>
                                Notify about system updates and maintenance
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifySecurityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Security Alerts</FormLabel>
                              <FormDescription>
                                Notify about security-related events
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => notificationForm.reset()}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;


import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { Save, RefreshCw, Shield } from "lucide-react";

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // System settings form
  const systemForm = useForm({
    defaultValues: {
      enableRegistration: true,
      requireEmailVerification: true,
      systemName: "NGO Operations Hub",
      systemDescription: "Authentication & Access Control System",
    }
  });

  // Notifications settings form
  const notificationForm = useForm({
    defaultValues: {
      enableEmailNotifications: true,
      notificationFromEmail: "noreply@ngo.org",
      emailFooter: "This is an automated message from the NGO Operations Hub. Please do not reply to this email.",
    }
  });

  const handleSystemSubmit = (data: any) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("System settings saved:", data);
      
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  const handleNotificationSubmit = (data: any) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Notification settings saved:", data);
      
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully.",
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">
              Configure global settings for the application
            </p>
          </div>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Manage core system settings and behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...systemForm}>
                  <form onSubmit={systemForm.handleSubmit(handleSystemSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={systemForm.control}
                        name="systemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter system name" />
                            </FormControl>
                            <FormDescription>
                              The name displayed throughout the application
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="systemDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter system description" />
                            </FormControl>
                            <FormDescription>
                              Brief description of the system's purpose
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={systemForm.control}
                        name="enableRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Registration</FormLabel>
                              <FormDescription>
                                Allow new users to register accounts
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
                        control={systemForm.control}
                        name="requireEmailVerification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Require Email Verification</FormLabel>
                              <FormDescription>
                                Users must verify email before login
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
                        onClick={() => systemForm.reset()}
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
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure system-wide notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="enableEmailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>
                              Enable system email notifications
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
                      name="notificationFromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification From Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="noreply@example.com" />
                          </FormControl>
                          <FormDescription>
                            The email address that appears in the From field
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="emailFooter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Footer Text</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter footer text for all emails" rows={3} />
                          </FormControl>
                          <FormDescription>
                            This text will appear at the bottom of all system emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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

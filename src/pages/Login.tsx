
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardRoute } from "@/utils/permissions";
import { Shield, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingDemoUsers, setIsCreatingDemoUsers] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      
      // The auth state will be updated by the AuthContext
      // After login, check if the user is authenticated and redirect
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Get user profile to determine role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (!error && profile) {
          navigate(getDashboardRoute(profile.role as UserRole));
        } else {
          // Fallback to admin dashboard if profile fetch fails
          navigate('/admin');
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid login credentials. Have you created the demo users yet?");
      } else {
        setError(err.message || "Failed to login. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDemoUsers = async () => {
    setIsCreatingDemoUsers(true);
    try {
      // Create demo users in Supabase
      const demoUsers = [
        { email: "admin@ngo.org", password: "admin123", role: "admin", fullName: "Admin User" },
        { email: "staff@ngo.org", password: "staff123", role: "staff", fullName: "Staff User" },
        { email: "volunteer@ngo.org", password: "volunteer123", role: "volunteer", fullName: "Volunteer User" },
        { email: "beneficiary@example.com", password: "beneficiary123", role: "beneficiary", fullName: "Beneficiary User" }
      ];

      let createdCount = 0;
      
      for (const user of demoUsers) {
        const { error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.fullName,
              role: user.role
            }
          }
        });

        if (!error) {
          createdCount++;
        } else if (!error.message.includes("already registered")) {
          throw error;
        }
      }
      
      toast({
        title: "Demo users created",
        description: `${createdCount} demo users have been created successfully.`,
      });
      
    } catch (err: any) {
      console.error("Error creating demo users:", err);
      toast({
        variant: "destructive",
        title: "Failed to create demo users",
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsCreatingDemoUsers(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted to-background p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">NGO Operations Hub</h1>
          <p className="text-muted-foreground mt-2">Authentication & Access Control System</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <CardDescription>Enter your email and password to access the system</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>{error}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Authenticating..." : "Log in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <div className="bg-card p-4 rounded border">
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Info className="h-4 w-4" />
              <div className="font-medium">Demo Accounts</div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p>The demo accounts shown below need to be created before you can use them.</p>
              <p>Click the button below to create these accounts in your Supabase project.</p>
            </div>

            <Button
              onClick={createDemoUsers}
              variant="outline"
              className="w-full mb-4"
              disabled={isCreatingDemoUsers}
            >
              {isCreatingDemoUsers ? "Creating Demo Users..." : "Create Demo Users"}
            </Button>
            
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="bg-card border p-2 rounded text-xs">
                <div className="font-semibold mb-1">Admin</div>
                <div>admin@ngo.org</div>
                <div>admin123</div>
              </div>
              <div className="bg-card border p-2 rounded text-xs">
                <div className="font-semibold mb-1">Staff</div>
                <div>staff@ngo.org</div>
                <div>staff123</div>
              </div>
              <div className="bg-card border p-2 rounded text-xs">
                <div className="font-semibold mb-1">Volunteer</div>
                <div>volunteer@ngo.org</div>
                <div>volunteer123</div>
              </div>
              <div className="bg-card border p-2 rounded text-xs">
                <div className="font-semibold mb-1">Beneficiary</div>
                <div>beneficiary@example.com</div>
                <div>beneficiary123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardRoute } from "@/utils/permissions";
import { Shield, AlertCircle, Info, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/utils/formValidation";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isCreatingDemoUsers, setIsCreatingDemoUsers] = useState(false);
  const [customRole, setCustomRole] = useState<UserRole>("admin");
  const {
    login,
    user
  } = useAuth();
  const navigate = useNavigate();
  
  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            errors[error.path[0]] = error.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session) {
        const {
          data: profile,
          error
        } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
        if (!error && profile) {
          navigate(getDashboardRoute(profile.role as UserRole));
        } else {
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
      const demoUsers = [{
        email: `${customRole}@ngo.org`,
        password: `${customRole}123`,
        role: customRole,
        fullName: `${customRole.charAt(0).toUpperCase() + customRole.slice(1)} User`
      }];
      let createdCount = 0;
      for (const user of demoUsers) {
        const {
          error
        } = await supabase.auth.signUp({
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
          toast({
            title: "Demo user created",
            description: `${user.fullName} has been created successfully.`
          });
        } else if (!error.message.includes("already registered")) {
          throw error;
        }
      }
    } catch (err: any) {
      console.error("Error creating demo users:", err);
      toast({
        variant: "destructive",
        title: "Failed to create demo users",
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsCreatingDemoUsers(false);
    }
  };

  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted to-background p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="rounded-full bg-primary p-3">
                <Shield className="h-10 w-10 text-primary-foreground" />
              </div>
              <Heart className="h-4 w-4 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">NayeeUmeed</h1>
          <p className="text-muted-foreground mt-2">Authentication & Access Control System</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <CardDescription>Enter your email and password to access the system</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>{error}</div>
                </div>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className={`w-full ${validationErrors.email ? 'border-destructive' : ''}`} 
                />
                {validationErrors.email && (
                  <p className="text-sm font-medium text-destructive mt-1">{validationErrors.email}</p>
                )}
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
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className={`w-full ${validationErrors.password ? 'border-destructive' : ''}`} 
                />
                {validationErrors.password && (
                  <p className="text-sm font-medium text-destructive mt-1">{validationErrors.password}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Authenticating..." : "Log in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-sm text-muted-foreground">
          
        </div>
      </div>
    </div>;
};

export default Login;

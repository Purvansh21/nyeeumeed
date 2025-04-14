
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading application..." 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted to-background p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="rounded-full bg-primary/30 p-3 mb-4 animate-pulse">
          <Shield className="h-10 w-10 text-primary/50" />
        </div>
        <h1 className="text-3xl font-bold text-primary/70 mb-2">NGO Operations Hub</h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        
        <div className="w-full space-y-3">
          <Skeleton className="h-12 w-full animate-pulse" />
          <Skeleton className="h-32 w-full animate-pulse" />
          <Skeleton className="h-8 w-2/3 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

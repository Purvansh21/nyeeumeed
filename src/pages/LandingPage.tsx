import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Users, HelpingHand, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Video file path:", "/idk.mp4");
    console.log("Initial video loaded state:", isVideoLoaded);
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setIsVideoLoaded(true);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = e.currentTarget.error;
    console.error("Video loading error:", error?.message || "Unknown error");
    setVideoError(error?.message || "Failed to load video");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section with Video Background */}
      <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 md:px-8">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-[1]"></div>
          <video 
            className="absolute w-full h-full object-cover z-0"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            style={{ opacity: isVideoLoaded ? 1 : 0 }}
          >
            <source src="/idk.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Fallback image in case video doesn't load */}
          <img 
            src="https://images.unsplash.com/photo-1501435631935-a98b1f778522?q=80&w=2070&auto=format&fit=crop"
            alt="Fallback hero image - Community support"
            className="absolute w-full h-full object-cover z-0"
            style={{ opacity: isVideoLoaded ? 0 : 1 }}
          />
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-4 z-[2]">
              <p>Video Error: {videoError}</p>
            </div>
          )}
        </div>
        
        <div className="relative max-w-4xl mx-auto z-[2]">
          {/* Logo & Name */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative bg-white/90 p-5 rounded-full shadow-lg">
              <Shield className="h-16 w-16 text-primary" />
              <Heart className="h-6 w-6 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">NayeeUmeed</h1>
          <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md font-medium text-shadow">Empowering Communities, Transforming Lives</p>
          
          <Button 
            onClick={handleGetStarted} 
            size="lg" 
            className="px-8 py-6 text-lg rounded-full group bg-white text-primary hover:bg-primary hover:text-white transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How We Make A Difference</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<HelpingHand className="h-10 w-10 text-primary" />}
              title="Support Services"
              description="Providing essential support services to those in need, ensuring access to resources and care."
              image="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Community Building"
              description="Creating connections and fostering community engagement through volunteer opportunities."
              image="https://images.unsplash.com/photo-1593113616828-6f22bca04804?q=80&w=2070&auto=format&fit=crop"
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Resource Management"
              description="Efficiently managing and distributing resources to maximize impact and reach."
              image="https://images.unsplash.com/photo-1617450365226-9bf28c04e130?q=80&w=2070&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-primary text-primary-foreground relative">
        <div className="absolute inset-0 opacity-10 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469571486292-b53601021a68?q=80&w=2070&auto=format&fit=crop" 
            alt="Background pattern" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us Today</h2>
          <p className="text-lg md:text-xl mb-10 opacity-90">Be part of our mission to create positive change and transform lives in communities across the region.</p>
          <Button 
            onClick={handleGetStarted} 
            variant="secondary" 
            size="lg" 
            className="px-8 rounded-full"
          >
            Sign In to Platform
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold text-primary">NayeeUmeed</span>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} NayeeUmeed. All rights reserved. | Powered by <span className="font-medium">MarketinLab</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, image }) => {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105">
      <div className="h-40 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;

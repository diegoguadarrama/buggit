import { TaskBoard } from "@/components/TaskBoard";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { PricingDialog } from "@/components/PricingDialog";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UserProvider } from "@/components/UserContext";
import { useAuth } from "@/components/AuthProvider";
import { useProject } from "@/components/ProjectContext";
import { NoProjectsFound } from "@/components/NoProjectsFound";

const Index = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const location = useLocation();
  const { user } = useAuth();
  const { projects } = useProject();

  useEffect(() => {
    if (location.state?.openProfile) {
      setProfileOpen(true);
    }
  }, [location.state]);

  const handleProfileClick = (tab?: string) => {
    if (tab === 'subscription') {
      setPricingOpen(true);
    } else {
      setActiveTab(tab || 'profile');
      setProfileOpen(true);
    }
  };

  const handlePricingClose = () => {
    setPricingOpen(false);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  return (
    <UserProvider value={{ user }}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {projects.length === 0 ? (
          <NoProjectsFound onCreateProject={() => setProfileOpen(true)} />
        ) : (
          <TaskBoard onProfileClick={handleProfileClick} />
        )}
        {profileOpen && (
          <ProfileSidebar 
            open={profileOpen} 
            onOpenChange={handleProfileClose}
            defaultTab={activeTab}
          />
        )}
        {pricingOpen && (
          <PricingDialog
            open={pricingOpen}
            onOpenChange={handlePricingClose}
          />
        )}
      </div>
    </UserProvider>
  );
};

export default Index;
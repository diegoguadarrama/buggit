import { TaskBoard } from "@/components/TaskBoard";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openProfile) {
      setProfileOpen(true);
    }
  }, [location.state]);

  const handleProfileClick = (tab?: string) => {
    setActiveTab(tab || 'profile');
    setProfileOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskBoard onProfileClick={handleProfileClick} />
      <ProfileSidebar 
        open={profileOpen} 
        onOpenChange={setProfileOpen}
        defaultTab={activeTab}
      />
    </div>
  );
};

export default Index;
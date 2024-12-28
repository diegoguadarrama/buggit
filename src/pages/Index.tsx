import { TaskBoard } from "@/components/TaskBoard";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { PricingDialog } from "@/components/PricingDialog";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const location = useLocation();

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
    <div className="min-h-screen bg-gray-50">
      <TaskBoard onProfileClick={handleProfileClick} />
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
  );
};

export default Index;
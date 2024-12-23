import { TaskBoard } from "@/components/TaskBoard";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  // Open profile sidebar if we're redirected from /profile
  useState(() => {
    if (location.state?.openProfile) {
      setProfileOpen(true);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskBoard onProfileClick={() => setProfileOpen(true)} />
      <ProfileSidebar open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default Index;
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ProfileSidebar } from "@/components/ProfileSidebar";

const Profile = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page since we're now using a sidebar
    navigate("/");
  }, [navigate]);

  return <ProfileSidebar open={true} onOpenChange={() => navigate("/")} />;
};

export default Profile;
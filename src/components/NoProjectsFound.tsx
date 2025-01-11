import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthProvider";

interface NoProjectsFoundProps {
  onCreateProject: () => void;
}

export const NoProjectsFound = ({ onCreateProject }: NoProjectsFoundProps) => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  
  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute top-4 right-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
        onClick={signOut}
      >
        <span>Sign out</span>
        <LogOut className="h-4 w-4" />
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">{t('project.welcome')}</h2>
          <p className="text-gray-600">
            {t('project.description')}
          </p>
          <Button onClick={onCreateProject} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t('project.createFirst')}
          </Button>
        </div>
      </div>
    </div>
  );
};
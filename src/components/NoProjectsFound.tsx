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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">{t('project.welcome')}</h2>
        <p className="text-gray-600">
          {t('project.description')}
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={onCreateProject} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {t('project.createFirst')}
          </Button>
          <Button 
            onClick={signOut} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
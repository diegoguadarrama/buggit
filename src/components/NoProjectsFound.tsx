import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NoProjectsFoundProps {
  onCreateProject: () => void;
}

export const NoProjectsFound = ({ onCreateProject }: NoProjectsFoundProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen relative">
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
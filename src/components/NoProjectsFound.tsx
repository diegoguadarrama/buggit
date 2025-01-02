import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NoProjectsFoundProps {
  onCreateProject: () => void;
}

export const NoProjectsFound = ({ onCreateProject }: NoProjectsFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">Welcome to Buggit</h2>
        <p className="text-gray-600">
          Get started by creating your first project. Projects help you organize your tasks and track progress effectively.
        </p>
        <Button onClick={onCreateProject} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Project
        </Button>
      </div>
    </div>
  );
};

import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";

interface TaskAttachmentProps {
  image: string;
  title: string;
}

export const TaskAttachment = ({ image, title }: TaskAttachmentProps) => {
  const handlePreventPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div 
          className="relative mb-3 cursor-pointer group task-attachment"
          onClick={handlePreventPropagation}
        >
          <img 
            src={image} 
            alt={title}
            className="w-full h-32 object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center">
            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl p-2"
      >
        <div 
          className="max-h-[80vh] overflow-auto" 
          onClick={handlePreventPropagation}
        >
          <img 
            src={image} 
            alt={title}
            className="w-full h-auto object-contain max-h-[70vh] rounded-md" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

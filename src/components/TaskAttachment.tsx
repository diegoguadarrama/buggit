import { Eye, X } from 'lucide-react';
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
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop the event from bubbling up to prevent task sidebar from opening
  };

  const handlePreventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div 
          className="relative mb-3 cursor-pointer group"
          onClick={handleImageClick}
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
      <DialogContent className="w-fit p-0 bg-transparent border-none" onClick={handlePreventPropagation} onPointerDownOutside={handlePreventPropagation}
        onInteractOutside={handlePreventPropagation}>
        <div className="relative group">
          <img 
            src={image} 
            alt={title}
            className="max-h-[80vh] w-auto object-contain"
            onClick={handlePreventPropagation}
          />
          <button 
            onClick={handlePreventPropagation}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-50"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

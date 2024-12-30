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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative mb-3 cursor-pointer group">
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
      <DialogContent className="max-w-4xl">
        <img 
          src={image} 
          alt={title}
          className="w-full h-auto"
        />
      </DialogContent>
    </Dialog>
  );
};
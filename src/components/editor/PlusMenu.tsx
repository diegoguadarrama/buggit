import React from 'react';
import { Image, Code } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface PlusMenuProps {
  onImageClick: () => void;
  onCodeBlockClick: () => void;
}

export const PlusMenu = ({ onImageClick, onCodeBlockClick }: PlusMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={onImageClick} className="gap-2">
          <Image className="h-4 w-4" />
          <span>Add Image</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCodeBlockClick} className="gap-2">
          <Code className="h-4 w-4" />
          <span>Add Code Block</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  placeholder?: string;
  initialContent?: string;
  autoFocus?: boolean;
}

export function CommentForm({ 
  onSubmit, 
  placeholder = "Write a comment...", 
  initialContent = "", 
  autoFocus = false 
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px]"
        autoFocus={autoFocus}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim()}>
          Post
        </Button>
      </div>
    </form>
  );
}
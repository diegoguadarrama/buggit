import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Reply } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  task_id: string;
  user_id: string;
  parent_id: string | null;
  profile: {
    full_name: string | null;
    email: string;
  };
}

interface TaskCommentsProps {
  taskId: string;
}

interface CommentFormProps {
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  placeholder?: string;
  initialContent?: string;
  autoFocus?: boolean;
}

const CommentForm = ({ onSubmit, placeholder = "Write a comment...", initialContent = "", autoFocus = false }: CommentFormProps) => {
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
};

const CommentThread = ({ 
  comment, 
  replies, 
  onReply 
}: { 
  comment: Comment; 
  replies: Comment[];
  onReply: (parentId: string) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {comment.profile.full_name?.[0] || comment.profile.email[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm font-medium">
                {comment.profile.full_name || comment.profile.email}
              </p>
              <time className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), 'MMM d, h:mm a')}
              </time>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 h-6 text-xs"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>
      
      {replies.length > 0 && (
        <div className="ml-11 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  {reply.profile.full_name?.[0] || reply.profile.email[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted p-2 rounded-lg">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-medium">
                      {reply.profile.full_name || reply.profile.email}
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                    </time>
                  </div>
                  <p className="text-sm mt-1">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: comments, refetch } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      console.log('Fetching comments for task:', taskId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          task_id,
          parent_id,
          profile:profiles(full_name, email)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      console.log('Fetched comments:', data);
      return data as Comment[];
    },
  });

  const handleSubmit = async (content: string, parentId?: string) => {
    if (!user) return;

    try {
      console.log('Posting new comment:', {
        content,
        task_id: taskId,
        user_id: user.id,
        parent_id: parentId,
      });

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            task_id: taskId,
            user_id: user.id,
            parent_id: parentId,
          },
        ]);

      if (error) {
        console.error('Error posting comment:', error);
        toast({
          title: "Error posting comment",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
      
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  // Organize comments into threads
  const threads = comments?.reduce((acc, comment) => {
    if (!comment.parent_id) {
      const replies = comments.filter(reply => reply.parent_id === comment.id);
      acc.push({ comment, replies });
    }
    return acc;
  }, [] as { comment: Comment; replies: Comment[] }[]) || [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comments</h3>
      
      <div className="space-y-6 max-h-[300px] overflow-y-auto">
        {threads.map(({ comment, replies }) => (
          <div key={comment.id}>
            <CommentThread 
              comment={comment}
              replies={replies}
              onReply={handleReply}
            />
            {replyingTo === comment.id && (
              <div className="ml-11 mt-2">
                <CommentForm
                  onSubmit={(content) => handleSubmit(content, comment.id)}
                  placeholder="Write a reply..."
                  autoFocus
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <CommentForm onSubmit={(content) => handleSubmit(content)} />
    </div>
  );
}
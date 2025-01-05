import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { CommentForm } from "./CommentForm";
import { CommentThread } from "./CommentThread";

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
    avatar_url: string | null;
  };
}

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: comments = [], refetch } = useQuery({
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
          profile:profiles(full_name, email, avatar_url)
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

  // Organize comments into threads
  const threads = comments.reduce((acc, comment) => {
    if (!comment.parent_id) {
      const replies = comments.filter(reply => reply.parent_id === comment.id);
      acc.push({ comment, replies });
    }
    return acc;
  }, [] as Array<{ comment: Comment; replies: Comment[] }>);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comments</h3>
      
      <div className="space-y-6 max-h-[300px] overflow-y-auto">
        {threads.map(({ comment, replies }) => (
          <CommentThread 
            key={comment.id}
            comment={comment}
            replies={replies}
            onReply={setReplyingTo}
            replyingTo={replyingTo}
            onSubmitReply={handleSubmit}
            allComments={comments}
          />
        ))}
      </div>

      <CommentForm onSubmit={(content) => handleSubmit(content)} />
    </div>
  );
}
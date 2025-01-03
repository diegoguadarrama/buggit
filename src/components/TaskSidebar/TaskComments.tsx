import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  task_id: string;
  user_id: string;
  profile: {
    full_name: string | null;
    email: string;
  };
}

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      console.log('Posting new comment:', {
        content: newComment,
        task_id: taskId,
        user_id: user.id,
      });

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            task_id: taskId,
            user_id: user.id,
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
      setNewComment("");
      refetch();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comments</h3>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3">
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
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  );
}

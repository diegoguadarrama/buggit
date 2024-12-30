import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  task_id: string;
  profile?: {
    full_name?: string;
    email: string;
  };
}

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  
  const { data: comments, refetch } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

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
      return;
    }

    setNewComment("");
    refetch();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comments</h3>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {comment.profile?.full_name?.[0] || comment.profile?.email[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-medium">
                    {comment.profile?.full_name || comment.profile?.email}
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
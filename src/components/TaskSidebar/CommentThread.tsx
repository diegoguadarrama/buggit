import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import { format } from "date-fns";
import { CommentForm } from "./CommentForm";

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

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  onSubmitReply: (content: string, parentId: string) => Promise<void>;
  allComments: Comment[]; // Add this to access all comments
}

export function CommentThread({ 
  comment, 
  replies, 
  onReply,
  replyingTo,
  onSubmitReply,
  allComments
}: CommentThreadProps) {
  // Get all replies for this comment, including nested ones
  const getAllReplies = (commentId: string): Comment[] => {
    const directReplies = allComments.filter(c => c.parent_id === commentId);
    return directReplies.reduce((acc, reply) => {
      return [...acc, reply, ...getAllReplies(reply.id)];
    }, [] as Comment[]);
  };

  const allReplies = getAllReplies(comment.id);

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div className="flex gap-3" key={comment.id}>
      <Avatar className={isReply ? "h-6 w-6" : "h-8 w-8"}>
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
        {replyingTo === comment.id && (
          <div className="mt-2">
            <CommentForm
              onSubmit={(content) => onSubmitReply(content, comment.id)}
              placeholder="Write a reply..."
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {renderComment(comment)}
      {allReplies.length > 0 && (
        <div className="ml-11 space-y-3">
          {allReplies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );
}